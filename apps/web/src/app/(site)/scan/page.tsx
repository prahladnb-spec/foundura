import type { Metadata } from "next";
import { ScanForm } from "@/components/scan-form";

export const metadata: Metadata = {
  title: "Scheme Scan",
  description: "Check which central and state government schemes your startup qualifies for, with the reasons.",
};

export default async function ScanPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">Scheme Scan</h1>
      <p className="mt-3 mb-10 max-w-[60ch] text-lg text-neel-700">
        The more you answer, the surer the result. Skip anything you don&apos;t know and Foundura will tell you what to
        check.
      </p>
      <ScanForm initial={{ state: sp.state, entityType: sp.entityType, stage: sp.stage }} />
    </div>
  );
}
