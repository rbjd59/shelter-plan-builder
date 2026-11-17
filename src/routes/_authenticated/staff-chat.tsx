import { createFileRoute } from "@tanstack/react-router";
import StaffLiveChatInbox from "@/components/StaffLiveChatInbox";
import { BUSINESS_PARALEGAL_PHONE, BUSINESS_PARALEGAL_PHONE_DISPLAY } from "@/lib/business-config";

export const Route = createFileRoute("/_authenticated/staff-chat")({
  head: () => ({
    meta: [
      { title: "Staff Live Chat — DetencionDefensa" },
      { name: "description", content: "Private staff inbox for answering website live chats and callback requests." },
      { property: "og:title", content: "Staff Live Chat — DetencionDefensa" },
      { property: "og:description", content: "Answer website chats from your phone or computer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
      { name: "theme-color", content: "#0f1830" },
      { name: "apple-mobile-web-app-title", content: "Staff Chat" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
    ],
    links: [{ rel: "manifest", href: "/staff-chat.webmanifest" }],
  }),
  component: StaffChatPage,
});

function StaffChatPage() {
  return (
    <main className="min-h-screen bg-muted p-3 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <StaffLiveChatInbox />
        <details className="rounded-lg border border-border bg-background p-4 text-sm text-foreground">
          <summary className="cursor-pointer font-semibold">Put this chat on your phone</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>iPhone: open this page in Safari, tap Share, then "Add to Home Screen".</li>
            <li>Android: open in Chrome, tap the ⋮ menu, then "Install app" or "Add to Home screen".</li>
            <li>Computer: open this page and bookmark it, or in Chrome click the install icon in the address bar.</li>
            <li>Website calls and texts go to <a className="underline" href={`tel:${BUSINESS_PARALEGAL_PHONE}`}>{BUSINESS_PARALEGAL_PHONE_DISPLAY}</a>.</li>
          </ul>
        </details>
      </div>
    </main>
  );
}
