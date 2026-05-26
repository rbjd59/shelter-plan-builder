import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { TEMPLATES } from '@/lib/email-templates/registry'

const ADMIN_EMAILS = [
  'njbittelman@gmail.com',
  'nowmaxis@gmail.com',
  'benievasquez@gmail.com',
  'rbjd59@gmail.com',
]

const SITE_NAME = "DetencionDefensa"
const SENDER_DOMAIN = "notify.gohomesooner.com"
const FROM_DOMAIN = "notify.gohomesooner.com"

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const Route = createFileRoute("/api/public/send-admin-invite")({
  server: {
    handlers: {
      POST: async () => {
        const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json(
            { error: 'Server configuration error' },
            { status: 500 }
          )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const template = TEMPLATES['admin-invite']

        if (!template) {
          return Response.json({ error: 'Template not found' }, { status: 500 })
        }

        const element = React.createElement(template.component, { name: '' })
        const html = await render(element)
        const plainText = await render(element, { plainText: true })
        const subject = typeof template.subject === 'function'
          ? template.subject({ name: '' })
          : template.subject

        const results: Array<{ email: string; success: boolean; error?: string }> = []

        for (const email of ADMIN_EMAILS) {
          const messageId = crypto.randomUUID()
          const idempotencyKey = `admin-invite-${email}-${new Date().toISOString().slice(0, 10)}`

          // Get or create unsubscribe token
          const normalizedEmail = email.toLowerCase()
          const { data: existingToken } = await supabase
            .from('email_unsubscribe_tokens')
            .select('token, used_at')
            .eq('email', normalizedEmail)
            .maybeSingle()

          let unsubscribeToken: string
          if (existingToken && !existingToken.used_at) {
            unsubscribeToken = existingToken.token
          } else {
            unsubscribeToken = generateToken()
            await supabase
              .from('email_unsubscribe_tokens')
              .upsert(
                { token: unsubscribeToken, email: normalizedEmail },
                { onConflict: 'email', ignoreDuplicates: true }
              )
          }

          // Log pending
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: 'admin-invite',
            recipient_email: email,
            status: 'pending',
          })

          // Enqueue
          const { error: enqueueError } = await supabase.rpc('enqueue_email', {
            queue_name: 'transactional_emails',
            payload: {
              message_id: messageId,
              to: email,
              from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
              sender_domain: SENDER_DOMAIN,
              subject,
              html,
              text: plainText,
              purpose: 'transactional',
              label: 'admin-invite',
              idempotency_key: idempotencyKey,
              unsubscribe_token: unsubscribeToken,
              queued_at: new Date().toISOString(),
            },
          })

          if (enqueueError) {
            results.push({ email, success: false, error: enqueueError.message })
          } else {
            results.push({ email, success: true })
          }
        }

        return Response.json({ sent: results })
      },
    },
  },
})
