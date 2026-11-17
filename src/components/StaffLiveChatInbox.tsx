import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listLiveChats, getLiveChat, replyLiveChat, closeLiveChat } from "@/lib/live-chat.functions";
import { Button } from "@/components/ui/button";

export default function StaffLiveChatInbox() {
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");
  const list = useServerFn(listLiveChats);
  const get = useServerFn(getLiveChat);
  const send = useServerFn(replyLiveChat);
  const close = useServerFn(closeLiveChat);
  const queryClient = useQueryClient();
  const chats = useQuery({ queryKey: ["live-chats"], queryFn: () => list(), refetchInterval: 5000, retry: false });
  const messages = useQuery({
    queryKey: ["live-chat", selected],
    queryFn: () => get({ data: { id: selected! } }),
    enabled: Boolean(selected),
    refetchInterval: 3000,
    retry: false,
  });
  const current = chats.data?.find((chat) => chat.id === selected);
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["live-chats"] }),
      queryClient.invalidateQueries({ queryKey: ["live-chat", selected] }),
    ]);
  };
  return (
    <section className="rounded-lg border border-border bg-background p-4 text-foreground">
      <h2 className="text-xl font-bold">Website live chat and callbacks</h2>
      <p className="mt-1 text-sm text-muted-foreground">Reply to a waiting visitor to join the live chat. New messages refresh automatically.</p>
      {chats.error && <p className="mt-3 text-sm text-destructive">Sign in with an approved staff account to answer website chats.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ul className="max-h-96 divide-y divide-border overflow-y-auto border border-border">
          {chats.data?.map((chat) => (
            <li key={chat.id}>
              <button type="button" onClick={() => setSelected(chat.id)} className={`w-full p-3 text-left text-sm ${selected === chat.id ? "bg-accent" : "bg-background"}`}>
                <b>{chat.visitor_name || "Website visitor"}</b> · {chat.language.toUpperCase()} · {chat.status}<br />
                {chat.callback_at && <span>Call requested: {new Date(chat.callback_at).toLocaleString()} · {chat.visitor_phone}<br /></span>}
                <span className="text-muted-foreground">{new Date(chat.updated_at).toLocaleString()}</span>
              </button>
            </li>
          ))}
          {chats.data?.length === 0 && <li className="p-4 text-sm text-muted-foreground">No website chats yet.</li>}
        </ul>
        <div className="min-h-60 border border-border p-3">
          {!current && <p className="text-sm text-muted-foreground">Choose a chat to read and answer.</p>}
          {current && <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span><b>{current.status}</b>{current.assigned_name ? ` · ${current.assigned_name}` : ""}</span>
              {current.status !== "closed" && <Button size="sm" variant="outline" onClick={() => void close({ data: { id: current.id } }).then(refresh)}>Close chat</Button>}
            </div>
            {current.callback_at && <p className="mb-3 rounded bg-muted p-2 text-sm">Callback: {new Date(current.callback_at).toLocaleString()} ({current.callback_timezone}) · {current.visitor_name} · {current.visitor_phone}</p>}
            <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
              {messages.data?.map((message) => <p key={message.id} className={`rounded p-2 text-sm ${message.sender === "staff" ? "bg-primary text-primary-foreground" : "bg-muted"}`}><b>{message.sender === "staff" ? "Staff" : "Visitor"}:</b> {message.body}</p>)}
            </div>
            {current.status !== "closed" && current.status !== "ai" && <form onSubmit={(event) => {
              event.preventDefault();
              if (!reply.trim()) return;
              setStatus("Sending…");
              void send({ data: { id: current.id, text: reply } }).then(async () => {
                setReply(""); setStatus("Sent. You joined this chat."); await refresh();
              }).catch((error) => setStatus(error instanceof Error ? error.message : "Could not send."));
            }}>
              <label className="text-sm">Staff reply<textarea required maxLength={4000} rows={3} value={reply} onChange={(event) => setReply(event.target.value)} className="mt-1 w-full rounded border border-input bg-background p-2" /></label>
              <Button type="submit" className="mt-2">Reply and join</Button>
            </form>}
            {status && <p role="status" className="mt-2 text-sm">{status}</p>}
          </>}
        </div>
      </div>
    </section>
  );
}
