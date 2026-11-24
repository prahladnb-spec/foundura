import type { Block } from "@/basics/types";

/** Chapter text: paragraphs, lists, tables and tips. Server-rendered; wide tables scroll on phones. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.t === "p") return <p key={i} className="mt-4 max-w-[68ch]">{b.x}</p>;
        if (b.t === "tip")
          return (
            <p key={i} className="mt-5 max-w-[68ch] rounded-lg border-s-4 border-marigold bg-marigold-50 px-4 py-3">
              {b.x}
            </p>
          );
        if (b.t === "ul" || b.t === "ol") {
          const L = b.t;
          return (
            <L key={i} className={`mt-4 max-w-[68ch] space-y-2 ps-6 ${L === "ol" ? "list-decimal" : "list-disc"}`}>
              {b.x.map((x) => <li key={x}>{x}</li>)}
            </L>
          );
        }
        return (
          <div key={i} className="mt-5 overflow-x-auto" tabIndex={0} role="region" aria-label={b.head.join(", ")}>
            <table className="w-full min-w-[34rem] border-collapse text-start text-[0.95rem]">
              <thead>
                <tr className="border-b-2 border-neel-900">
                  {b.head.map((h) => <th key={h} scope="col" className="py-2 pe-4 text-start font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, j) => (
                  <tr key={j} className="border-b border-rule align-top">
                    {r.map((c, k) => (k === 0 ? <th key={k} scope="row" className="py-2.5 pe-4 text-start font-semibold">{c}</th> : <td key={k} className="py-2.5 pe-4">{c}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}
