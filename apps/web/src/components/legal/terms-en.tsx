import Link from "@/components/locale-link";
import { Fill, GrievanceContact } from "@/components/legal-bits";
import type { LegalDetails } from "@/lib/legal";

export function TermsEn({ legal, version }: { legal: LegalDetails; version: string }) {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 prose-f">
      <h1 className="display text-6xl not-prose">Terms of use</h1>
      <p className="mt-4 text-lg">
        These terms are the agreement between you and <Fill value={legal.entity} what="Company name" />, which runs Foundura. By
        creating an account or using the site you agree to them. Version {version}.
      </p>

      <h2>Who can use Foundura</h2>
      <ul>
        <li>You must be 18 or older to create an account.</li>
        <li>One account per person. Keep access to your email safe: anyone who can read it can sign in as you.</li>
        <li>If you act for a company or fund, you confirm you&apos;re allowed to.</li>
      </ul>

      <h2>What Foundura is, and what it isn&apos;t</h2>
      <ul>
        <li>
          Foundura gives information and makes introductions. It is <strong>not legal, tax, financial or investment advice</strong>.
          The document templates are starting points only: Foundura is not a law firm or a firm of chartered accountants. Where a
          template says it has been reviewed by a named professional, that review was general, not of your situation. In every case
          you must verify a template independently with your own chartered accountant and legal counsel before you sign, file or rely
          on it.
        </li>
        <li>
          Foundura is <strong>not a government website</strong> and isn&apos;t connected to DPIIT, Startup India or any scheme&apos;s
          authority. Scheme Scan results are a guide based on your answers and our summary of each scheme. Only the scheme&apos;s
          authority decides whether you qualify. Always check the official source linked on each scheme before you apply.
        </li>
        <li>
          Investor Connect only introduces people. Foundura doesn&apos;t recommend investments, check them, or take part in them, and
          isn&apos;t a SEBI-registered intermediary, investment adviser or crowdfunding platform. A &ldquo;verified&rdquo; badge
          means we confirmed who an investor is, not that they&apos;re a good fit. Any deal is between you and them, and you&apos;re
          responsible for following company and securities law.
        </li>
        <li>
          Events and policy news come from organisers and public sources. We don&apos;t run the events; check details with the
          organiser.
        </li>
      </ul>

      <h2>We never handle money</h2>
      <p>
        Foundura is free and never takes payments, fees or commissions. We will never ask you to pay to apply for a scheme, and never
        ask for your bank details, card details or a sign-in code over the phone. If anyone claiming to be Foundura asks for money,
        it isn&apos;t us. Please report it to the grievance officer.
      </p>

      <h2>Your content</h2>
      <ul>
        <li>
          You own what you put on Foundura: profiles, descriptions and messages. You let us store and show it as needed to run the
          service, including showing the parts you choose to make public.
        </li>
        <li>Keep it accurate. Don&apos;t claim recognitions, funding or traction you don&apos;t have.</li>
      </ul>

      <h2>What you must not post or do</h2>
      <p>You must not use Foundura to post, send or share anything that:</p>
      <ul>
        <li>belongs to someone else and you have no right to share it, or infringes a patent, trademark or copyright;</li>
        <li>is defamatory, obscene, invades someone&apos;s privacy, or harasses or insults anyone, including on the basis of gender, religion, caste or ethnicity;</li>
        <li>is harmful to children;</li>
        <li>is false or misleading, including pretending to be another person, company, investor or government body;</li>
        <li>offers or promotes anything illegal, including unregistered securities offers, money laundering or gambling;</li>
        <li>contains malware, or threatens India&apos;s unity, security, sovereignty, public order or relations with other countries;</li>
        <li>breaks any law in force in India.</li>
      </ul>
      <p>
        You also must not send unwanted intro requests in bulk, scrape the site, sign up automatically, try to get around rate
        limits, or try to break into accounts or systems. Partners may embed the Scheme Scan only as described on the{" "}
        <Link href="/partners">partners page</Link>.
      </p>
      <p>
        If you break these rules we may remove the content, hide your profile or close your account, and we&apos;ll tell you why. Where
        the law requires, we report it to the authorities.
      </p>

      <h2>Your privacy</h2>
      <p>
        How we handle personal data, and your rights over it, are explained in <Link href="/privacy">privacy and your data</Link>.
        You can download or delete your data at any time from your dashboard.
      </p>

      <h2>The service</h2>
      <ul>
        <li>
          We work to keep information correct and the site available, but we provide Foundura as it is, without promising it will
          always be complete, current or error-free.
        </li>
        <li>We may change or stop features. You can delete your account at any time.</li>
        <li>
          As far as Indian law allows, we&apos;re not responsible for decisions you make using information on Foundura, for what
          other users or investors do, or for losses that follow from them. Nothing here limits liability that can&apos;t be limited
          by law.
        </li>
      </ul>

      <h2>Changes to these terms</h2>
      <p>
        If we change these terms in a way that matters, we&apos;ll email account holders before the change takes effect and show the
        new version date here. We also remind account holders of these terms once a year.
      </p>

      <h2>Law and disputes</h2>
      <p>
        These terms are governed by the laws of India. Courts in <Fill value={legal.jurisdiction} what="City" /> have jurisdiction,
        but please raise any problem with the grievance officer first.
      </p>

      <h2>Complaints and contact</h2>
      <p>For complaints about content, accounts or these terms, write to our grievance officer:</p>
      <GrievanceContact legal={legal} />
      {legal.supportEmail && (
        <p>
          For anything else, write to <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>.
        </p>
      )}
    </article>
  );
}
