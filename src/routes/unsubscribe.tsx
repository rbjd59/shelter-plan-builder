import { createFileRoute } from '@tanstack/react-router'

// Unsubscribe is now handled by the link at the bottom of every email
// (hosted by our email provider). Old links that point here get a notice.
export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: 'Unsubscribe — DetencionDefensa' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: UnsubscribePage,
})

function UnsubscribePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Unsubscribe</h1>
        <p className="text-muted-foreground mb-6">
          To stop receiving emails from DetencionDefensa, use the unsubscribe link at the
          bottom of the most recent email you received from us.
        </p>
        <div className="text-sm text-muted-foreground">
          If you need help, contact{" "}
          <a href="mailto:info@detenciondefensa.com" className="text-primary underline">
            info@detenciondefensa.com
          </a>
        </div>
      </div>
    </div>
  )
}
