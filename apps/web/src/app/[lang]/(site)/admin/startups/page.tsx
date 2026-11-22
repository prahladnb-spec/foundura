import { AdminStartups } from "@/components/admin-startups";

export const metadata = { title: "Startups" };

export default function AdminStartupsPage() {
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Startup showcase</h1>
      <p className="mt-3 mb-6 max-w-[65ch] text-slate">
        Startups whose founders switched on a public profile, newest changes first. Hide a listing that is spam, misleading or
        breaks the terms of use. Hiding takes it off the public showcase and sitemap at once; the founder&apos;s own setting is
        kept, and their dashboard tells them it was hidden.
      </p>
      <AdminStartups />
    </>
  );
}
