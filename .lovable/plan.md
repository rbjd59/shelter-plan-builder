# Splitting the Firm backend off DetencionDefensa ("ICE-proof" architecture)

## Short answers first

**Do you need a separate domain for Sorrentino?**
Yes — a real one, owned and paid for by the firm. Not a subdomain of detenciondefensa.com. A subdomain implies shared control and undercuts the "separate custodian" story. Recommended: `sorrentinolawpllc.com` (or `sorrentinolaw.app`), with the client-facing endpoint at `app.sorrentinolawpllc.com`.

**Where does it get parked?**
A second, standalone Lovable project ("Firm Vault") with its own Cloud database, its own service-role key, its own admin login list, and the firm's domain attached. DetencionDefensa never receives credentials to it. Registrar + billing in the firm's name.

**Who owns what after the split**

| | DetencionDefensa (Company) | Sorrentino Law Firm (Firm Vault) |
|---|---|---|
| Intake form UI | yes (transient) | no |
| Client PII at rest | **none** | yes — system of record |
| Generated legal documents | none after handoff | yes |
| Emergency contacts | none | yes |
| Activation code | yes (bare code + timestamps) | yes |
| SOS trigger receipt | relay only | yes |
| Locate packet during a live trigger | pulled on demand, not stored | yes |
| Play/App Store developer account | no | yes — publish under the firm |

## How it works end to end

```text
1. Client fills intake on detenciondefensa.com
   -> written to a STAGING table with a hard TTL (minutes)
2. Company generates the document set from staging
3. Company POSTs {profile, contacts, documents} to the Firm Vault
   over HTTPS with an HMAC-signed body; Vault returns activation_code
4. Company HARD PURGES staging row + documents.
   Retains only: activation_code, created_at, plan flags.
5. Firm Vault emails the client: activation code + app download link
   (link lives on the firm's domain)
6. Phone triggers SOS -> phone posts DIRECTLY to Firm Vault
   (Company is not in the path and cannot log it)
7. Firm Vault notifies legal@ + family contacts
8. Company board polls Vault: "is code X live?"
   - not live -> code + timestamps only
   - live    -> Vault returns an ephemeral locate packet (name, A-number,
     DOB, POB, phone) held in memory for the board render, never written
```

GPS is removed everywhere — app, payloads, emails, boards, and copy.

## Build steps

**Phase 1 — Firm Vault project (new Lovable project)**
1. Create the project under the firm's account; attach the firm domain.
2. Schema: `clients`, `client_contacts`, `client_documents`, `sos_alerts`, `intake_receipts`, `audit_log`. RLS on all; firm-role only.
3. Inbound endpoints (all HMAC-verified, under `/api/public/`):
   - `POST /api/public/vault/ingest` — accepts the full case bundle from DD, mints/accepts the activation code.
   - `POST /api/public/vault/trigger` — SOS fire/cancel straight from the phone.
   - `POST /api/public/vault/sync-contacts` — contact edits from the phone.
   - `POST /api/public/vault/status` — DD board asks about one activation code; returns code-only unless a trigger is live.
4. Firm board UI: queue, case folder, document preview/download, alert log.
5. Notification fan-out (email + SMS) moves here.

**Phase 2 — DetencionDefensa changes**
6. Convert intake writes to a `intake_staging` table with a purge job.
7. New handoff server function: build docs -> POST to Vault -> verify 200 -> delete staging + documents in the same transaction.
8. Strip PII columns from `app_clients`; keep `invite_token`, timestamps, status.
9. Attorney board on DD becomes a thin proxy to the Vault (or is removed entirely — recommended: removed, the firm uses its own board).
10. Company board reads from `/vault/status` instead of the local DB.
11. Remove GPS capture, storage, display, and email lines.
12. Delete residual PII: purge existing rows from `app_clients`, `client_contacts`, `client_documents`, `client_sos_alerts`, and the storage buckets holding intake artifacts.

**Phase 3 — Distribution moves to the firm**
13. Apple Developer + Google Play accounts under Sorrentino Law Firm PLLC; Premio rebuilds with the firm's signing identity and bundle ID.
14. Android APK download link served from the firm's domain.
15. TestFlight link re-issued under the firm account.

**Phase 4 — Copy and legal**
16. Rewrite privacy/security/FAQ pages with the zero-retention, privilege, and no-tracking claims (drafted below), in EN/ES/HT.
17. Engagement letter adds the company as the firm's disclosed agent for intake, so privilege attaches to the intake channel.

## Copy to add (defensible wording)

- **Zero-retention:** "DetencionDefensa does not keep your file. Your information is transmitted to Sorrentino Law Firm PLLC and deleted from our systems. All we retain is your activation code."
- **Privilege:** "Your intake is collected for Sorrentino Law Firm PLLC as its agent, and is held by the firm as attorney-client privileged material."
- **No tracking:** "The app does not track your location. It does not report where you are, ever. It only sends the alert you choose to send."

Avoid absolutes like "guaranteed" and "ICE cannot access" — say what the system does, not what a court will do.

## Technical notes

- Shared secret `VAULT_HMAC_SECRET` on both sides; body-signed SHA-256, replay window on `timestamp`.
- The Vault's service-role key never leaves the Vault project.
- `/vault/status` responses for non-live codes must be byte-identical in shape to live ones minus the packet, so response size doesn't leak state.
- Purge on the DD side runs inside the same server function as the successful handoff, plus a nightly sweeper for orphans.

## First decision needed

Confirm the firm domain name to register, and whether the DD attorney board should be removed outright or kept as a read-only proxy. I'll start Phase 1 as soon as the Vault project exists.
