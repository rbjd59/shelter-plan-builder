import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'

// Records terminal delivery outcomes in the app's own tables so the admin
// delivery log keeps showing bounces, complaints and unsubscribes. These rows
// are informational only — Lovable enforces suppression at send time.

type SuppressionReason = 'bounce' | 'complaint' | 'unsubscribe'

function mapReasonToStatus(reason: SuppressionReason): 'bounced' | 'complained' | 'suppressed' {
  switch (reason) {
    case 'bounce':
      return 'bounced'
    case 'complaint':
      return 'complained'
    default:
      return 'suppressed'
  }
}

function mapReasonToMessage(reason: SuppressionReason): string {
  switch (reason) {
    case 'bounce':
      return 'Permanent bounce — email address is invalid or rejected'
    case 'complaint':
      return 'Spam complaint — recipient marked email as spam'
    case 'unsubscribe':
      return 'Recipient unsubscribed'
    default:
      return 'Email suppressed'
  }
}

async function recordSuppression(
  eventId: string,
  reason: SuppressionReason,
  data: { recipient: string; message_id?: string | null },
): Promise<void> {
  const supabaseUrl = process.env['SUPABASE_URL'] || import.meta.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables')
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const normalizedEmail = data.recipient.toLowerCase()

  // 1. Upsert to suppressed_emails (idempotent — safe for redeliveries)
  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert(
      { email: normalizedEmail, reason, metadata: null },
      { onConflict: 'email' },
    )
  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      event_id: eventId,
      code: suppressError.code,
      message: suppressError.message,
    })
    throw new Error('Failed to write suppression')
  }

  // 2. Append a log entry for the event. Dedupe on event_id via message_id so
  //    a redelivered event does not create a second row.
  const { data: existing, error: existingError } = await supabase
    .from('email_send_log')
    .select('id')
    .eq('message_id', eventId)
    .maybeSingle()
  if (existingError) {
    console.error('Failed to check email_send_log for event', {
      event_id: eventId,
      code: existingError.code,
      message: existingError.message,
    })
    throw new Error('Failed to read delivery log')
  }
  if (existing) return

  const { error: insertError } = await supabase.from('email_send_log').insert({
    message_id: eventId,
    template_name: 'system',
    recipient_email: normalizedEmail,
    status: mapReasonToStatus(reason),
    error_message: mapReasonToMessage(reason),
    metadata: null,
  })
  if (insertError) {
    console.error('Failed to insert email_send_log', {
      event_id: eventId,
      code: insertError.code,
      message: insertError.message,
    })
    throw new Error('Failed to write delivery log')
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': async (event) => {
              await recordSuppression(event.event_id, 'bounce', event.data)
            },
            'email.complaint': async (event) => {
              await recordSuppression(event.event_id, 'complaint', event.data)
            },
            'email.unsubscribed': async (event) => {
              await recordSuppression(event.event_id, 'unsubscribe', event.data)
            },
          },
        })
        return handler(request)
      },
    },
  },
})
