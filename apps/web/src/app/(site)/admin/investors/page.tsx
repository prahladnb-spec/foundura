import { AdminInvestors } from "@/components/admin-investors";

export const metadata = { title: "Investors" };

export default function AdminInvestorsPage() {
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Investors</h1>
      <p className="mt-3 mb-6 max-w-[65ch] text-slate">
        Verify an investor once you&apos;ve confirmed who they are, for example from their firm&apos;s website or a call. Verified
        investors get a badge in the directory. Hiding a profile takes it out of the directory and founders&apos; matches.
      </p>
      <AdminInvestors />
    </>
  );
}
