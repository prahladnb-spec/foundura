import { notFound } from "next/navigation";

/** Any unknown address inside a language shows that language's "page not found". */
export default function CatchAll() {
  notFound();
}
