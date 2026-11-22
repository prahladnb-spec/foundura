import type { LegalDetails } from "@/lib/legal";

/** Shows a value, or a visible marker so a missing detail can't slip through to launch unnoticed. */
export function Fill({ value, what }: { value: string | null; what: string }) {
  if (value) return <>{value}</>;
  return <mark className="rounded bg-marigold-50 px-1 text-marigold-ink">{what} (to be added before launch)</mark>;
}

export function GrievanceContact({ legal }: { legal: LegalDetails }) {
  return (
    <div className="not-prose my-5 rounded-md border border-rule bg-white px-5 py-4">
      <p className="font-semibold">Grievance officer</p>
      <p className="mt-1">
        <Fill value={legal.grievanceName} what="Name" />
        <br />
        {legal.grievanceEmail ? <a href={`mailto:${legal.grievanceEmail}`}>{legal.grievanceEmail}</a> : <Fill value={null} what="Email" />}
        <br />
        <Fill value={legal.entity} what="Company name" />, <Fill value={legal.address} what="Address" />
      </p>
      <p className="mt-2 text-[0.95rem] text-slate">
        We acknowledge every complaint within 24 hours and resolve it within 15 days, telling you what we did and why.
      </p>
    </div>
  );
}
