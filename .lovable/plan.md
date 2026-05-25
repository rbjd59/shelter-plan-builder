# Admin Command Center — "Mission Control"

A password-protected admin site at `/admin` that gives you 100% visibility on every triggered client from sign-up through mailed package delivery confirmation.

---

## What you get (5 pages)

### 1. `/admin` — Dashboard (the master info board)
- **Daily views** chart (last 30 days, line chart)
- **Where views come from** (referrer breakdown: direct, Google, Facebook, etc. + country if available)
- **Today's numbers**: signups today, active (not yet triggered) clients, triggered today, packages mailed today
- **Pending action queue** — every triggered client whose checklist isn't 100% complete, sorted oldest first. This is your "must-do today" list.

### 2. `/admin/clients` — All clients
- Full list of every intake submission with status: `signed_up` → `triggered` → `forms_sent` → `client_located` → `package_mailed` → `package_received`
- Filter by status, search by name / A-number / inmate number
- Click any row → client detail page

### 3. `/admin/clients/:id` — Single client detail + action checklist
Every triggered client has a 7-step checklist. Each step is a button + timestamp + who did it:
1. ☐ **Triggered alert at** `[timestamp auto-filled]`
2. ☐ **Not cancelled by** `[deadline auto-filled, marked passed/cancelled]`
3. ☐ **Forms sent to legal@detenciondefensa.com for printing** `[button: "Mark sent" → timestamp]`
4. ☐ **Located client at** `[input: facility name/address → save]`
5. ☐ **Mailed client package** — form fields: Name, Institution + address, Inmate #, Tracking #, Date mailed
6. ☐ **Received on** `[date input when USPS confirms delivery]`
7. ☐ **Print status form** — generates a printable PDF showing all 7 steps with timestamps for your physical case file

### 4. `/admin/triggers` — Trigger log
Every emergency activation ever fired, with full audit trail (who, when, GPS, IP, status of follow-up actions). Pulls from existing `emergency_activations` table.

### 5. `/admin/reminders` — Re-engagement
- List of signups who **haven't triggered yet** and haven't been contacted in N days
- One-click "Send reminder email" (uses your existing email queue)
- Auto-reminder schedule: 7 days, 30 days, 90 days after signup if no trigger
- Shows reminder send history per client

---

## Database changes

One new table: `case_action_log` — tracks each of the 7 checklist steps per triggered client.

```text
case_action_log
├── id
├── intake_session_id   (links to intake_submissions + emergency_activations)
├── step                ('forms_sent' | 'client_located' | 'package_mailed' | 'package_received' | 'reminder_sent')
├── completed_at        (timestamp)
├── completed_by        (admin email)
├── metadata            (jsonb — facility, tracking #, etc.)
└── created_at
```

Plus a `page_views` table for the analytics counter (logged via a tiny server route called from the public site root layout).

```text
page_views
├── id
├── path
├── referrer
├── country (from CF-IPCountry header)
├── user_agent
├── created_at
```

---

## Auth (how YOU get in)

Admin pages are gated by a `user_roles` table check (role = 'admin'). You log in with your normal email/password at `/login`, and only emails listed as admin can see `/admin/*`. I'll seed your email as the first admin during migration.

---

## What I need from you (step by step)

1. **Approve this plan** (reply "go")
2. **Tell me which email address(es)** should be admins (e.g. `legal@detenciondefensa.com`, your personal email)
3. **Approve the database migration** when I post it (one click)
4. **Sign in once** at `/login` with your admin email so the role check works
5. That's it — no software to buy, no third-party signup. Uses Lovable Cloud (already enabled), built-in email queue (already running), and the existing case data.

---

## What this does NOT do (out of scope, ask if you want any of these)

- Real-time SMS to your phone when a trigger fires (could add via Twilio connector)
- Auto-USPS tracking number lookup (we'd need a USPS API key)
- Multi-admin permission levels (everyone listed as admin sees everything)
- Replaces your Replit deployment — this lives entirely on the Lovable side and reads/writes the same database

Reply **"go"** and tell me the admin email(s) to seed.
