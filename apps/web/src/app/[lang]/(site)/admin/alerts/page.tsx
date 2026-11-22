import { AdminAlerts } from "@/components/admin-alerts";

export const metadata = { title: "Scheme alerts" };

export default function AdminAlertsPage() {
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Scheme alerts</h1>
      <p className="mt-3 mb-8 max-w-[65ch] text-slate">
        A weekly email for founders who turned on alerts: schemes they newly qualify for, schemes that changed, deadlines in the next two
        weeks, the week&apos;s policy news and new guides.
      </p>
      <AdminAlerts />
    </>
  );
}
