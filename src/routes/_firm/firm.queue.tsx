import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getReviewQueue, type QueueItem } from "@/lib/firm.functions";
import { seedDummyCase } from "@/lib/firm-packet.functions";

export const Route = createFileRoute("/_firm/firm/queue")({
  head: () => ({ meta: [{ title: "Review Queue — Sorrentino Law Firm" }, { name: "robots", content: "noindex" }] }),
  component: FirmQueuePage,
  errorComponent: ({ error }) => (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      Failed to load queue: {error.message}
    </div>
  ),
});

const STATUS_LABEL: Record<QueueItem["status"], { label: string; bg: string; fg: string }> = {
  awaiting_review: { label: "Awaiting Review", bg: "#fef3c7", fg: "#92400e" },
  reviewed: { label: "Reviewed", bg: "#dbeafe", fg: "#1e40af" },
  approved: { label: "Approved", bg: "#dcfce7", fg: "#166534" },
  finalized: { label: "Finalized AO 242", bg: "#e0e7ff", fg: "#3730a3" },
  mailed: { label: "Mailed", bg: "#e5e7eb", fg: "#374151" },
};

function FirmQueuePage() {
  const fetchQueue = useServerFn(getReviewQueue);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["firm", "queue"],
    queryFn: () => fetchQueue(),
  });

  const items = data?.items ?? [];
  const pending = items.filter((i) => i.status === "awaiting_review").length;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#6B4F4F" }}>
            Attorney Review Queue
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isLoading
              ? "Loading…"
              : `${items.length} case${items.length === 1 ? "" : "s"} · ${pending} awaiting review`}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {(error as Error).message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Received</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5">Detainee</th>
              <th className="px-4 py-2.5">Lang</th>
              <th className="px-4 py-2.5">Retainer</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Loading queue…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No cases in the queue.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const s = STATUS_LABEL[item.status];
                return (
                  <tr key={item.intakeSessionId} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {new Date(item.receivedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.contactName ?? "—"}</div>
                      <div className="text-xs text-slate-500">{item.contactEmail ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.inmateName ?? "—"}</td>
                    <td className="px-4 py-3 uppercase text-xs text-slate-500">{item.language}</td>
                    <td className="px-4 py-3 text-xs">
                      {item.retainerSignedAt ? (
                        <span className="text-emerald-700">
                          ✓ {item.retainerSignedName}
                          <div className="text-[10px] text-slate-400">
                            {new Date(item.retainerSignedAt).toLocaleDateString()}
                          </div>
                        </span>
                      ) : (
                        <span className="text-amber-700">Unsigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: s.bg, color: s.fg }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/firm/review/$id"
                        params={{ id: item.intakeSessionId }}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Cases are listed FIFO (oldest first). Open a case to view the signed retainer, intake answers,
        and record review actions.
      </p>
    </div>
  );
}
