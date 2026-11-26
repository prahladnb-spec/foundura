import type { Metadata } from "next";
import { JOURNEY, JOURNEY_STAGES, JOURNEY_STEPS, type JourneyStage, type JourneyStep } from "@foundura/shared/constants";
import { Monogram } from "@/components/icons";
import { f, getDict } from "@/i18n";
import { isLang, type Lang } from "@/i18n/config";
import { api, ApiError } from "@/lib/api";
import { fmtDate, userTextLang } from "@/lib/format";
import { lookingForLabel, sectorLabel, stageLabel, stateLabel } from "@/lib/labels";
import type { StartupPublic } from "@/lib/types";
import { lab } from "@/i18n/util";

type Params = Promise<{ token: string; lang: string }>;
type Shared = {
  startup: StartupPublic;
  readiness: { score: number; band: string } | null;
  progress: { stage: JourneyStage | null; done: string[] } | null;
  expiresAt: string;
};

const langOf = (l: string): Lang => (isLang(l) ? l : "en");

async function load(token: string): Promise<Shared | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  try {
    // Never cached: a link the founder switches off must stop working at once.
    return await api<Shared>(`/shared/${token}`, { revalidate: 0 });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(langOf(lang)).share.pageTitle, robots: { index: false, follow: false }, referrer: "no-referrer" };
}

export const dynamic = "force-dynamic";

/** Links founders add never pass this page's address on: it holds the link's key. */
const OUT = "nofollow ugc noopener noreferrer";

/** What an incubator or investor sees through a founder's private link. Never shows figures. */
export default async function SharedProfilePage({ params }: { params: Params }) {
  const p = await params;
  const lang = langOf(p.lang);
  const t = getDict(lang);
  const d = t.startup;
  const sh = t.share;
  const data = await load(p.token);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-14">
        <h1 className="display text-5xl">{sh.expiredTitle}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-neel-700">{sh.expired}</p>
      </div>
    );
  }

  const s = data.startup;
  const rows: [string, string][] = [];
  if (s.sectors.length) rows.push([d.sectors, s.sectors.map((x) => sectorLabel(x, lang)).join(", ")]);
  if (s.stage) rows.push([d.stage, stageLabel(s.stage, lang)]);
  if (s.state) rows.push([d.basedIn, stateLabel(s.state, lang)]);
  if (s.foundedYear) rows.push([d.founded, String(s.foundedYear)]);
  const badges = [s.dpiitRecognised && d.dpiit, s.isDeepTech && d.deepTech].filter(Boolean) as string[];
  const names = t.learn.journey.stages;
  const pr = data.progress;
  const stageIdx = pr?.stage ? JOURNEY_STAGES.indexOf(pr.stage) : -1;
  const doneAll = pr ? pr.done.filter((x) => (JOURNEY_STEPS as string[]).includes(x)).length : 0;

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10">
      <p className="rounded-lg border border-marigold bg-marigold-50 px-4 py-3 text-neel-900">
        {f(sh.pageNote, { name: s.name, date: fmtDate(data.expiresAt, true, lang) })}
      </p>
      <div className="mt-6 flex items-center gap-5">
        <Monogram name={s.name} className="h-16 w-16 text-[1.3rem] md:h-20 md:w-20 md:text-[1.6rem]" />
        <h1 lang={userTextLang(s.name, lang)} className="display text-5xl md:text-6xl">{s.name}</h1>
      </div>
      {s.oneLiner && <p lang={userTextLang(s.oneLiner, lang)} className="mt-3 max-w-[60ch] text-xl text-neel-700">{s.oneLiner}</p>}
      {badges.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded border border-leaf px-2 py-0.5 text-[0.88rem] font-semibold text-leaf">{b}</span>
          ))}
        </p>
      )}
      {(s.productUrl || s.website) && (
        <p className="mt-6 flex flex-wrap gap-3">
          {s.productUrl && (
            <a href={s.productUrl} target="_blank" rel={OUT} className="rounded-md bg-neel-900 px-5 py-2.5 font-semibold text-paper no-underline">{d.product}</a>
          )}
          {s.website && (
            <a href={s.website} target="_blank" rel={OUT} className="rounded-md border-2 border-neel-900 px-5 py-2 font-semibold no-underline">{d.website}</a>
          )}
        </p>
      )}

      {data.readiness && (
        <section aria-labelledby="ready-h" className="mt-8 rounded-xl border-2 border-neel-900 bg-white p-6">
          <h2 id="ready-h" className="display text-3xl">{t.founderInv.readiness}</h2>
          <p className="mt-1 text-lg">
            <strong className="display text-4xl">{data.readiness.score}</strong> / 100, {String(lab(t.labels.band, data.readiness.band)).toLowerCase()}
          </p>
          <div className="mt-3 h-3 rounded-full bg-neel-100" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.readiness.score} aria-label={t.founderInv.readinessAria}>
            <div className={`h-3 rounded-full ${data.readiness.score >= 75 ? "bg-leaf" : "bg-marigold"}`} style={{ width: `${data.readiness.score}%` }} />
          </div>
          <p className="mt-2 text-[0.92rem] text-slate">{sh.readinessNote}</p>
        </section>
      )}

      {pr && (
        <section aria-labelledby="progress-h" className="mt-8">
          <h2 id="progress-h" className="text-lg font-semibold">{sh.progressTitle}</h2>
          {stageIdx >= 0 ? (
            <>
              <p className="mt-2 text-lg">{f(sh.stageNow, { n: stageIdx + 1, stage: names[stageIdx].t })}</p>
              <ul className="mt-2 space-y-1">
                {JOURNEY[pr.stage!].map((x) => {
                  const id = `${pr.stage}.${x}` as JourneyStep;
                  const ok = pr.done.includes(id);
                  return (
                    <li key={id} className="flex gap-2">
                      <span aria-hidden="true" className={ok ? "text-leaf" : "text-slate"}>{ok ? "✓" : "○"}</span>
                      <span className={ok ? "" : "text-slate"}>{t.progress.steps[id]}<span className="sr-only"> ({ok ? sh.doneYes : sh.doneNo})</span></span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-slate">{sh.noStage}</p>
          )}
          <p className="mt-2 text-[0.92rem] text-slate">{f(t.progress.overall, { n: doneAll, m: JOURNEY_STEPS.length })}</p>
        </section>
      )}

      {s.lookingFor.length > 0 && (
        <section aria-labelledby="looking-h" className="mt-8">
          <h2 id="looking-h" className="text-lg font-semibold">{d.lookingFor}</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {s.lookingFor.map((x) => (
              <li key={x} className="rounded-full border border-marigold bg-marigold-50 px-3 py-1 text-marigold-ink">{lookingForLabel(x, lang)}</li>
            ))}
          </ul>
        </section>
      )}
      {s.description && (
        <section aria-labelledby="about-h" className="mt-8">
          <h2 id="about-h" className="text-lg font-semibold">{d.about}</h2>
          <div lang={userTextLang(s.description, lang)} className="mt-2 max-w-[65ch] space-y-3 text-lg">
            {s.description.split(/\n{2,}/).map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
          </div>
        </section>
      )}
      {rows.length > 0 && (
        <dl className="mt-8 border-t-2 border-neel-900">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-rule py-3">
              <dt className="font-semibold">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-8 max-w-[65ch] text-[0.93rem] text-slate">{sh.pageFoot}</p>
    </article>
  );
}
