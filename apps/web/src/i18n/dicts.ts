import type { Lang } from "./config";
import { mr } from "./mr";
import { en, type Dict } from "./en";
import { hi } from "./hi";
import { es } from "./es";
import { de } from "./de";
import { ar } from "./ar";
import { he } from "./he";

/** Every interface dictionary. Server code reads them through getDict(); tests import this directly. */
export const DICTS: Record<Lang, Dict> = { en, hi, es, de, ar, he, mr };
