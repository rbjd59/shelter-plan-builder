import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { grantRole, listRoleMembers, revokeRole } from "@/lib/roles.functions";

export const Route = createFileRoute("/_admin/admin/roles")({
  component: RolesPage,
});

const ROLE_HELP: Record<string, string> = {
  admin: "Full Mission Control access (company operations).",
  firm: "Sorrentino Law Firm portal: review queue, detained clients, leads.",
  staff: "Read-only support access to leads.",
};

function RolesPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["role-members"],
    queryFn: () => listRoleMembers(),
  });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "firm" | "staff">("firm");
  const [msg, setMsg] = useState<string | null>(null);

  const grant = useMutation({
    mutationFn: () => grantRole({ data: { email, role } }),
    onSuccess: () => {
      setMsg(`Granted ${role} to ${email}`);
      setEmail("");
      qc.invalidateQueries({ queryKey: ["role-members"] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const revoke = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "firm" | "staff" }) =>
      revokeRole({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["role-members"] }),
    onError: (e: Error) => setMsg(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Access &amp; roles</h2>
        <p className="mt-1 text-sm text-slate-600">
          Role-based access control. Firm access is what Sorrentino Law Firm PLLC uses to run
          the legal side of the platform under the license agreement — the Firm sees client
          detail, the Company does not.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900">Grant access</h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-xs text-slate-600">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="attorney@sorrentinolaw.com"
              className="mt-1 block w-72 rounded border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="text-xs text-slate-600">
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="mt-1 block rounded border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="firm">firm — law firm portal</option>
              <option value="staff">staff — support (read-only leads)</option>
              <option value="admin">admin — company Mission Control</option>
            </select>
          </label>
          <button
            onClick={() => grant.mutate()}
            disabled={!email || grant.isPending}
            className="rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {grant.isPending ? "Granting…" : "Grant"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">{ROLE_HELP[role]}</p>
        {msg && <p className="mt-2 text-xs text-slate-700">{msg}</p>}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900">
          Current access
        </div>
        {isLoading && <p className="px-5 py-4 text-sm text-slate-500">Loading…</p>}
        {error && <p className="px-5 py-4 text-sm text-red-600">{(error as Error).message}</p>}
        <ul className="divide-y divide-slate-100">
          {(data?.members ?? []).map((m) => (
            <li key={m.userId} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">{m.email}</div>
                <div className="mt-1 flex gap-2">
                  {m.roles.map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {m.roles.map((r) => (
                  <button
                    key={r}
                    onClick={() =>
                      revoke.mutate({ userId: m.userId, role: r as "admin" | "firm" | "staff" })
                    }
                    className="text-xs text-slate-500 underline hover:text-red-600"
                  >
                    remove {r}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        {data && data.members.length === 0 && (
          <p className="px-5 py-4 text-sm text-slate-500">No roles assigned yet.</p>
        )}
      </div>
    </div>
  );
}
