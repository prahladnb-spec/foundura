import type { Metadata } from "next";
import Link from "next/link";
import { UnsubscribeButton } from "@/components/unsubscribe-button";

export const metadata: Metadata = { title: "Stop scheme alerts", robots: { index: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const u = typeof sp.u === "string" ? sp.u : "";
  const t = typeof sp.t === "string" ? sp.t : "";
  return (
    <div className="mx-auto max-w-lg px-5 py-14">
      <h1 className="display text-[2.8rem] leading-none">Stop scheme alerts?</h1>
      {u && t ? (
        <>
          <p className="mt-4 text-lg text-neel-700">
            You&apos;ll stop getting the weekly email about schemes, deadlines and policy news. Your account and startup profile stay as they are.
          </p>
          <UnsubscribeButton u={u} t={t} />
        </>
      ) : (
        <p className="mt-4 text-lg text-neel-700">
          This link is incomplete. Sign in and turn alerts off from <Link href="/dashboard">My startup</Link>.
        </p>
      )}
    </div>
  );
}
