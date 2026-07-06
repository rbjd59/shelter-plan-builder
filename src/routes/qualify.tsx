import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { usePlaidLink } from "react-plaid-link";
import { createQualifySubmission, finalizeQualifySubmission } from "@/lib/qualify.functions";
import { createPlaidLinkToken, exchangePlaidPublicToken } from "@/lib/plaid.functions";

export const Route = createFileRoute("/qualify")({
  head: () => ({
    meta: [
      { title: "See if you qualify — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Check if you qualify for our no-cost or low-cost pre-detention defense program. Household size, income, ID, and bank verification.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QualifyPage,
});

type Step = 1 | 2 | 3 | 4;

function QualifyPage() {
  const navigate = useNavigate();
  const createSub = useServerFn(createQualifySubmission);
  const finalize = useServerFn(finalizeQualifySubmission);
  const createToken = useServerFn(createPlaidLinkToken);
  const exchange = useServerFn(exchangePlaidPublicToken);

  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // Step 1 form
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    householdSize: 1,
    dependentsCount: 0,
    usCitizenChildren: false,
    primaryEarner: false,
    monthlyIncomeUsd: 0,
    state: "",
  });

  // Working submission
  const [submissionId, setSubmissionId] = useState<string>("");
  const [tier, setTier] = useState<string>("");

  // Step 2 uploads
  const [idDocUrl, setIdDocUrl] = useState<string>("");
  const [incomeDocUrl, setIncomeDocUrl] = useState<string>("");

  // Step 3 Plaid
  const [linkToken, setLinkToken] = useState<string>("");
  const [plaidLinked, setPlaidLinked] = useState(false);

  // Step 4 attestation
  const [signature, setSignature] = useState("");
  const [attestChecked, setAttestChecked] = useState(false);

  const submitHousehold = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await createSub({ data: form });
      setSubmissionId(res.submissionId);
      setTier(res.tier);
      setStep(2);
    } catch (e: any) {
      setError(e?.message || "Failed to submit household info.");
    } finally {
      setBusy(false);
    }
  };

  const startPlaid = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await createToken({
        data: { submissionId, legalName: form.fullName },
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
      setError("");
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
    onSuccess: (public_token) => {
      void onPlaidSuccess(public_token);
    },
  });

  useEffect(() => {
    if (linkToken && plaidReady) openPlaid();
  }, [linkToken, plaidReady, openPlaid]);

  const submitAttestation = async () => {
    setError("");
    if (!attestChecked || signature.trim().length < 2) {
      setError("Please type your full name and check the attestation box.");
      return;
    }
    setBusy(true);
    try {
      const res = await finalize({
        data: {
          submissionId,
          attestationSignature: signature.trim(),
          idDocumentUrl: idDocUrl,
          incomeDocumentUrl: incomeDocUrl,
        },
      });
      const finalTier = res.tier || tier || "standard";
      navigate({ to: "/checkout", search: { lang: "en", tier: finalTier } as any });
    } catch (e: any) {
      setError(e?.message || "Failed to finalize submission.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <Link to="/" className="text-sm text-red-700 hover:underline">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          See if you qualify
        </h1>
        <p className="text-gray-600 mb-8">
          A 4-step check for our no-cost or low-cost pre-detention defense
          program. Your information is confidential.
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 1 · Household</h2>
              <Field label="Full legal name">
                <input
                  className="input"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Email">
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Household size">
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={form.householdSize}
                    onChange={(e) =>
                      setForm({ ...form, householdSize: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Dependents">
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={form.dependentsCount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dependentsCount: Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="State (US)">
                  <input
                    className="input"
                    maxLength={2}
                    placeholder="FL"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value.toUpperCase() })
                    }
                  />
                </Field>
              </div>
              <Field label="Monthly household income (USD)">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={form.monthlyIncomeUsd}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      monthlyIncomeUsd: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.usCitizenChildren}
                  onChange={(e) =>
                    setForm({ ...form, usCitizenChildren: e.target.checked })
                  }
                />
                <span>I have U.S.-citizen children (or children in the U.S.)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.primaryEarner}
                  onChange={(e) =>
                    setForm({ ...form, primaryEarner: e.target.checked })
                  }
                />
                <span>I am the primary income earner in my household</span>
              </label>

              <button
                className="btn-primary"
                disabled={busy}
                onClick={submitHousehold}
              >
                {busy ? "Saving…" : "Continue →"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 2 · Documents</h2>
              <p className="text-sm text-gray-600">
                Paste a link to a hosted copy of your government ID and a recent
                income document (pay stub, tax return, benefits letter). We'll
                add native file uploads shortly.
              </p>
              <Field label="ID document URL">
                <input
                  className="input"
                  placeholder="https://…"
                  value={idDocUrl}
                  onChange={(e) => setIdDocUrl(e.target.value)}
                />
              </Field>
              <Field label="Income document URL">
                <input
                  className="input"
                  placeholder="https://…"
                  value={incomeDocUrl}
                  onChange={(e) => setIncomeDocUrl(e.target.value)}
                />
              </Field>
              <div className="flex gap-3">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={() => setStep(3)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 3 · Bank verification</h2>
              <p className="text-sm text-gray-600">
                We use Plaid to securely confirm your income. We never see or
                store your bank password. This is required to qualify for
                no-cost pricing.
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
                  Skip (standard pricing)
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
                dependents, and immigration situation — is true and correct to
                the best of my knowledge. I understand that providing false
                information to obtain reduced-cost legal services may be a
                federal offense and will result in immediate cancellation of
                services without refund.
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
