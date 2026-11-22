import { ADMIN_EMAIL } from "../playwright.config";
import { expect, newVisitor, signIn, test, uniqueEmail } from "./fixtures";

test("startup showcase: list, page, filters, Hindi, editor hide, switch off", async ({ page, browser }) => {
  const name = `Shruti Hearing ${Date.now()}`;

  // Founder fills in a profile with showcase details and makes it public.
  await signIn(page, uniqueEmail("showcase"));
  await page.locator("#name").fill(name);
  await page.locator("#oneLiner").fill("Hand-held hearing screener for community health workers");
  await page.locator("#description").fill("Health workers screen a child in five minutes.\n\nPiloting in 12 clinics in Mysuru.");
  await page.locator("#website").fill("https://shruti.example.com");
  await page.locator("#productUrl").fill("https://shruti.example.com/demo");
  await page.getByRole("button", { name: "Pilot customers", exact: true }).click();
  await page.getByRole("button", { name: "Distributors", exact: true }).click();
  await page.locator("#entity").selectOption("private_limited");
  await page.locator("#inc").fill("2024-08-15");
  await page.locator("#st").selectOption("KA");
  await page.locator("#stage").selectOption("prototype");
  await page.locator("#dpiit").selectOption("true");
  await page.getByRole("button", { name: "MedTech / Medical devices", exact: true }).click();
  await page.locator("#to").fill("0.6");
  await page.locator("#raise").fill("150");
  await page.locator("label", { hasText: "Show a public profile" }).locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("Profile created.")).toBeVisible();

  // The dashboard links to the public page.
  await page.getByRole("link", { name: "See your public page" }).click();
  await expect(page).toHaveURL(/\/startups\/shruti-hearing-\d+-[a-f0-9]+$/);
  const url = new URL(page.url()).pathname;
  const main = page.locator("main");
  await expect(page.locator("h1")).toHaveText(name);
  await expect(main).toContainText("Hand-held hearing screener");
  await expect(main).toContainText("Piloting in 12 clinics in Mysuru.");
  await expect(main).toContainText("DPIIT-recognised startup");
  await expect(main.locator("dl")).toContainText("2024");
  await expect(main.locator("#looking-h + ul")).toContainText("Pilot customers");
  const product = page.getByRole("link", { name: "See the product" });
  await expect(product).toHaveAttribute("href", "https://shruti.example.com/demo");
  await expect(product).toHaveAttribute("rel", /nofollow/);
  // Never the turnover, the raise, or the full incorporation date.
  for (const secret of ["0.6", "150", "2024-08-15", "15 Aug"]) await expect(main).not.toContainText(secret);
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld).toMatchObject({ "@type": "Organization", name, foundingDate: "2024" });

  // Directory and filters.
  const visitor = await newVisitor(browser);
  await visitor.goto("/startups");
  await expect(visitor.locator("main li", { hasText: name })).toContainText("Pilot customers");
  await visitor.locator('select[name="sector"]').selectOption("medtech");
  await visitor.locator('select[name="lookingFor"]').selectOption("distributors");
  await visitor.getByRole("button", { name: "Filter" }).click();
  await expect(visitor).toHaveURL(/sector=medtech/);
  await expect(visitor.locator("main li", { hasText: name })).toBeVisible();
  await visitor.goto("/startups?sector=agritech");
  await expect(visitor.locator("main")).not.toContainText(name);

  // Hindi: interface in Hindi, the founder's English marked as English.
  await visitor.goto(`/hi${url}`);
  await expect(visitor.locator("h1")).toHaveAttribute("lang", "en");
  await expect(visitor.getByRole("link", { name: "प्रोडक्ट देखें" })).toBeVisible();
  await expect(visitor.locator("#looking-h + ul")).toContainText("पायलट ग्राहक");

  // In the sitemap, with its share image.
  const sitemap = await (await visitor.request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`${url}</loc>`);
  await visitor.goto(url);
  const ogUrl = await visitor.locator('meta[property="og:image"]').getAttribute("content");
  expect(new URL(ogUrl!).pathname).toContain(url);
  const og = await visitor.request.get(new URL(ogUrl!).pathname + new URL(ogUrl!).search);
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toBe("image/png");

  // An editor hides it: gone from the public site, the founder is told.
  const ed = await newVisitor(browser);
  await signIn(ed, ADMIN_EMAIL, { path: "/signin?next=/admin/startups" });
  const row = ed.locator("li", { hasText: name });
  await expect(row).toContainText("On the showcase");
  await row.getByRole("button", { name: "Hide from showcase" }).click();
  await expect(row).toContainText("Hidden");
  expect((await visitor.goto(url))?.status()).toBe(404);
  await visitor.goto("/startups");
  await expect(visitor.locator("main")).not.toContainText(name);
  await page.goto("/dashboard");
  await expect(page.getByRole("note")).toContainText("hidden your page from the showcase");
  await ed.goto("/admin/audit");
  await expect(ed.locator("ol li").first()).toContainText("Hid startup from showcase");

  // Shown again, then the founder switches the public profile off: gone at once.
  await ed.goto("/admin/startups");
  await ed.locator("li", { hasText: name }).getByRole("button", { name: "Show again" }).click();
  await expect(ed.locator("li", { hasText: name })).toContainText("On the showcase");
  expect((await visitor.goto(url))?.status()).toBe(200);
  await page.reload();
  await page.locator("label", { hasText: "Show a public profile" }).locator('input[type="checkbox"]').uncheck();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  expect((await visitor.goto(url))?.status()).toBe(404);
  expect(await (await visitor.request.get("/sitemap.xml")).text()).not.toContain(`${url}</loc>`);
});
