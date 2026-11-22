import { chromium } from "@playwright/test";
const [,, file, out, w = "720", h = "620"] = process.argv;
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto("file://" + file); await p.waitForTimeout(300);
await p.screenshot({ path: out }); await b.close();
