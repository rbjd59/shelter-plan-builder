import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sms-terms")({
  head: () => ({
    meta: [
      { title: "SMS Terms & Opt-In — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "DetencionDefensa.com SMS program terms: message types, frequency, fees, STOP/HELP, and privacy.",
      },
      { property: "og:title", content: "SMS Terms & Opt-In — DetencionDefensa.com" },
      {
        property: "og:description",
        content:
          "DetencionDefensa.com SMS program terms: message types, frequency, fees, STOP/HELP, and privacy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/sms-terms" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "SMS Terms & Opt-In — DetencionDefensa.com" },
      {
        name: "twitter:description",
        content:
          "DetencionDefensa.com SMS program terms: message types, frequency, fees, STOP/HELP, and privacy.",
      },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/sms-terms" }],
  }),
  component: SmsTermsPage,
});

function SmsTermsPage() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f6efe1]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 font-[Fraunces,serif]">
          SMS Terms & Opt-In — DetencionDefensa.com
        </h1>
        <p className="text-sm text-[#cfc8b8] mb-10">
          Effective date: June 22, 2026 &nbsp;&nbsp; Last updated: June 22, 2026
        </p>

        <Section title="Program Name">
          <p className="text-[#cfc8b8] leading-relaxed">
            DetencionDefensa.com Case &amp; Emergency Notifications, operated by{" "}
            <strong className="text-[#f6efe1]">DetencionDefensa.com, Inc.</strong>
          </p>
        </Section>

        <Section title="How to Opt In">
          <p className="text-[#cfc8b8] leading-relaxed">
            You opt in to receive SMS messages from DetencionDefensa.com by checking the SMS
            consent box and entering your mobile phone number on our intake form at{" "}
            <a className="text-[#e8a04a] underline" href="https://detenciondefensa.com/intake">
              https://detenciondefensa.com/intake
            </a>
            . The consent checkbox reads, in substance:
          </p>
          <blockquote className="mt-4 mb-4 border-l-4 border-[#e8a04a] pl-4 italic text-[#f6efe1]">
            "I agree to receive text messages from DetencionDefensa.com, Inc. at the mobile number
            I provided, including my one-time activation code and emergency-case notifications
            related to my account. Message and data rates may apply. Message frequency varies.
            Reply STOP to unsubscribe or HELP for help. See our SMS Terms and Privacy Policy."
          </blockquote>
          <p className="text-[#cfc8b8] leading-relaxed">
            By submitting the intake form with this box checked, you provide your express written
            consent to receive the SMS messages described below.
          </p>
        </Section>

        <Section title="Types of Messages You Will Receive">
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>One-time activation / pairing codes to link your intake form to your phone app.</li>
            <li>Case-status notifications related to your DetencionDefensa.com account.</li>
            <li>Court-date and document-ready reminders for forms you have generated.</li>
            <li>Emergency-activation alerts confirming an alert you triggered, or an all-clear.</li>
          </ul>
        </Section>

        <Section title="Message Frequency">
          <p className="text-[#cfc8b8] leading-relaxed">
            Message frequency varies based on your activity. Most users receive fewer than 10
            messages per month.
          </p>
        </Section>

        <Section title="Fees">
          <p className="text-[#cfc8b8] leading-relaxed">
            <strong className="text-[#f6efe1]">Message and data rates may apply.</strong> Your
            mobile carrier may charge you for sending and receiving text messages. DetencionDefensa.com
            does not charge you any additional fee for the SMS messages themselves.
          </p>
        </Section>

        <Section title="How to Opt Out (STOP)">
          <p className="text-[#cfc8b8] leading-relaxed">
            You can cancel the SMS service at any time. Reply{" "}
            <strong className="text-[#f6efe1]">STOP</strong> to any message you receive from us, and
            you will be unsubscribed. After you send STOP, we will send you a final SMS confirming
            that you have been unsubscribed. After this, you will no longer receive SMS messages
            from us. To rejoin, sign up again as described above.
          </p>
        </Section>

        <Section title="Help (HELP)">
          <p className="text-[#cfc8b8] leading-relaxed">
            If you need help, reply <strong className="text-[#f6efe1]">HELP</strong> to any message,
            or email{" "}
            <a className="text-[#e8a04a] underline" href="mailto:legal@detenciondefensa.com">
              legal@detenciondefensa.com
            </a>
            .
          </p>
        </Section>

        <Section title="Supported Carriers">
          <p className="text-[#cfc8b8] leading-relaxed">
            Supported carriers include AT&amp;T, T-Mobile, Verizon Wireless, Sprint, Boost, U.S.
            Cellular, MetroPCS, and most other U.S. carriers. Carriers are not liable for delayed
            or undelivered messages.
          </p>
        </Section>

        <Section title="Privacy">
          <p className="text-[#cfc8b8] leading-relaxed font-semibold">
            No mobile information, SMS opt-in data, or consent records will be shared with third
            parties or affiliates for marketing or promotional purposes. Phone numbers collected
            for SMS communications are used only to deliver the messages you opted in to receive,
            and are transmitted solely to our SMS carrier (Twilio) for that delivery.
          </p>
          <p className="text-[#cfc8b8] leading-relaxed mt-4">
            For more information, see our{" "}
            <a className="text-[#e8a04a] underline" href="/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </Section>

        <Section title="Contact">
          <p className="text-[#f6efe1]">
            DetencionDefensa.com, Inc.
            <br />
            Email:{" "}
            <a className="text-[#e8a04a] underline" href="mailto:legal@detenciondefensa.com">
              legal@detenciondefensa.com
            </a>
            <br />
            Website:{" "}
            <a className="text-[#e8a04a] underline" href="https://detenciondefensa.com">
              https://detenciondefensa.com
            </a>
          </p>
        </Section>

        <p className="text-xs text-[#6b7a8f] mt-12 text-center">
          &copy; 2026 DetencionDefensa.com, Inc.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-[#f6efe1] mb-3">{title}</h2>
      {children}
    </section>
  );
}
