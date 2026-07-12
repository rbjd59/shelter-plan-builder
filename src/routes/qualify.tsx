import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { usePlaidLink } from "react-plaid-link";
import {
  assessQualification,
  attachQualifyIdentity,
  finalizeQualifySubmission,
} from "@/lib/qualify.functions";
import {
  createIdentityVerification,
  getIdentityVerification,
  createQualifyUploadUrl,
  saveQualifyDocumentPath,
  type QualifyDocKind,
} from "@/lib/qualify-identity.functions";
import { createPlaidLinkToken, exchangePlaidPublicToken } from "@/lib/plaid.functions";
import { supabase } from "@/integrations/supabase/client";
import { useLang, type Lang } from "@/context/LanguageContext";


export const Route = createFileRoute("/qualify")({
  head: () => ({
    meta: [
      { title: "See if you qualify — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Check if you qualify for our no-cost or low-cost pre-detention defense program. A quick income and household questionnaire.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QualifyPage,
});

type Step = 1 | 2 | 3 | 4;

const emptyIntake = {
  firstName: "",
  state: "",
  householdSize: 1,
  dependentsCount: 0,
  childrenAges: "",
  usCitizenChildren: false,
  primaryEarner: false,
  yearsInUsSelf: 0,
  yearsInUsChildren: 0,
  yearsWorking: 0,
  jobType: "",
  payFrequency: "monthly" as "daily" | "weekly" | "biweekly" | "monthly",
  payAmountUsd: 0,
  rent: 0,
  food: 0,
  medicine: 0,
  daycare: 0,
  schoolSupplies: 0,
  transportation: 0,
  restaurants: 0,
  childrenEntertainment: 0,
  otherExpenses: 0,
};

function QualifyPage() {
  const navigate = useNavigate();
  const assess = useServerFn(assessQualification);
  const attachIdentity = useServerFn(attachQualifyIdentity);
  const finalize = useServerFn(finalizeQualifySubmission);
  const createToken = useServerFn(createPlaidLinkToken);
  const exchange = useServerFn(exchangePlaidPublicToken);

  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const [intake, setIntake] = useState(emptyIntake);
  const [submissionId, setSubmissionId] = useState("");
  const [tier, setTier] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [assessmentReasoning, setAssessmentReasoning] = useState("");
  const [declined, setDeclined] = useState(false);

  // Step 2 identity + docs
  const [identity, setIdentity] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [verifStatus, setVerifStatus] = useState<string>("not_started");
  const [verifBusy, setVerifBusy] = useState(false);
  const [incomeDocKind, setIncomeDocKind] = useState<QualifyDocKind>("pay_stub");
  const [supportLetterPath, setSupportLetterPath] = useState("");
  const [incomeDocPath, setIncomeDocPath] = useState("");
  const [uploadingKind, setUploadingKind] = useState<QualifyDocKind | "">("");
  const verifPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createVerif = useServerFn(createIdentityVerification);
  const getVerif = useServerFn(getIdentityVerification);
  const createUploadUrl = useServerFn(createQualifyUploadUrl);
  const saveDocPath = useServerFn(saveQualifyDocumentPath);

  // Step 3 plaid
  const [linkToken, setLinkToken] = useState("");
  const [plaidLinked, setPlaidLinked] = useState(false);

  // Step 4 attestation
  const [signature, setSignature] = useState("");
  const [attestChecked, setAttestChecked] = useState(false);

  /* --------------- step 1 --------------- */
  const submitIntake = async () => {
    setError("");
    if (!intake.firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (!intake.state.trim()) {
      setError("Please enter your state.");
      return;
    }
    setBusy(true);
    try {
      const res = await assess({ data: intake });
      setSubmissionId(res.submissionId);
      setTier(res.tier);
      setDiscountPct(res.discountPct ?? 0);
      setAssessmentReasoning(res.reasoning);
      if (!res.qualifies) {
        setDeclined(true);
      } else {
        setStep(2);
      }
    } catch (e: any) {
      setError(e?.message || "Could not process your answers. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /* --------------- step 2 --------------- */
  const startVerification = async () => {
    setError("");
    if (identity.fullName.trim().length < 2) {
      setError("Please enter your full legal name before starting ID verification.");
      return;
    }
    setVerifBusy(true);
    try {
      const res = await createVerif({
        data: {
          submissionId,
          returnUrl: typeof window !== "undefined"
            ? `${window.location.origin}/qualify?verified=1`
            : undefined,
        },
      });
      if (!res.ok) throw new Error(res.error);
      setVerifStatus(res.status || "processing");
      if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
      // Start polling every 4s until verified/failed.
      if (verifPollRef.current) clearInterval(verifPollRef.current);
      verifPollRef.current = setInterval(async () => {
        try {
          const s = await getVerif({ data: { submissionId } });
          if (s.ok && s.status) {
            setVerifStatus(s.status);
            if (s.status === "verified" || s.status === "canceled") {
              if (verifPollRef.current) clearInterval(verifPollRef.current);
              verifPollRef.current = null;
            }
          }
        } catch {}
      }, 4000);
    } catch (e: any) {
      setError(e?.message || "Could not start ID verification.");
    } finally {
      setVerifBusy(false);
    }
  };

  useEffect(() => {
    return () => {
      if (verifPollRef.current) clearInterval(verifPollRef.current);
    };
  }, []);

  const uploadDoc = async (
    kind: QualifyDocKind,
    file: File,
  ): Promise<string | null> => {
    setError("");
    setUploadingKind(kind);
    try {
      const sig = await createUploadUrl({
        data: { submissionId, kind, filename: file.name },
      });
      if (!sig.ok) throw new Error(sig.error);
      const { error: upErr } = await supabase.storage
        .from("qualify-docs")
        .uploadToSignedUrl(sig.path, sig.token, file);
      if (upErr) throw upErr;
      const saved = await saveDocPath({
        data: { submissionId, kind, path: sig.path },
      });
      if (!saved.ok) throw new Error(saved.error);
      return sig.path;
    } catch (e: any) {
      setError(e?.message || "Upload failed. Please try again.");
      return null;
    } finally {
      setUploadingKind("");
    }
  };

  const submitIdentity = async () => {
    setError("");
    if (identity.fullName.trim().length < 2) {
      setError("Please enter your full legal name.");
      return;
    }
    if (verifStatus !== "verified") {
      setError("Please complete the ID + selfie verification on your phone before continuing.");
      return;
    }
    if (!supportLetterPath) {
      setError("Please upload your church / community support letter.");
      return;
    }
    if (!incomeDocPath) {
      setError("Please upload one income document (pay stub, tax return, or benefits letter).");
      return;
    }
    setBusy(true);
    try {
      await attachIdentity({ data: { submissionId, ...identity } });
      setStep(3);
    } catch (e: any) {
      setError(e?.message || "Could not save your info.");
    } finally {
      setBusy(false);
    }
  };

  /* --------------- step 3 (plaid) --------------- */
  const startPlaid = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await createToken({
        data: { submissionId, legalName: identity.fullName || intake.firstName },
      });
      setLinkToken(res.linkToken);
    } catch (e: any) {
      setError(e?.message || "Failed to start bank verification.");
    } finally {
      setBusy(false);
    }
  };

  const onPlaidSuccess = useCallback(
    async (publicToken: string) => {
      setBusy(true);
      try {
        await exchange({ data: { submissionId, publicToken } });
        setPlaidLinked(true);
      } catch (e: any) {
        setError(e?.message || "Bank verification failed to save.");
      } finally {
        setBusy(false);
      }
    },
    [exchange, submissionId],
  );

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token: linkToken || null,
    onSuccess: (public_token) => void onPlaidSuccess(public_token),
  });

  useEffect(() => {
    if (linkToken && plaidReady) openPlaid();
  }, [linkToken, plaidReady, openPlaid]);

  /* --------------- step 4 --------------- */
  const submitAttestation = async () => {
    setError("");
    if (!attestChecked || signature.trim().length < 2) {
      setError("Please type your full name and check the attestation box.");
      return;
    }
    setBusy(true);
    try {
      await finalize({
        data: { submissionId, attestationSignature: signature.trim() },
      });
      // Carry the reduced-cost discount + submission id through to checkout.
      navigate({
        to: "/checkout",
        search: {
          lang: "en",
          discountPct: discountPct || undefined,
          submissionId: submissionId || undefined,
        },
      });
    } catch (e: any) {
      setError(e?.message || "Failed to finalize.");
    } finally {
      setBusy(false);
    }
  };

  /* --------------- declined view --------------- */
  if (declined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-lg bg-white shadow p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              You don't qualify for reduced-cost pricing — but you still need protection.
            </h1>
            <p className="text-gray-700 mb-4">
              Based on your answers, your household income is above the threshold
              for our no-cost or reduced-cost program.
            </p>
            <div className="rounded bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 mb-6">
              {assessmentReasoning}
            </div>

            <div className="rounded-lg border-2 border-red-700 bg-red-50 p-6 mb-6">
              <h2 className="text-xl font-bold text-red-900 mb-2">
                $199 Legal Defense Package
              </h2>
              <p className="text-gray-800 mb-3">
                Think of it like car insurance or medical insurance — you need{" "}
                <strong>ICE / Amiga insurance</strong>. If you or a family member is
                detained, this package activates a pre-built emergency defense
                packet that gets you out of detention <em>much</em> faster.
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mb-4 list-disc list-inside">
                <li>Pre-signed emergency legal documents ready to file</li>
                <li>Family + attorney notified the moment SOS is triggered</li>
                <li>Bond package prepared in advance</li>
                <li>Bilingual case tracking for your family</li>
              </ul>
              <Link
                to="/checkout"
                search={{ lang: "en" }}
                className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded"
              >
                Get the $199 package →
              </Link>
            </div>

            <button
              onClick={() => {
                setDeclined(false);
                setStep(1);
              }}
              className="text-sm text-gray-600 underline"
            >
              ← Re-check my answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <Link to="/" className="text-sm text-red-700 hover:underline">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">See if you qualify</h1>
        <p className="text-gray-600 mb-8">
          A quick questionnaire to see if you qualify for our no-cost or
          low-cost pre-detention defense program. Your information is
          confidential.
        </p>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= (n as Step)
                    ? "bg-red-700 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {n}
              </div>
              {n < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > (n as Step) ? "bg-red-700" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-white shadow p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Step 1 · Household & finances
                </h2>
                <p className="text-sm text-gray-600">
                  We only need your first name for now. Answer as accurately as
                  you can — this determines whether you qualify for no-cost or
                  low-cost help.
                </p>
              </div>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  About you
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="First name">
                    <input
                      className="input"
                      value={intake.firstName}
                      onChange={(e) =>
                        setIntake({ ...intake, firstName: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="State (US)">
                    <input
                      className="input"
                      maxLength={2}
                      placeholder="FL"
                      value={intake.state}
                      onChange={(e) =>
                        setIntake({ ...intake, state: e.target.value.toUpperCase() })
                      }
                    />
                  </Field>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Years you've lived in the U.S.">
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.yearsInUsSelf}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          yearsInUsSelf: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Years you've been working">
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.yearsWorking}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          yearsWorking: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Kind of work (e.g. construction, cleaning)">
                    <input
                      className="input"
                      value={intake.jobType}
                      onChange={(e) => setIntake({ ...intake, jobType: e.target.value })}
                    />
                  </Field>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  Household
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Household size">
                    <input
                      type="number"
                      min={1}
                      className="input"
                      value={intake.householdSize}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          householdSize: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Number of dependents">
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.dependentsCount}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          dependentsCount: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Years children have lived in U.S.">
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.yearsInUsChildren}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          yearsInUsChildren: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Ages of children (comma-separated)">
                  <input
                    className="input"
                    placeholder="e.g. 3, 7, 12"
                    value={intake.childrenAges}
                    onChange={(e) =>
                      setIntake({ ...intake, childrenAges: e.target.value })
                    }
                  />
                </Field>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={intake.usCitizenChildren}
                    onChange={(e) =>
                      setIntake({ ...intake, usCitizenChildren: e.target.checked })
                    }
                  />
                  <span>I have U.S.-citizen children (or children in the U.S.)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={intake.primaryEarner}
                    onChange={(e) =>
                      setIntake({ ...intake, primaryEarner: e.target.checked })
                    }
                  />
                  <span>I am the primary income earner in my household</span>
                </label>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  Income
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="How often are you paid?">
                    <select
                      className="input"
                      value={intake.payFrequency}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          payFrequency: e.target.value as typeof intake.payFrequency,
                        })
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 weeks</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </Field>
                  <Field label="Amount per pay period (USD)">
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.payAmountUsd}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          payAmountUsd: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  Monthly expenses (USD)
                </h3>
                <p className="text-xs text-gray-500 -mt-2">
                  Best estimates are fine. Enter 0 if it doesn't apply.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <ExpenseField
                    label="Rent / mortgage"
                    value={intake.rent}
                    onChange={(v) => setIntake({ ...intake, rent: v })}
                  />
                  <ExpenseField
                    label="Food (groceries)"
                    value={intake.food}
                    onChange={(v) => setIntake({ ...intake, food: v })}
                  />
                  <ExpenseField
                    label="Medicine"
                    value={intake.medicine}
                    onChange={(v) => setIntake({ ...intake, medicine: v })}
                  />
                  <ExpenseField
                    label="Daycare"
                    value={intake.daycare}
                    onChange={(v) => setIntake({ ...intake, daycare: v })}
                  />
                  <ExpenseField
                    label="School supplies"
                    value={intake.schoolSupplies}
                    onChange={(v) => setIntake({ ...intake, schoolSupplies: v })}
                  />
                  <ExpenseField
                    label="Transportation"
                    value={intake.transportation}
                    onChange={(v) => setIntake({ ...intake, transportation: v })}
                  />
                  <ExpenseField
                    label="Restaurants"
                    value={intake.restaurants}
                    onChange={(v) => setIntake({ ...intake, restaurants: v })}
                  />
                  <ExpenseField
                    label="Children entertainment"
                    value={intake.childrenEntertainment}
                    onChange={(v) => setIntake({ ...intake, childrenEntertainment: v })}
                  />
                  <ExpenseField
                    label="Other"
                    value={intake.otherExpenses}
                    onChange={(v) => setIntake({ ...intake, otherExpenses: v })}
                  />
                </div>
              </section>

              <button
                className="btn-primary w-full md:w-auto"
                disabled={busy}
                onClick={submitIntake}
              >
                {busy ? "Checking eligibility…" : "Check if I qualify →"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className={`rounded border p-4 text-sm ${tier === "nocost" ? "bg-green-50 border-green-300 text-green-900" : "bg-amber-50 border-amber-300 text-amber-900"}`}>
                {tier === "nocost" ? (
                  <>✓ <strong>You qualify for our NO-COST program.</strong> {assessmentReasoning}</>
                ) : (
                  <>✓ <strong>You qualify for a {discountPct}% discount</strong> off the standard package. {assessmentReasoning}</>
                )}
              </div>
              <h2 className="text-xl font-semibold">Step 2 · Identity & documents</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full legal name">
                  <input
                    className="input"
                    value={identity.fullName}
                    onChange={(e) =>
                      setIdentity({ ...identity, fullName: e.target.value })
                    }
                  />
                </Field>
                <Field label="Email (optional)">
                  <input
                    type="email"
                    className="input"
                    value={identity.email}
                    onChange={(e) =>
                      setIdentity({ ...identity, email: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Phone (optional)">
                <input
                  className="input"
                  value={identity.phone}
                  onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                />
              </Field>
              <p className="text-sm text-gray-600 pt-2">
                Paste a link to a hosted copy of each document. Native file
                uploads coming next.
              </p>
              <Field label="Government ID URL">
                <input
                  className="input"
                  placeholder="https://…"
                  value={identity.idDocumentUrl}
                  onChange={(e) =>
                    setIdentity({ ...identity, idDocumentUrl: e.target.value })
                  }
                />
              </Field>
              <Field label="Income document URL (pay stub, tax return, benefits letter)">
                <input
                  className="input"
                  placeholder="https://…"
                  value={identity.incomeDocumentUrl}
                  onChange={(e) =>
                    setIdentity({ ...identity, incomeDocumentUrl: e.target.value })
                  }
                />
              </Field>
              <Field label="Letter from church / nonprofit / food bank (optional but strengthens application)">
                <input
                  className="input"
                  placeholder="https://…"
                  value={identity.supportLetterUrl}
                  onChange={(e) =>
                    setIdentity({ ...identity, supportLetterUrl: e.target.value })
                  }
                />
              </Field>
              <div className="flex gap-3">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn-primary" disabled={busy} onClick={submitIdentity}>
                  {busy ? "Saving…" : "Continue →"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 3 · Bank verification</h2>
              <p className="text-sm text-gray-600">
                We use Plaid to confirm your income securely. We never see or
                store your bank password. Required to lock in no-cost pricing.
              </p>
              {plaidLinked ? (
                <div className="rounded bg-green-50 border border-green-300 px-4 py-3 text-green-800">
                  ✓ Bank successfully linked.
                </div>
              ) : (
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={startPlaid}
                >
                  {busy ? "Opening Plaid…" : "Link my bank securely"}
                </button>
              )}
              <div className="flex gap-3 pt-4">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button
                  className="btn-primary"
                  disabled={!plaidLinked}
                  onClick={() => setStep(4)}
                >
                  Continue →
                </button>
                <button
                  className="text-sm text-gray-500 underline"
                  onClick={() => setStep(4)}
                >
                  Skip (may reduce eligibility)
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 4 · Sworn attestation</h2>
              <div className="rounded bg-yellow-50 border border-yellow-300 p-4 text-sm text-yellow-900">
                <strong>Under penalty of perjury</strong>, I declare that the
                information I have provided — household size, income,
                dependents, expenses, and immigration situation — is true and
                correct to the best of my knowledge. I understand that
                providing false information to obtain reduced-cost legal
                services may be a federal offense and will result in immediate
                cancellation of services without refund.
              </div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={attestChecked}
                  onChange={(e) => setAttestChecked(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  I have read and agree to the sworn attestation above.
                </span>
              </label>
              <Field label="Type your full legal name as your signature">
                <input
                  className="input"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </Field>
              <div className="flex gap-3">
                <button className="btn-secondary" onClick={() => setStep(3)}>
                  ← Back
                </button>
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={submitAttestation}
                >
                  {busy ? "Submitting…" : "Submit & continue to checkout"}
                </button>
              </div>
              {tier && (
                <p className="text-sm text-gray-600 pt-2">
                  Preliminary tier:{" "}
                  <strong className="text-red-700">{tier.toUpperCase()}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.95rem;
          background: white;
        }
        .input:focus { outline: 2px solid #b91c1c; outline-offset: -1px; border-color: #b91c1c; }
        .btn-primary {
          background: #b91c1c; color: white; font-weight: 600;
          padding: 0.6rem 1.25rem; border-radius: 0.375rem;
          transition: background 0.15s;
        }
        .btn-primary:hover:not(:disabled) { background: #991b1b; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          background: #e5e7eb; color: #111827; font-weight: 600;
          padding: 0.6rem 1.25rem; border-radius: 0.375rem;
        }
        .btn-secondary:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function ExpenseField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          $
        </span>
        <input
          type="number"
          min={0}
          className="input pl-6"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </Field>
  );
}
