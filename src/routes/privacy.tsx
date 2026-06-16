import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — DetencionDefensa" },
      {
        name: "description",
        content:
          "DetencionDefensa privacy policy — what we collect, how we use it, and your rights.",
      },
      { property: "og:title", content: "Privacy Policy — DetencionDefensa" },
      {
        property: "og:description",
        content:
          "DetencionDefensa privacy policy — what we collect, how we use it, and your rights.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/privacy" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy — DetencionDefensa" },
      {
        name: "twitter:description",
        content:
          "DetencionDefensa privacy policy — what we collect, how we use it, and your rights.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://detenciondefensa.com/privacy" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f6efe1]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 font-[Fraunces,serif]">
          Privacy Policy — DetencionDefensa
        </h1>
        <p className="text-sm text-[#cfc8b8] mb-10">
          Effective date: May 25, 2026&nbsp;&nbsp;Last updated: May 25, 2026
        </p>

        <p className="text-[#cfc8b8] mb-8 leading-relaxed">
          This Privacy Policy explains what information DetencionDefensa ("we," "us," "the app")
          collects, how it is used, and the choices you have. This policy applies to both the
          DetencionDefensa mobile app and the detenciondefensa.com website.
        </p>

        <Section num="1" title="Plain-English Summary">
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>
              We collect only what you give us to make the emergency alert work: your name, your
              A-number, your date of birth, your country of origin, your emergency contacts, and
              your intake answers about your case.
            </li>
            <li>
              We use this information only to (a) send your emergency contacts a notification if
              you press the alert button, and (b) automatically fill out federal court forms (habeas
              corpus petition, IFP application, civil cover sheet, attorney referral) attached to
              that notification.
            </li>
            <li>We do not track your location.</li>
            <li>We do not show advertising.</li>
            <li>
              We do not sell or share your data with any third party except the email delivery
              service that sends your alert (Resend.com), and only at the moment the alert is
              triggered.
            </li>
            <li>
              You can delete your data at any time by emailing{" "}
              <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
                legal@detenciondefensa.com
              </a>
              .
            </li>
          </ul>
        </Section>

        <Section num="2" title="What We Collect">
          <SubSection title="2.1 Information you give us">
            <ul className="list-disc pl-5 space-y-1 text-[#cfc8b8] leading-relaxed">
              <li>
                <strong className="text-[#f6efe1]">Personal identifiers:</strong> First and last
                name, date of birth, Alien Registration Number ("A-number"), country of citizenship.
              </li>
              <li>
                <strong className="text-[#f6efe1]">Emergency contacts:</strong> Up to two people
                you designate, including their name, phone, email, and relationship to you.
              </li>
              <li>
                <strong className="text-[#f6efe1]">Case intake answers:</strong> Information you
                enter on the website intake form, including the name and address of the facility
                where you fear detention, prior immigration history, financial information for
                in-forma-pauperis applications, and the legal grounds and relief you wish to request
                in a habeas corpus petition.
              </li>
            </ul>
          </SubSection>

          <SubSection title="2.2 Information collected automatically">
            <ul className="list-disc pl-5 space-y-1 text-[#cfc8b8] leading-relaxed">
              <li>
                <strong className="text-[#f6efe1]">Device technical information:</strong> App
                version, operating system version, language preference.
              </li>
              <li>
                <strong className="text-[#f6efe1]">Pairing code:</strong> A unique 6-digit code
                (expires in 24 hours) used to link your website intake form to your phone app.
              </li>
            </ul>
          </SubSection>

          <SubSection title="2.3 What we do NOT collect">
            <ul className="list-disc pl-5 space-y-1 text-[#cfc8b8] leading-relaxed">
              <li>We do not request or collect your location.</li>
              <li>
                We do not access your camera, microphone, contacts list, photos, or files.
              </li>
              <li>We do not use cookies for tracking or advertising on the website.</li>
              <li>We do not use any analytics SDK that builds a profile of you.</li>
            </ul>
          </SubSection>
        </Section>

        <Section num="3" title="How We Use Your Information">
          <p className="text-[#cfc8b8] leading-relaxed mb-4">
            We use the information you provide for one purpose only: to operate the emergency alert
            system.
          </p>
          <p className="text-[#f6efe1] font-semibold mb-2">Specifically:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>
              When you press and hold the red alert button for 3 seconds, the app sends a
              notification email to (a) the emergency contacts you provided, and (b) the
              DetencionDefensa legal team inbox at{" "}
              <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
                legal@detenciondefensa.com
              </a>
              .
            </li>
            <li>
              That email automatically attaches four PDF legal documents pre-filled with your
              information: Petition for Writ of Habeas Corpus (AO-242), Application to Proceed In
              Forma Pauperis (AO-240), Civil Cover Sheet (JS-44), and an Attorney Referral / Motion
              letter.
            </li>
            <li>
              If you cancel the alert within 2 hours using your 4-digit PIN, an "all-clear" email
              is sent to the same contacts.
            </li>
            <li>
              We do not use your information for marketing, advertising, profiling, research, or any
              other purpose.
            </li>
          </ul>
        </Section>

        <Section num="4" title="Who We Share Information With">
          <p className="text-[#cfc8b8] leading-relaxed mb-4">
            We share your information only with the following services, only as necessary to deliver
            the alert, and only at the moment you trigger it:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-[#3a4458]">
              <thead>
                <tr className="bg-[#1a2436]">
                  <th className="text-left px-4 py-2 text-[#f6efe1] border-b border-[#3a4458]">
                    Service
                  </th>
                  <th className="text-left px-4 py-2 text-[#f6efe1] border-b border-[#3a4458]">
                    Purpose
                  </th>
                  <th className="text-left px-4 py-2 text-[#f6efe1] border-b border-[#3a4458]">
                    Data shared
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#3a4458]">
                  <td className="px-4 py-2 text-[#f6efe1]">Resend.com</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">Email delivery</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">
                    Email addresses of your contacts, the alert message, the attached PDF forms
                  </td>
                </tr>
                <tr className="border-b border-[#3a4458]">
                  <td className="px-4 py-2 text-[#f6efe1]">Replit</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">Hosting our server</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">
                    Encrypted-in-transit copies of intake data as it passes through our servers
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-[#f6efe1]">Twilio</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">SMS delivery (activation code, case alerts)</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">
                    Your mobile phone number and the SMS message body only
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubSection title="4.1 SMS / Text Messaging Privacy">
            <p className="text-[#cfc8b8] leading-relaxed mb-3">
              When you check the SMS consent box on our intake form, you opt in to receive text
              messages from <strong className="text-[#f6efe1]">DetencionDefensa.com, Inc.</strong> at
              the mobile number you provide. Messages include your one-time activation code and
              emergency-case notifications related to your account. Message frequency varies.
              Message and data rates may apply. Reply <strong>STOP</strong> to unsubscribe or{" "}
              <strong>HELP</strong> for help.
            </p>
            <p className="text-[#cfc8b8] leading-relaxed font-semibold">
              No mobile information, SMS opt-in data, or consent records will be shared with third
              parties or affiliates for marketing or promotional purposes. Phone numbers collected
              for SMS communications are used only to deliver the messages you opted in to receive,
              and are transmitted solely to our SMS carrier (Twilio) for that delivery.
            </p>
          </SubSection>

          <p className="text-[#f6efe1] font-semibold mb-2">We do not share your data with:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#cfc8b8] leading-relaxed">
            <li>Advertisers</li>
            <li>Data brokers</li>
            <li>
              Government agencies (unless required by valid legal process, in which case we will
              notify you when legally permitted)
            </li>
            <li>Any other third party</li>
          </ul>

        </Section>

        <Section num="5" title="Where Your Data Is Stored and For How Long">
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>
              <strong className="text-[#f6efe1]">Pairing codes</strong> (the 6-digit code linking
              your website intake to your phone) are stored in server memory and automatically
              deleted after 24 hours or upon first use, whichever is sooner.
            </li>
            <li>
              <strong className="text-[#f6efe1]">Backup intake logs</strong> are retained on the
              website's database (Lovable / Supabase) for 90 days, then deleted, to allow
              re-firing a pairing code if delivery to the phone fails.
            </li>
            <li>
              <strong className="text-[#f6efe1]">Your intake answers on your phone</strong> are
              stored locally on your device (encrypted at rest by the operating system) and are
              sent to our server only at the moment you press the alert button.
            </li>
            <li>
              After the alert is delivered and the PDFs are emailed, our server does not retain a
              copy of the intake answers.
            </li>
          </ul>
        </Section>

        <Section num="6" title="Your Rights">
          <p className="text-[#cfc8b8] leading-relaxed mb-4">
            You may, at any time:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>
              <strong className="text-[#f6efe1]">Delete all of your data</strong> by emailing{" "}
              <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
                legal@detenciondefensa.com
              </a>{" "}
              with the subject "Delete my data" — we will remove it within 7 days.
            </li>
            <li>
              <strong className="text-[#f6efe1]">Request a copy</strong> of your data we hold, by
              emailing the same address.
            </li>
            <li>
              <strong className="text-[#f6efe1]">Update or correct</strong> any information by
              editing it in the app or on the website.
            </li>
          </ul>
          <p className="text-[#cfc8b8] leading-relaxed mt-4">
            If you are a resident of California, the EU, or another jurisdiction with specific
            privacy rights (CCPA, GDPR), the rights above are available to you and we will respond
            within the timeframes required by your local law.
          </p>
        </Section>

        <Section num="7" title="Children">
          <p className="text-[#cfc8b8] leading-relaxed">
            DetencionDefensa is not directed to children under 13. We do not knowingly collect
            information from children under 13. If you believe we have, contact us at{" "}
            <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
              legal@detenciondefensa.com
            </a>{" "}
            and we will delete it.
          </p>
        </Section>

        <Section num="8" title="Security">
          <p className="text-[#cfc8b8] leading-relaxed mb-4">
            We use industry-standard security practices including HTTPS / TLS encryption for all data
            in transit, encrypted storage at rest, single-use pairing codes that expire
            automatically, rate-limiting to prevent abuse, and minimal data retention.
          </p>
          <p className="text-[#cfc8b8] leading-relaxed">
            No internet system is 100% secure. If we discover a breach of your data, we will notify
            you within 72 hours by email.
          </p>
        </Section>

        <Section num="9" title="Changes to This Policy">
          <p className="text-[#cfc8b8] leading-relaxed">
            If we change this policy, we will update the "Last updated" date at the top of this
            page and, for material changes, notify users by email or through an in-app notice.
          </p>
        </Section>

        <Section num="10" title="Contact Us">
          <p className="text-[#cfc8b8] leading-relaxed mb-1">Questions, concerns, or data deletion requests:</p>
          <p className="text-[#f6efe1]">
            DetencionDefensa<br />
            Email:{" "}
            <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
              legal@detenciondefensa.com
            </a>
            <br />
            Website:{" "}
            <a href="https://detenciondefensa.com" className="text-[#e8a04a] underline">
              https://detenciondefensa.com
            </a>
          </p>
        </Section>

        <Section num="11" title="Legal Disclaimer">
          <p className="text-[#cfc8b8] leading-relaxed">
            DetencionDefensa is a notification and document-translation and typing tool. It is not a
            law firm and does not provide legal advice. Use of this app does not create an
            attorney-client relationship. The pre-filled federal court forms generated by the app
            are based on public-domain U.S. federal templates and the information you provide; their
            accuracy depends on the accuracy of your input. We strongly encourage you to consult a
            licensed attorney to review any document before filing.
          </p>
        </Section>

        <p className="text-xs text-[#6b7a8f] mt-12 text-center">
          &copy; 2026 DetencionDefensa
        </p>
      </div>
    </div>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-[#f6efe1] mb-3">
        {num}. {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-[#f6efe1] mb-2">{title}</h3>
      {children}
    </div>
  );
}
