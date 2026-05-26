import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = "DetencionDefensa"

interface AdminInviteProps {
  name?: string
}

const AdminInviteEmail = ({ name }: AdminInviteProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You have been added as an admin on DetencionDefensa</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Admin Access — DetencionDefensa</Heading>
        <Text style={text}>
          Hi{name ? ` ${name}` : ""},
        </Text>
        <Text style={text}>
          You have been added as an admin on {SITE_NAME}. Here is how to sign in:
        </Text>
        <Text style={step}>
          <strong>Step 1:</strong> Go to{" "}
          <a href="https://detenciondefensa.com/login" style={link}>
            detenciondefensa.com/login
          </a>
        </Text>
        <Text style={step}>
          <strong>Step 2:</strong> Click "Sign in with Google" and use your Gmail address.
        </Text>
        <Text style={step}>
          <strong>Step 3:</strong> After signing in, a small "Admin" button appears at the bottom-right of every page. Click it to open the Mission Control dashboard.
        </Text>
        <Text style={text}>
          That is it — no password needed. You can view site traffic, pending actions, and all client data from the admin panel.
        </Text>
        <Text style={footer}>
          Questions? Reply to this email or contact{" "}
          <a href="mailto:legal@detenciondefensa.com" style={link}>
            legal@detenciondefensa.com
          </a>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminInviteEmail,
  subject: 'Your admin access to DetencionDefensa',
  displayName: 'Admin invite',
  previewData: { name: 'Admin' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a0a1a', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#2d2d2d', lineHeight: '1.6', margin: '0 0 18px' }
const step = { fontSize: '14px', color: '#1a1a1a', lineHeight: '1.6', margin: '0 0 12px', paddingLeft: '8px' }
const link = { color: '#4f46e5', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#666666', margin: '30px 0 0', borderTop: '1px solid #e8e4dd', paddingTop: '16px' }
