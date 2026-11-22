import type { Block, Template } from "@/documents/types";

/** File format names are product names, kept in English on Hindi pages. */
export const FORMAT = { doc: "Word", deck: "PowerPoint", sheet: "Excel" } as const;

function BlockView({ b }: { b: Block }) {
  if ("h" in b) return <h3 className="mt-6 font-semibold text-neel-900">{b.h}</h3>;
  if ("p" in b) return <p className="mt-2">{b.p}</p>;
  if ("note" in b) return <p className="mt-2 rounded bg-marigold-50 px-3 py-2 text-[0.92rem] italic text-marigold-ink">{b.note}</p>;
  if ("ul" in b) return <ul className="mt-2 list-disc space-y-1 pl-5">{b.ul.map((x) => <li key={x}>{x}</li>)}</ul>;
  if ("ol" in b) return <ol className="mt-2 list-decimal space-y-1 pl-5">{b.ol.map((x) => <li key={x}>{x}</li>)}</ol>;
  if ("table" in b) {
    const hasHead = b.table.head.some(Boolean);
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-[0.92rem]">
          {hasHead && (
            <thead>
              <tr>{b.table.head.map((x, i) => <th key={i} scope="col" className="border border-rule bg-neel-50 px-2.5 py-1.5 text-left font-semibold">{x}</th>)}</tr>
            </thead>
          )}
          <tbody>
            {b.table.rows.map((r, i) => (
              <tr key={i}>
                {b.table.head.map((_, j) => <td key={j} className={`border border-rule px-2.5 py-1.5 align-top ${!hasHead && j === 0 ? "font-semibold" : ""}`}>{r[j] ?? ""}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {b.sign.map((who) => (
        <p key={who} className="border-t border-neel-900 pt-1.5 text-[0.92rem]">{who}</p>
      ))}
    </div>
  );
}

/** The template as it appears in the downloaded file. Always English. */
export function TemplatePreview({ template, slideLabel, tabLabel }: { template: Template; slideLabel: (n: number) => string; tabLabel: string }) {
  if (template.kind === "doc") {
    return (
      <div lang="en" className="rounded-xl border border-rule bg-white px-5 py-5 md:px-8">
        {template.blocks.map((b, i) => <BlockView key={i} b={b} />)}
      </div>
    );
  }
  if (template.kind === "deck") {
    return (
      <ol className="grid gap-4 md:grid-cols-2">
        {template.slides.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-rule border-l-[6px] border-l-marigold bg-white px-5 py-4">
            <p className="text-[0.85rem] text-slate">{slideLabel(i + 1)}</p>
            <p lang="en" className="mt-1 font-semibold text-neel-900">{s.title}</p>
            <ul lang="en" className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem] text-neel-700">{s.prompts.map((x) => <li key={x}>{x}</li>)}</ul>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <dl className="border-t-2 border-neel-900">
      {template.sheets.map((s) => (
        <div key={s.name} className="grid gap-1 border-b border-rule py-3 md:grid-cols-[12rem_1fr]">
          <dt className="font-semibold"><span className="sr-only">{tabLabel}: </span><span lang="en">{s.name}</span></dt>
          <dd lang="en">{s.what}</dd>
        </div>
      ))}
    </dl>
  );
}
