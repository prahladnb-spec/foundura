import { AdminStories } from "@/components/admin-stories";

export const metadata = { title: "Founder stories" };

export default function AdminStoriesPage() {
  return (
    <>
      <h1 className="display text-[2.6rem] leading-none">Founder stories</h1>
      <p className="mt-3 mb-6 max-w-[65ch] text-slate">
        Stories founders sent for review. Publish only what you have read: check that nobody is named who might not have
        agreed, and that there are no private figures. You can&apos;t edit the text; send it back with a note and the
        founder changes it and confirms again. Publishing works only while the founder&apos;s consent covers the exact text.
        If someone named in a published story complains, take it down and send it back.
      </p>
      <AdminStories />
    </>
  );
}
