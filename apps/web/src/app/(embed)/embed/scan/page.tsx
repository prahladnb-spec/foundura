import type { Metadata } from "next";
import { EmbedResizer } from "@/components/embed-resizer";
import { ScanForm } from "@/components/scan-form";

export const metadata: Metadata = { title: "Scheme Scan", robots: { index: false } };

/**
 * Chrome-free Scheme Scan for partner sites (state missions, incubators, colleges, banks).
 * Framing is allowed only on /embed/* (see next.config.ts). No cookies are set and nothing is stored.
 */
export default async function EmbedScan({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <main className="px-4 py-5 bg-paper">
      <EmbedResizer />
      <h1 className="display text-4xl">Which schemes do you qualify for?</h1>
      <p className="mt-2 mb-6 text-neel-700">Answer what you can. Nothing you enter is saved.</p>
      <ScanForm initial={{ state: sp.state, entityType: sp.entityType, stage: sp.stage }} embedded />
      <p className="mt-6 text-[0.85rem] text-slate">
        Powered by{" "}
        <a href="/?utm_source=embed" target="_blank" rel="noopener" className="underline">
          Foundura
        </a>
        , free help for Indian founders.
      </p>
    </main>
  );
}
