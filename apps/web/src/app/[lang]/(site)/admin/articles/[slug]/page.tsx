import Link from "next/link";
import { notFound } from "next/navigation";
import { type AdminArticle, AdminArticleEditor } from "@/components/admin-article-editor";
import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/session";

export const metadata = { title: "Edit article" };

export default async function EditArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article: AdminArticle | null = null;
  if (slug !== "new") {
    try {
      article = await api<AdminArticle>(`/admin/articles/${encodeURIComponent(slug)}`, { token: await getToken() });
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    }
  }
  return (
    <>
      <Link href="/admin/articles" className="text-[0.95rem]">All articles</Link>
      <h1 className="display mt-2 mb-8 text-[2.4rem] leading-none">{article ? "Edit article" : "New article"}</h1>
      <AdminArticleEditor article={article} />
    </>
  );
}
