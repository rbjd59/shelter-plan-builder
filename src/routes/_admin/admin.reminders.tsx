import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listReminders, sendReminderEmail } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/reminders")({
  component: RemindersPage,
});

function RemindersPage() {
  const fetchList = useServerFn(listReminders);
  const sendOne = useServerFn(sendReminderEmail);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-reminders"], queryFn: () => fetchList() });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const send = async (c: { intake_session_id: string; email: string; name: string }) => {
    setBusy(c.intake_session_id);
    setMsg(null);
    try {
      await sendOne({ data: c });
      setMsg(`Reminder queued for ${c.email}`);
      await qc.invalidateQueries({ queryKey: ["admin-reminders"] });
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  const rows = data?.candidates ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        These are paid signups who have <strong>not triggered yet</strong> and haven't been reminded in 7+ days.
        Send a reminder to get them to download the app — without it, the trigger chain can't fire.
      </div>
      {msg && <p className="text-xs text-slate-700">{msg}</p>}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Days since signup</th>
              <th className="px-3 py-2">Last reminder</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-xs text-slate-500">Nobody needs a reminder right now.</td></tr>
            ) : rows.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2 text-slate-600">{c.email}</td>
                <td className="px-3 py-2 text-xs">{c.daysSinceSignup}d</td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {c.lastSentIso ? `${c.daysSinceReminder}d ago` : "never"}
                </td>
                <td className="px-3 py-2 text-right">
                  <button disabled={busy === c.intake_session_id}
                    onClick={() => send({ intake_session_id: c.intake_session_id, email: c.email, name: c.name })}
                    className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                    {busy === c.intake_session_id ? "Sending…" : "Send reminder"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
