import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy and your data",
  description: "What Foundura collects, why, and how to see, export or delete your data.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 prose-f">
      <h1 className="display text-6xl not-prose">Privacy and your data</h1>
      <p className="mt-4 text-lg">
        Foundura is built to India&apos;s Digital Personal Data Protection Act, 2023 and the EU GDPR. This page explains
        what we keep and the controls you have. Notice version 2026-11-22.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Scheme Scan answers:</strong> used for that one check and not stored.</li>
        <li><strong>Your email:</strong> to sign you in with a one-time code. We never ask for a password.</li>
        <li><strong>Your startup profile:</strong> only what you choose to fill in, to run scans and, if you allow it, to show a public profile.</li>
        <li><strong>Your consent choices:</strong> a dated record of what you agreed to, kept so you can see your history.</li>
      </ul>

      <h2>What we never do</h2>
      <ul>
        <li>Sell your data, or share it with investors unless you switch that on.</li>
        <li>Show your turnover, funding or shareholding on a public profile.</li>
        <li>Handle your money. Investors, providers and organisers deal with you directly.</li>
      </ul>

      <h2>Your controls</h2>
      <p>
        Signed in, open <Link href="/dashboard">My startup</Link> to change your consent choices, download everything we
        hold about you as a file, or delete your account. Deleting removes your account, startup profiles and consent
        records.
      </p>

      <h2>Where data is kept</h2>
      <p>On servers in India. Sign-in codes are stored only as a one-way hash and expire after 10 minutes.</p>

      <p><em>Questions or a complaint: write to our grievance officer (contact details to be added before launch).</em></p>
    </article>
  );
}
