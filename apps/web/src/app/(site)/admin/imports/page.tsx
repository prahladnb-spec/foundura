import { AdminImports } from "@/components/admin-imports";

export const metadata = { title: "Imports" };

export default function AdminImportsPage() {
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Imports</h1>
      <p className="mt-3 mb-6 max-w-[65ch] text-slate">
        The weekly events scan and the daily policy newsroom fill two sheets. Rows marked “To verify” show that label on the site until
        someone confirms them.
      </p>
      <AdminImports />
    </>
  );
}
