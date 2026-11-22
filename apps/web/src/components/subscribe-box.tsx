"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";

/** Subscribe links for the calendar feed with the current filters. */
export function SubscribeBox({ site, path }: { site: string; path: string }) {
  const { t } = useT();
  const ev = t.events;
  const [copied, setCopied] = useState(false);
  const https = `${site}${path}`;
  const webcal = https.replace(/^https?:/, "webcal:");
  return (
    <section aria-labelledby="subscribe-h" className="mt-10 rounded-xl border border-rule bg-white px-5 py-5">
      <h2 id="subscribe-h" className="text-lg font-semibold">{ev.subscribeTitle}</h2>
      <p className="mt-1 max-w-[64ch] text-neel-700">{ev.subscribeBody}</p>
      <p className="mt-3 flex flex-wrap items-center gap-3">
        <a href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`} target="_blank" rel="noopener noreferrer" className="rounded-md border-2 border-neel-900 px-4 py-1.5 font-semibold no-underline">
          {ev.subscribeGoogle}
        </a>
        <a href={webcal} className="rounded-md border-2 border-neel-900 px-4 py-1.5 font-semibold no-underline">{ev.subscribeApple}</a>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(https).then(() => setCopied(true));
          }}
          className="text-neel-500 underline"
        >
          {copied ? ev.copied : ev.subscribeCopy}
        </button>
      </p>
    </section>
  );
}
