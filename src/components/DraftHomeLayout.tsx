import { Link } from "@tanstack/react-router";
import type React from "react";

function Section({ n, tag, title, children, tone = "bg-background" }: { n: number; tag: string; title: string; children: React.ReactNode; tone?: string }) {
  return (
    <section className={`${tone} border-b border-border px-5 py-14`}>
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{n}. {tag}</p>
        <h2 className="mb-5 text-3xl font-bold text-foreground">{title}</h2>
        <div className="space-y-4 text-lg leading-relaxed text-foreground/85">{children}</div>
      </div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-2 pl-6">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

function Badge({ children, paid }: { children: React.ReactNode; paid?: boolean }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${paid ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>{children}</span>;
}

export const PARTNERS = [
  { name: "Sorrentino Law Firm", role: "Save My Home Trust, legal review, habeas (first 250 who qualify)" },
  { name: "United Realty", role: "Sell the home — we prepare the pre-title file" },
  { name: "Joe Mondelli", role: "Mortgage / HELOC — before detention" },
  { name: "Business Brokers", role: "Value and sell your route or business" },
  { name: "Defensible.Development", role: "Trust + corporate structuring for your business" },
  { name: "Handyman", role: "Get the home ready to keep or sell" },
];

export default function DraftHomeLayout() {
  return (
    <main className="bg-background">
      <div className="bg-accent px-5 py-3 text-center text-sm font-semibold text-accent-foreground">
        DRAFT LAYOUT — brainstorm only (English). The earlier homepage continues below.
      </div>

      <Section n={1} tag="The problem" title="Millions have lost status. Fear leads to costly mistakes." tone="bg-muted">
        <p>Millions of people have lost status in the U.S. That is scary. When people are scared and do not have good information, they panic.</p>
        <Bullets items={["Money wasted on legal fees", "Homes, cars and businesses left unprotected", "Debts and liabilities left open", "Often: deportation and the loss of everything"]} />
        <p className="text-2xl font-bold text-foreground">It doesn't have to be this way.</p>
      </Section>

      <Section n={2} tag="The solution" title="Know before you act. Act before it's too late.">
        <p>Detención Defensa is a technology company built to help people losing status protect their American dream.</p>
        <p>It was designed with attorneys, realtors, mortgage brokers, business brokers and pastors to give you:</p>
        <Bullets items={["True information about your status", "Your rights and your options", "Tools to make a real plan for today"]} />
        <p className="italic">Let's make the best of a bad situation.</p>
      </Section>

      <Section n={3} tag="Step 1 — Free" title="Know your status: about 15 questions" tone="bg-muted">
        <p><Badge>FREE</Badge></p>
        <p>Based on where you are from, how long you have been here and your history, we show what the law and courts say about:</p>
        <Bullets items={["How long you have to apply for another status — or if that time has passed", "Whether you could return in 3 years, 10 years, or never", "How realistic it is to delay removal", "Whether to pay for more defense, or build an exit plan"]} />
        <div className="rounded-lg border-2 border-destructive bg-background p-4">
          <p className="font-bold text-foreground">Don't trust promises from people selling hope.</p>
          <p className="text-base">[STATISTIC — needs an official source, e.g. EOIR / TRAC immigration court data, cited by name and year. Your "only 5% can stay" figure goes here once we confirm the source.]</p>
        </div>
        <Link to="/" className="inline-block rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Start the free check →</Link>
      </Section>

      <Section n={4} tag="How we stay free" title="You pay nothing. Here's how we get paid.">
        <p>Detención Defensa does not charge you. We are paid by service providers for the information we prepare for them (leads and ready-made files).</p>
        <Bullets items={["You can use any provider you choose", "Our partners agreed to lower fees", "When possible, they charge the buyer or lender — not you"]} />
      </Section>

      <Section n={5} tag="What's next — Free" title="Be ready before detention" tone="bg-muted">
        <p><Badge>FREE APP</Badge></p>
        <Bullets items={["Emergency app: push the SOS button → your family is alerted → we help find where you are held", "Release request (habeas) through a volunteer law firm — first 250 people who qualify", "Free document packet to fill out, notarize and keep safe"]} />
        <p className="font-semibold text-foreground">Your packet includes:</p>
        <Bullets items={["Limited power of attorney: bank, checking, credit cards", "School pickup and school papers for the kids", "Get the car out of impound", "Permission from the other parent to move the children"]} />
      </Section>

      <Section n={6} tag="Protect your home — Partner service" title="If you lose income or are deported, who pays the house?">
        <p><Badge paid>PARTNER SERVICE</Badge></p>
        <Bullets items={["Who will pay the mortgage, taxes and insurance?", "We build a plan and connect you to partners at a reduced fee", "Option: place the home in a trust (Save My Home Trust — Sorrentino Law Firm)", "Option: HELOC through a mortgage broker — must be done BEFORE detention", "Option: sell — we prepare the pre-title file for the realtor"]} />
        <div className="rounded-lg bg-muted p-6 text-center text-base">[Save My Home Trust video stays here]</div>
      </Section>

      <Section n={7} tag="Protect your business — Partner service" title="Your route is a business. It has value." tone="bg-muted">
        <p><Badge paid>PARTNER SERVICE</Badge></p>
        <p>Lawn route, pool route, mobile mechanic, handyman with regular customers — this is a business.</p>
        <Bullets items={["We help document what it is worth", "Keep it even if you leave the U.S. (trust + corporation)", "Or sell it through a business broker"]} />
        <div className="rounded-lg bg-background p-6 text-center text-base">[Save My Business video stays here]</div>
      </Section>

      <Section n={8} tag="Our partners" title="Trusted providers">
        <p className="text-base">Anyone may apply to advertise here. Today we work with:</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PARTNERS.map((p) => (
            <div key={p.name} className="rounded-lg border border-border p-4">
              <p className="font-bold text-foreground">{p.name}</p>
              <p className="text-base">{p.role}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Disclosure: partners pay Detención Defensa for leads and prepared files. This is advertising. [Firm to review for Florida Bar Rule 4-7.]</p>
        <Link to="/advertise" className="inline-block rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground">Advertise with us — see options →</Link>
      </Section>
    </main>
  );
}
