import { render } from '@react-email/components'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { TEMPLATES } from '@/lib/email-templates/registry'
import { sendManagedEmail } from '@/lib/email/managed-send.server'

const ADMIN_EMAILS = [
  'njbittelman@gmail.com',
  'nowmaxis@gmail.com',
  'benievasquez@gmail.com',
  'rbjd59@gmail.com',
]

const SITE_NAME = "DetencionDefensa"
const SENDER_DOMAIN = "notify.gohomesooner.com"
const FROM_DOMAIN = "notify.gohomesooner.com"

export const Route = createFileRoute("/api/public/send-admin-invite")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.REPLIT_TRIGGER_SECRET?.trim();
        const incoming = request.headers.get('x-trigger-secret')?.trim() ?? '';
        if (!expected || incoming !== expected) {
          return new Response('Unauthorized', { status: 401 });
        }

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

          const result = await sendManagedEmail({
            message_id: messageId,
            to: email,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject,
            html,
            text: plainText,
            label: 'admin-invite',
            idempotency_key: idempotencyKey,
          })

          if (result.sent) {
            results.push({ email, success: true })
          } else {
            results.push({
              email,
              success: false,
              error: result.reason === 'recipient_suppressed' ? 'recipient_suppressed' : result.error,
            })
          }
        }

        return Response.json({ sent: results })
      },
    },
  },
})
