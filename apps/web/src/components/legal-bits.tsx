import type { Lang } from "@/i18n/config";
import type { LegalDetails } from "@/lib/legal";

const TEXT = {
  en: {
    pending: "to be added before launch",
    officer: "Grievance officer",
    name: "Name",
    email: "Email",
    company: "Company name",
    address: "Address",
    promise: "We acknowledge every complaint within 24 hours and resolve it within 15 days, telling you what we did and why.",
  },
  hi: {
    pending: "लॉन्च से पहले जोड़ा जाएगा",
    officer: "शिकायत अधिकारी",
    name: "नाम",
    email: "ईमेल",
    company: "कंपनी का नाम",
    address: "पता",
    promise: "हम हर शिकायत की पावती 24 घंटे के भीतर देते हैं और 15 दिनों के भीतर उसका निपटारा करते हैं, और बताते हैं कि हमने क्या किया और क्यों।",
  },
};

/** Shows a value, or a visible marker so a missing detail can't slip through to launch unnoticed. */
export function Fill({ value, what, lang = "en" }: { value: string | null; what: string; lang?: Lang }) {
  if (value) return <>{value}</>;
  return <mark className="rounded bg-marigold-50 px-1 text-marigold-ink">{what} ({TEXT[lang].pending})</mark>;
}

export function GrievanceContact({ legal, lang = "en" }: { legal: LegalDetails; lang?: Lang }) {
  const t = TEXT[lang];
  return (
    <div className="not-prose my-5 rounded-md border border-rule bg-white px-5 py-4">
      <p className="font-semibold">{t.officer}</p>
      <p className="mt-1">
        <Fill value={legal.grievanceName} what={t.name} lang={lang} />
        <br />
        {legal.grievanceEmail ? <a href={`mailto:${legal.grievanceEmail}`}>{legal.grievanceEmail}</a> : <Fill value={null} what={t.email} lang={lang} />}
        <br />
        <Fill value={legal.entity} what={t.company} lang={lang} />, <Fill value={legal.address} what={t.address} lang={lang} />
      </p>
      <p className="mt-2 text-[0.95rem] text-slate">{t.promise}</p>
    </div>
  );
}
