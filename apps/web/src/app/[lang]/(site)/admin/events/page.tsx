import { AdminEvents } from "@/components/admin-events";

export const metadata = { title: "Events" };

export default function AdminEventsPage() {
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Events</h1>
      <p className="mt-3 mb-6 max-w-[65ch] text-slate">
        Keep the events calendar up to date from organisers&apos; own listings. Spreadsheet imports still work under Imports.
      </p>
      <AdminEvents />
    </>
  );
}
