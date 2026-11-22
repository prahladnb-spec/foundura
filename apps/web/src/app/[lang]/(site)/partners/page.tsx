import { pageMetadata } from "@/seo";
import type { Metadata } from "next";
import { INDIAN_STATES } from "@foundura/shared";
import { f, getDict } from "@/i18n";
import { isLang, lp } from "@/i18n/config";

type Params = Promise<{ lang: string }>;
const langOf = async (params: Params) => {
  const { lang } = await params;
  return isLang(lang) ? lang : "en";
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata("partners", isLang(lang) ? lang : "en");
}

export default async function PartnersPage({ params }: { params: Params }) {
  const lang = await langOf(params);
  const t = getDict(lang);
  const pt = t.partners;
  const host = process.env.NEXT_PUBLIC_SITE_URL ?? "https://foundura.org";
  return (
    <div className="mx-auto max-w-4xl px-5 pt-10">
      <h1 className="display text-6xl md:text-7xl">{pt.title}</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-neel-700">{pt.lead}</p>

      <h2 className="display mt-10 text-4xl">{pt.paste}</h2>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-neel-900 p-4 text-[0.95rem] text-paper">
        <code>{`<script src="${host}/embed.js" data-state="KA"${lang === "hi" ? ' data-lang="hi"' : ""} async></script>`}</code>
      </pre>
      <p className="mt-3 text-neel-700">
        {pt.where}
      </p>
      <dl className="mt-3 border-t-2 border-neel-900">
        {[
          ["data-state", f(pt.attrs.state, { codes: INDIAN_STATES.slice(0, 6).map((s) => s.value).join(", ") })],
          ["data-stage", pt.attrs.stage],
          ["data-entity-type", pt.attrs.entity],
          ["data-lang", pt.attrs.lang],
          ["data-max-width", pt.attrs.width],
        ].map(([k, v]) => (
          <div key={k} className="grid gap-2 border-b border-rule py-3 md:grid-cols-[12rem_1fr]">
            <dt className="font-semibold"><code lang="en">{k}</code></dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="display mt-10 text-4xl">{pt.get}</h2>
      <ul className="mt-3 list-disc pl-5 space-y-1.5 max-w-[65ch]">
        {pt.bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>

      <h2 className="display mt-10 text-4xl">{pt.try}</h2>
      <p className="mt-2 text-neel-700">{pt.tryLead}</p>
      <iframe
        src={`${lp(lang, "/embed/scan")}?state=KA`}
        title={pt.previewTitle}
        className="mt-4 h-[900px] w-full rounded-xl border-2 border-neel-900 bg-paper"
        loading="lazy"
      />
    </div>
  );
}
