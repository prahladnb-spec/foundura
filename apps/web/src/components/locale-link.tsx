"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { DEFAULT_LANG, isLang, lp } from "@/i18n/config";

/** next/link that keeps the visitor in their language: "/scan" becomes "/hi/scan" on Hindi pages. */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const params = useParams<{ lang?: string }>();
  const lang = isLang(params?.lang) ? params.lang : DEFAULT_LANG;
  return <NextLink href={typeof href === "string" ? lp(lang, href) : href} {...rest} />;
}
