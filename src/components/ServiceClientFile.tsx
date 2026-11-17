import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Download, Mail, Phone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getServiceFile,
  saveServiceFile,
  addServiceCallback,
  updateServiceCallback,
  generateServicePacket,
  emailClientChecklist,
  emailTrustPackage,
} from "@/lib/service-file.functions";
import { CHECKLISTS, type ServiceKind } from "@/lib/service-file";
import { downloadPdfFromBase64 } from "./PdfPreviewDialog";
type FileValues = {
  notes: string;
  trustName: string;
  trustee: string;
  backupTrustee: string;
  beneficiaries: string;
  legalDescription: string;
  authorizedPerson: string;
  providerOrder: string;
  titleOrder: string;
  checklist: Record<string, "missing" | "requested" | "received" | "reviewed">;
};
const empty: FileValues = {
  notes: "",
  trustName: "",
  trustee: "",
  backupTrustee: "",
  beneficiaries: "",
  legalDescription: "",
  authorizedPerson: "",
  providerOrder: "",
  titleOrder: "",
  checklist: {},
};
export default function ServiceClientFile({
  id,
  source,
}: {
  id: string;
  source: "assessment" | "app";
}) {
  const load = useServerFn(getServiceFile);
  const save = useServerFn(saveServiceFile);
  const add = useServerFn(addServiceCallback);
  const update = useServerFn(updateServiceCallback);
  const generate = useServerFn(generateServicePacket);
  const email = useServerFn(emailClientChecklist);
  const sendTrust = useServerFn(emailTrustPackage);
  const [file, setFile] = useState<FileValues | null>(null);
  const [kind, setKind] = useState<ServiceKind>("heloc");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, error, refetch } = useQuery({
    queryKey: ["service-file", source, id],
    queryFn: () => load({ data: { id, source } }),
    retry: false,
  });
  const values = file ?? {
    ...empty,
    ...((data?.client.service_file as Partial<FileValues>) ?? {}),
  };
  const work = async (action: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setStatus("");
    try {
      await action();
      setStatus(message);
      await refetch();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not complete action.");
    } finally {
      setBusy(false);
    }
  };
  if (error)
    return (
      <div className="border-t border-border py-4 text-sm text-destructive">
        Sign in with an approved staff account to open follow-ups and service packages.{" "}
        <a href="/login" className="underline">
          Sign in
        </a>
      </div>
    );
  if (!data) return <p className="text-sm text-muted-foreground">Loading service file…</p>;
  const change = (key: keyof Omit<FileValues, "checklist">, value: string) =>
    setFile({ ...values, [key]: value });
  const saveCurrent = () => save({ data: { id, source, file: values } });
  const download = async (packetKind: ServiceKind | "family") => {
    await saveCurrent();
    const result = await generate({ data: { id, source, kind: packetKind } });
    downloadPdfFromBase64(result.filename, result.pdfB64);
  };
  return (
    <section className="space-y-5 border-t border-border pt-5 text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Client file · calls and documents</h3>
        <Button asChild variant="outline">
          <a href="tel:+13057737737">
            <Phone />
            Call paralegal
          </a>
        </Button>
      </header>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CHECKLISTS) as ServiceKind[]).map((k) => (
          <Button key={k} variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)}>
            {k === "heloc"
              ? "HELOC"
              : k === "business"
                ? "Do Not Forget Your Business"
                : k[0].toUpperCase() + k.slice(1)}
          </Button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold">Documents · {kind.toUpperCase()}</h4>
          <div className="divide-y divide-border">
            {CHECKLISTS[kind].map((label, index) => {
              const key = `${kind}-${index}`;
              return (
                <label key={key} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>{label}</span>
                  <select
                    aria-label={`Status: ${label}`}
                    value={values.checklist?.[key] ?? "missing"}
                    className="max-w-32 rounded border border-input bg-background p-1.5"
                    onChange={(e) =>
                      setFile({
                        ...values,
                        checklist: {
                          ...values.checklist,
                          [key]: e.target.value as
                            | "missing"
                            | "requested"
                            | "received"
                            | "reviewed",
                        },
                      })
                    }
                  >
                    <option value="missing">Missing</option>
                    <option value="requested">Requested</option>
                    <option value="received">Received</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                </label>
              );
            })}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold">Trust and family setup</h4>
          {(
            [
              ["trustName", "Trust name"],
              ["trustee", "Trustee name"],
              ["backupTrustee", "Backup trustee"],
              ["beneficiaries", "Beneficiaries and instructions"],
              ["legalDescription", "Property legal description"],
              ["authorizedPerson", "Trusted person for family forms"],
              ["providerOrder", "Valuation provider / order number"],
              ["titleOrder", "Title provider / order number"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              {label}
              <input
                value={values[key]}
                onChange={(e) => change(key, e.target.value)}
                className="mt-1 w-full rounded border border-input bg-background p-2"
              />
            </label>
          ))}
          <label className="block text-sm">
            Follow-up notes
            <textarea
              value={values.notes}
              onChange={(e) => change("notes", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-input bg-background p-2"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => void work(saveCurrent, "Client file saved.")}>
          <Save />
          Save file
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            void work(() => download(kind), "Draft saved in the client file and downloaded.")
          }
        >
          <Download />
          Prepare {kind} package
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            void work(() => download("family"), "Simple family draft saved and downloaded.")
          }
        >
          <Download />
          Simple family forms
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            void work(async () => {
              await saveCurrent();
              const result = await email({
                data: { id, source, kind, eventId: crypto.randomUUID() },
              });
              if (!result.sent) throw new Error("Client has opted out of app emails.");
            }, "Document request email sent.")
          }
        >
          <Mail />
          Email client checklist
        </Button>
      </div>
      <div className="border-t border-border pt-4">
        <h4 className="font-semibold">Save My Home Trust · this client's PDFs</h4>
        <ul className="divide-y divide-border">
          {data.trustDocuments.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <span>
                {doc.title} · {new Date(doc.created_at).toLocaleDateString()} · {doc.review_status}
              </span>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void work(async () => {
                    const result = await sendTrust({ data: { id, source, documentId: doc.id } });
                    if (!result.sent) throw new Error("Client has opted out of app emails.");
                  }, "Trust PDF download link sent to the client. Inbox receipt is not confirmed.")
                }
              >
                <Mail />
                Email trust PDF
              </Button>
            </li>
          ))}
        </ul>
        {!data.trustDocuments.length && (
          <p className="text-sm text-muted-foreground">
            Choose Trust, then Prepare trust package to save this client's PDF.
          </p>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Drafts need attorney review. Family forms do not allow selling, renting or mortgaging a
        home. Trust drafts are not executed trusts and do not transfer property. Fees and partner
        agreements need compliance approval; no lien or escrow deduction is created.
      </p>
      <div className="space-y-2 border-t border-border pt-4">
        <h4 className="font-semibold">Property reports · Clear Capital</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="https://www.clearcapital.com/solutions/home-equity-solutions/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            Home equity valuation solutions
          </a>
          <a
            href="https://www.clearcapital.com/products/clearprop/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            ClearProp property and comparable-sales research
          </a>
          <a
            href="https://www.clearcapital.com/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            Contact Clear Capital sales
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Clear Capital account and lender-approved product selection are required to place orders.
          ClearProp mortgage/title history is not a title commitment. Order title through a licensed
          title provider; use rental comparables and licensed broker review separately.
        </p>
      </div>
      <div className="border-t border-border pt-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold">
          <CalendarDays size={18} />
          Calls and follow-ups
        </h4>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const starts = new Date(String(fd.get("starts")));
            if (!Number.isFinite(starts.getTime())) {
              setStatus("Choose a date and time.");
              return;
            }
            void work(
              () =>
                add({
                  data: {
                    id,
                    source,
                    title: String(fd.get("title")),
                    startsAt: starts.toISOString(),
                    paralegalEmail: String(fd.get("email")),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    notes: String(fd.get("notes")),
                  },
                }),
              "Call saved with 60, 30 and 15 minute reminders.",
            );
          }}
        >
          <label className="text-sm">
            Call or task
            <input
              name="title"
              required
              defaultValue="Document review call"
              className="mt-1 w-full rounded border border-input bg-background p-2"
            />
          </label>
          <label className="text-sm">
            Date and time · your local time
            <input
              name="starts"
              type="datetime-local"
              required
              className="mt-1 w-full rounded border border-input bg-background p-2"
            />
          </label>
          <label className="text-sm">
            Assigned paralegal email
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded border border-input bg-background p-2"
            />
          </label>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Paralegal email reminders: 1 hour, 30 minutes and 15 minutes before the call. Client
            confirmation is sent when an email is available.
          </p>
          <label className="text-sm">
            Call notes
            <input
              name="notes"
              className="mt-1 w-full rounded border border-input bg-background p-2"
            />
          </label>
          <Button type="submit" disabled={busy}>
            <CalendarDays />
            Schedule call
          </Button>
        </form>
        <ul className="mt-4 divide-y divide-border">
          {data.callbacks.map((call) => (
            <li
              key={call.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <strong>{call.title}</strong> · {new Date(call.starts_at).toLocaleString()}
                <br />
                <span className="text-muted-foreground">
                  {call.paralegal_email} · {call.status} · {call.notes}
                </span>
              </div>
              {call.status === "scheduled" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      void work(
                        () => update({ data: { id: call.id, status: "completed" } }),
                        "Call marked complete.",
                      )
                    }
                  >
                    Complete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      void work(
                        () => update({ data: { id: call.id, status: "cancelled" } }),
                        "Call cancelled.",
                      )
                    }
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {status && (
        <p role="status" className="text-sm font-semibold">
          {status}
        </p>
      )}
    </section>
  );
}
