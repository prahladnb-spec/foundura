import Link from "@/components/locale-link";
import { Fill, GrievanceContact } from "@/components/legal-bits";
import type { LegalDetails } from "@/lib/legal";

export function PrivacyEn({ legal, version }: { legal: LegalDetails; version: string }) {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 prose-f">
      <h1 className="display text-6xl not-prose">Privacy and your data</h1>
      <p className="mt-4 text-lg">
        This notice explains what personal data Foundura collects, why, and the controls you have. It follows India&apos;s Digital
        Personal Data Protection Act, 2023 and its Rules, and the EU GDPR. Version {version}.
      </p>

      <h2>Who is responsible</h2>
      <p>
        Foundura is run by <Fill value={legal.entity} what="Company name" />, <Fill value={legal.address} what="Address" />. We decide
        how your data is used, which makes us the &ldquo;data fiduciary&rdquo; under Indian law.
      </p>

      <h2>What we collect and why</h2>
      <ul>
        <li>
          <strong>Scheme Scan answers without an account:</strong> used for that one check and then discarded. Not stored.
        </li>
        <li>
          <strong>Your email address:</strong> to sign you in with a one-time code and to send the emails you asked for. We never
          ask for a password.
        </li>
        <li>
          <strong>Your startup profile</strong> (only what you fill in): to run scans for you, to score readiness, and, if you choose,
          to show a public profile and to appear in investor matches. A public profile's name, place, sector, stage, founding year and DPIIT status also appear on the city pages and in Foundura's open data downloads; switching the profile off removes them. It includes your stage and the steps you tick off in the
          progress tracker.
        </li>
        <li>
          <strong>Private profile links:</strong> if you make one, which parts it shows, when it was made and when it stops working.
          We keep only a scrambled copy of the link itself, and anyone you send it to sees only what you chose, never your figures.
          The link is deleted when it expires, when you switch it off or when you delete your profile.
        </li>
        <li>
          <strong>Investor profile and intro requests:</strong> if you list yourself as an investor or send or receive an intro, the
          profile and the messages, so the other side can decide. Email addresses are shared only when an intro is accepted.
        </li>
        <li>
          <strong>Scheme alerts history:</strong> if you turn alerts on, which schemes each weekly email mentioned, so the next one
          shows only what&apos;s new.
        </li>
        <li>
          <strong>Weekly email without an account:</strong> if you sign up at the bottom of a page, your email address, the language
          you chose and the dates you signed up, confirmed and were last sent the email, so we can send it. Nothing else is kept.
        </li>
        <li>
          <strong>Your consent choices:</strong> a dated record of each choice and the notice version you saw, so you can see your
          history and we can show what you agreed to.
        </li>
        <li>
          <strong>Basic server logs</strong> (IP address, time, page requested): to keep the service secure and to meet Indian
          cyber-security record-keeping rules.
        </li>
        <li>
          <strong>Anonymous usage counts:</strong> daily totals such as how many times a page was viewed, a template was downloaded or a
          Scheme Scan was run. They are not linked to you: no cookies, no IP address and no account go with them. We use them to see what
          founders find useful.
        </li>
      </ul>
      <p>We don&apos;t ask for caste, religion, Aadhaar or bank details, and we don&apos;t use advertising trackers.</p>

      <h2>Who sees it</h2>
      <ul>
        <li>
          <strong>The public:</strong> only the parts of your startup or investor profile you choose to publish. A public startup
          page in the showcase shows the name, one-line summary, description, website and product links, sectors, stage, state,
          year of incorporation, DPIIT and deep-tech status, and what you&apos;re looking for. Search engines can find it. Turnover,
          funding, the amount you&apos;re raising, your deck link and shareholding are never shown publicly. Switching the public
          profile off removes the page at once.
        </li>
        <li>
          <strong>Investors:</strong> your startup profile only if you made it public <em>and</em> turned on &ldquo;Show my
          profile to investors&rdquo;.
        </li>
        <li>
          <strong>Service providers</strong> who work for us under contract: DigitalOcean, which hosts the site and its database
          on servers in Bengaluru, and Zoho (ZeptoMail), which sends sign-in codes, intro updates and alerts from its India data
          centre.
        </li>
        <li>Authorities, only when Indian law requires it.</li>
      </ul>
      <p>We never sell your data. Foundura never handles money.</p>

      <h2>Your rights and how to use them</h2>
      <ul>
        <li>
          <strong>See and download your data:</strong> in <Link href="/dashboard">My startup</Link>, choose &ldquo;Download my
          data&rdquo; for a file with everything we hold about you.
        </li>
        <li>
          <strong>Correct it:</strong> edit your profiles any time from your dashboard, or ask the grievance officer.
        </li>
        <li>
          <strong>Withdraw consent:</strong> switch alerts or investor visibility off on your dashboard, as easily as you switched
          them on, or use the unsubscribe link in any alert email. The link in the weekly email deletes your address straight away.
        </li>
        <li>
          <strong>Erase it:</strong> delete your account from your dashboard. This removes your account, startup and investor
          profiles, intro requests, alert history, consent records and any weekly-email sign-up for your address straight away. Backups roll over within 14 days.
        </li>
        <li>
          <strong>Nominate someone</strong> to use these rights for you if you die or can no longer act yourself: email the
          grievance officer with their name and contact details.
        </li>
      </ul>

      <h2>Complaints</h2>
      <p>Write to our grievance officer first:</p>
      <GrievanceContact legal={legal} />
      <p>
        If you&apos;re not satisfied with our answer, you can complain to the Data Protection Board of India under the Digital
        Personal Data Protection Act, 2023.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Until you delete your account, apart from sign-in codes, which are stored only as a one-way hash and expire after 10 minutes,
        and server logs, which are kept for 180 days. A weekly-email address is kept until you unsubscribe; if you never confirm
        the sign-up, it is deleted after 7 days.
      </p>

      <h2>Age</h2>
      <p>Foundura is for people aged 18 or over. We don&apos;t knowingly create accounts for anyone younger.</p>

      <h2>Changes</h2>
      <p>
        If we change this notice in a way that affects you, we&apos;ll email account holders and ask again before using your data for
        anything new. See also our <Link href="/terms">terms of use</Link>.
      </p>
    </article>
  );
}
