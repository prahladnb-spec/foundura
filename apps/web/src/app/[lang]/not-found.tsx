"use client";

import Link from "@/components/locale-link";
import { Art } from "@/components/art";
import { useT } from "@/i18n/client";

/** Shown for unknown pages. Rendered without the site chrome (which needs the server), but in the visitor's language. */
export default function NotFound() {
  const { t } = useT();
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-5 pt-16 pb-24">
      <Link href="/" lang="en" className="display text-[1.7rem] text-neel-900 no-underline">Foundura</Link>
      <Art name="empty" eager className="art-settle mt-8 w-[260px]" />
      <h1 className="display mt-4 text-6xl">{t.notFound.title}</h1>
      <p className="mt-3 text-lg text-neel-700">{t.notFound.body}</p>
      <p className="mt-6 flex gap-4">
        <Link href="/scan" className="rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 no-underline">{t.notFound.start}</Link>
        <Link href="/schemes" className="underline text-neel-500 self-center">{t.notFound.all}</Link>
      </p>
    </main>
  );
}
