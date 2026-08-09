import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    const status = await getMyAdminStatus();
    if (!status.isAdmin) {
      throw redirect({ to: "/login", search: { reason: "not-admin", email: data.user.email } as never });
    }
  },
  component: AdminShell,
});

function AdminShell() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-bold text-slate-900">Mission Control</h1>
            <nav className="flex gap-4 text-sm">
              <Link to="/admin" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Dashboard</Link>
              <Link to="/admin/clients" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Clients</Link>
              <Link to="/admin/activations" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Activations</Link>
              <Link to="/admin/alerts" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Alert Board</Link>
              <Link to="/admin/triggers" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Triggers</Link>
              <Link to="/admin/reminders" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Reminders</Link>
              <Link to="/admin/emails" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Emails</Link>
              <Link to="/admin/deliveries" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Deliveries</Link>
              <Link to="/admin/webhooks" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Webhooks</Link>

              <Link to="/admin/invite-codes" activeProps={{ className: "text-amber-600 font-semibold" }} className="text-slate-700 hover:text-slate-900">Invite codes</Link>
            </nav>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.navigate({ to: "/login" }); }}
            className="text-xs text-slate-500 hover:text-slate-900"
          >Sign out</button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
