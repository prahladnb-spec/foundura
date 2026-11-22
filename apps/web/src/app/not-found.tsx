import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main id="main" className="flex-1 mx-auto w-full max-w-3xl px-5 pt-16">
        <h1 className="display text-6xl">Page not found</h1>
        <p className="mt-3 text-lg text-neel-700">It may have moved. Try the Scheme Scan or browse all schemes.</p>
        <p className="mt-6 flex gap-4">
          <Link href="/scan" className="rounded-md bg-marigold px-5 py-2.5 font-semibold text-neel-950 no-underline">Start Scheme Scan</Link>
          <Link href="/schemes" className="underline text-neel-500 self-center">All schemes</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
