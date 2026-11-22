import "server-only";
import type { Lang } from "@/i18n/config";
import { getDict } from "@/i18n";
import { labelsFor } from "./labels-core";

/** Server-side label helpers by language. Client components use `labelsFor(t)` from labels-core. */
const L = (lang: Lang) => labelsFor(getDict(lang));
export const sectorLabel = (v: string, lang: Lang = "en") => L(lang).sector(v);
export const stageLabel = (v: string | null | undefined, lang: Lang = "en") => L(lang).stage(v);
export const lookingForLabel = (v: string, lang: Lang = "en") => L(lang).lookingFor(v);
export const stateLabel = (v: string | null | undefined, lang: Lang = "en") => L(lang).state(v);
export const investorTypeLabel = (v: string, lang: Lang = "en") => L(lang).investorType(v);
export const entityLabel = (v: string, lang: Lang = "en") => L(lang).entity(v);
export const inrLakh = (v: number, lang: Lang = "en") => L(lang).inrLakh(v);
export const chequeRange = (min: number, max: number, lang: Lang = "en") => L(lang).chequeRange(min, max);
