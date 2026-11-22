/**
 * The home page's example result, presented as a sheet lying in an open government file: a manila
 * cover (drawn in CSS so it stretches with the sheet, which is longer in Hindi), the file's string
 * tie, a glass of chai, and a rubber stamp that comes down once as the result stamps appear.
 * All decoration is hidden from screen readers; the sheet itself is the content.
 */
export function HeroFile({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-file relative isolate px-3 pt-12 pb-14 sm:px-10 sm:pt-14 sm:pb-16">
      <div aria-hidden="true" className="hero-file-under" />
      <div aria-hidden="true" className="hero-file-cover">
        {/* eslint-disable @next/next/no-img-element -- static decorative SVGs */}
        <img src="/art/file-tab.svg" alt="" className="hero-file-tab" />
        <img src="/art/file-tie.svg" alt="" className="hero-file-tie" />
      </div>
      <div className="relative">{children}</div>
      <img src="/art/stamp-mark.svg" alt="" aria-hidden="true" className="hero-stamp-mark" />
      <img src="/art/chai.svg" alt="" aria-hidden="true" className="hero-chai" />
      <img src="/art/stamp-tool.svg" alt="" aria-hidden="true" className="hero-stamp-tool" />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}
