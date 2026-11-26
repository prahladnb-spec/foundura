import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { PageIntro } from "@/components/art";
import { getDict } from "@/i18n";
import { isLang } from "@/i18n/config";
import { legalDetails } from "@/lib/legal";
import { pageMetadata } from "@/seo";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("about", isLang(lang) ? lang : "en");
}

/** Who runs Foundura, what it does, and the promises it keeps. Who runs it comes from the server's settings. */
export default async function AboutPage({ params }: { params: Params }) {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : "en";
  const t = getDict(lang);
  const a = t.about;
  const entity = legalDetails().entity;
  const [pBefore, pAfter] = a.whoPending.split("{link}");
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10">
      <PageIntro art="showcase">
        <h1 className="display text-6xl md:text-7xl">{a.title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{a.lead}</p>
      </PageIntro>

      <section aria-labelledby="what-h" className="mt-12">
        <h2 id="what-h" className="display text-4xl">{a.whatTitle}</h2>
        <ul className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {a.what.map((w) => (
            <li key={w.t} className="border-t-2 border-neel-900 pt-3">
              <h3 className="text-lg font-semibold">{w.t}</h3>
              <p className="mt-1 text-neel-700">{w.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="promise-h" className="mt-12 rounded-xl bg-neel-900 p-6 text-paper md:p-8">
        <h2 id="promise-h" className="display text-4xl">{a.promiseTitle}</h2>
        <ul className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {a.promises.map((p) => (
            <li key={p.t} className="border-t-2 border-marigold pt-3">
              <h3 className="font-display text-xl font-bold">{p.t}</h3>
              <p className="mt-1 text-neel-100">{p.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="not-h">
          <h2 id="not-h" className="display text-3xl">{a.notTitle}</h2>
          <p className="mt-3 max-w-[60ch] text-neel-700">{a.not}</p>
        </section>
        <section aria-labelledby="who-h">
          <h2 id="who-h" className="display text-3xl">{a.whoTitle}</h2>
          <p className="mt-3 max-w-[60ch] text-neel-700">
            {entity ? (
              a.who.replace("{entity}", entity)
            ) : (
              <>
                {pBefore}
                <Link href="/privacy" className="underline">{t.chrome.footer.privacy}</Link>
                {pAfter}
              </>
            )}
          </p>
        </section>
      </div>

      <section aria-labelledby="fix-h" className="mt-12 border-t-2 border-neel-900 pt-6">
        <h2 id="fix-h" className="display text-3xl">{a.fixTitle}</h2>
        <p className="mt-3 max-w-[62ch] text-neel-700">{a.fix}</p>
        <p className="mt-5 flex flex-wrap gap-3">
          <Link href="/contact" className="rounded-md bg-neel-900 px-5 py-3 font-semibold text-paper no-underline hover:bg-neel-950">{a.contact}</Link>
          <Link href="/scan" className="rounded-md border-2 border-neel-900 px-5 py-2.5 font-semibold text-neel-900 no-underline hover:bg-neel-900 hover:text-paper">{a.scan}</Link>
        </p>
      </section>
    </div>
  );
}
