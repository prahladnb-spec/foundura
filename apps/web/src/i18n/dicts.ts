import type { Lang } from "./config";
import { pt } from "./pt";
import { fr } from "./fr";
import { ja } from "./ja";
import { bn } from "./bn";
import { gu } from "./gu";
import { te } from "./te";
import { ta } from "./ta";
import { kn } from "./kn";
import { mr } from "./mr";
import { en, type Dict } from "./en";
import { hi } from "./hi";
import { es } from "./es";
import { de } from "./de";
import { ar } from "./ar";
import { he } from "./he";

/** Every interface dictionary. Server code reads them through getDict(); tests import this directly. */
export const DICTS: Record<Lang, Dict> = { en, hi, es, de, ar, he, mr, kn, ta, te, gu, bn, ja, fr, pt };
