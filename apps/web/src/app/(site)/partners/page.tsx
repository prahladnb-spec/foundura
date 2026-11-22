import type { Metadata } from "next";
import { INDIAN_STATES } from "@foundura/shared";

export const metadata: Metadata = {
  title: "Add the Scheme Scan to your website",
  description: "Free embeddable Scheme Scan for state startup missions, incubators, colleges and banks.",
};

export default function PartnersPage() {
  const host = process.env.NEXT_PUBLIC_SITE_URL ?? "https://foundura.org";
  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">Add the Scheme Scan to your website</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-neel-700">
        Free for state startup missions, incubators, college E-cells, banks and CA firms. Your founders check which central
        and state schemes they qualify for without leaving your site.
      </p>

      <h2 className="display mt-10 text-4xl">Paste one line</h2>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-neel-900 p-4 text-[0.95rem] text-paper">
        <code>{`<script src="${host}/embed.js" data-state="KA" async></script>`}</code>
      </pre>
      <p className="mt-3 text-neel-700">
        Put it where the widget should appear. It resizes itself to fit. Optional attributes:
      </p>
      <dl className="mt-3 border-t-2 border-neel-900">
        {[
          ["data-state", `Pre-select a state, e.g. KA. Codes: ${INDIAN_STATES.slice(0, 6).map((s) => s.value).join(", ")}, and so on.`],
          ["data-stage", "Pre-select a stage: idea, prototype, early_revenue or growth."],
          ["data-entity-type", "Pre-select a registration type, e.g. private_limited."],
          ["data-max-width", "Maximum width in pixels (default 960)."],
        ].map(([k, v]) => (
          <div key={k} className="grid gap-2 border-b border-rule py-3 md:grid-cols-[12rem_1fr]">
            <dt className="font-semibold">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="display mt-10 text-4xl">What your founders get</h2>
      <ul className="mt-3 list-disc pl-5 space-y-1.5 max-w-[65ch]">
        <li>The same scan as on Foundura: every scheme shows the conditions met, not met, or still to confirm.</li>
        <li>Links to the official source for each scheme.</li>
        <li>No sign-up, no cookies, and no answers stored.</li>
      </ul>

      <h2 className="display mt-10 text-4xl">Try it</h2>
      <p className="mt-2 text-neel-700">This is the widget as it appears on a partner site.</p>
      <iframe
        src="/embed/scan?state=KA"
        title="Foundura Scheme Scan preview"
        className="mt-4 h-[900px] w-full rounded-xl border-2 border-neel-900 bg-paper"
        loading="lazy"
      />
    </div>
  );
}
