import Link from "next/link";
import { notFound } from "next/navigation";
import { type AdminScheme, AdminSchemeEditor } from "@/components/admin-scheme-editor";
import { ApiError } from "@/lib/api";
import { editorApi } from "@/lib/editor-api";

export const metadata = { title: "Edit scheme" };

export default async function EditScheme({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let s: AdminScheme | null;
  try {
    s = await editorApi<AdminScheme>(`/admin/schemes/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (!s) return null;
  return (
    <>
      <Link href="/admin/schemes" className="text-[0.95rem]">All schemes</Link>
      <h1 className="display mt-2 mb-8 text-[2.4rem] leading-none">{s.name}</h1>
      <AdminSchemeEditor scheme={s} />
    </>
  );
}
