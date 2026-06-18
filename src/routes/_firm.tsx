import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getMyFirmStatus } from "@/lib/firm.functions";
import { FIRM } from "@/lib/firm-info";

export const Route = createFileRoute("/_firm")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    const status = await getMyFirmStatus();
    if (!status.isFirm) {
      throw redirect({
        to: "/login",
        search: { reason: "not-firm", email: data.user.email } as never,
      });
    }
  },
  component: FirmShell,
});

function FirmShell() {
  const router = useRouter();
  return (
    <div className="min-h-screen" style={{ background: "#f7f3ee" }}>
      <header className="border-b" style={{ background: "#6B4F4F", borderColor: "rgba(0,0,0,0.1)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm font-bold text-white">{FIRM.legalName}</div>
              <div className="text-[11px] text-white/70">Attorney Review Portal</div>
            </div>
            <nav className="flex gap-4 text-sm">
              <Link
                to="/firm/queue"
                activeProps={{ className: "text-white font-semibold underline" }}
                className="text-white/80 hover:text-white"
              >
                Review Queue
              </Link>
              <Link
                to="/firm/detained"
                activeProps={{ className: "text-white font-semibold underline" }}
                className="text-white/80 hover:text-white"
              >
                Detained Clients
              </Link>
            </nav>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.navigate({ to: "/login" });
            }}
            className="text-xs text-white/70 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
