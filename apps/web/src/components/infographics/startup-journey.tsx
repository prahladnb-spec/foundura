import { docText } from "@/documents/text";
import type { Lang } from "@/i18n/config";
import { docBySlug } from "@/documents";
import type { Dict } from "@/i18n";
import Link from "@/components/locale-link";
import { Steps, type StepLink } from "./steps";

/**
 * The 8 stages of the startup life cycle, each with the templates, schemes and pages that help.
 * The same stages, in more depth, are the first chapter of the funding basics course (/basics/stages).
 */
export function StartupJourney({ t, lang }: { t: Dict; lang: Lang }) {
  const j = t.learn.journey;
  const doc = (slug: string): StepLink => {
    const d = docBySlug(slug)!;
    return { href: `/documents/${slug}`, label: docText(d, lang).title, kind: d.template.kind };
  };
  const scheme = (slug: string, label: string): StepLink => ({ href: `/schemes/${slug}`, label, kind: "scheme" });
  const links: StepLink[][] = [
    [doc("lean-canvas")],
    [doc("customer-interview-script"), doc("competitor-comparison")],
    [doc("incorporation-checklist"), doc("founders-agreement"), scheme("dpiit-startup-recognition", j.dpiit)],
    [doc("ip-assignment"), doc("trademark-checklist"), scheme("nidhi-prayas", j.nidhi)],
    [doc("go-to-market-plan"), scheme("public-procurement-relaxations", j.gem), { href: "/events", label: j.events, kind: "events" }],
    [doc("pitch-deck"), scheme("startup-india-seed-fund", j.seedFund), { href: "/investors", label: j.investors, kind: "investors" }],
    [{ href: "/funding", label: j.funding, kind: "page" }],
    [{ href: "/basics/rounds", label: j.rounds, kind: "page" }],
  ];
  return (
    <section aria-labelledby="journey-h" className="mt-10 rounded-xl border-2 border-neel-900 bg-white p-6 md:p-8">
      <h2 id="journey-h" className="display text-3xl">{j.title}</h2>
      <p className="mt-1 mb-7 max-w-[60ch] text-[0.95rem] text-slate">{j.lead}</p>
      <Steps cols={8} label={j.title} steps={j.stages.map((s, i) => ({ ...s, links: links[i] }))} />
      <p className="mt-8">
        <Link href="/basics/stages" className="font-semibold text-neel-500 underline">{j.chapter}</Link>
      </p>
    </section>
  );
}
