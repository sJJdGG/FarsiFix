import { expect, test } from "@playwright/test";

test("exposes core SEO metadata and structured data", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/فارسی‌فیکس/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /نرمال/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://farsifix.site/",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://farsifix.site/og-image.svg",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index/);
  await expect(page.getByRole("navigation", { name: "ناوبری اصلی" })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("فارسی‌فیکس");

  const ldJsonRaw = await page.locator('script[type="application/ld+json"]').textContent();
  expect(ldJsonRaw).toBeTruthy();

  const ldJson = JSON.parse(ldJsonRaw ?? "{}") as {
    "@context"?: string;
    "@type"?: string;
    name?: string;
  };

  expect(ldJson["@context"]).toBe("https://schema.org");
  expect(ldJson["@type"]).toBe("SoftwareApplication");
  expect(ldJson.name).toBe("FarsiFix");
});

test("serves robots and sitemap assets", async ({ request }) => {
  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBe(true);
  await expect(await robotsResponse.text()).toContain("Sitemap:");

  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain("<urlset");
  expect(sitemap).toContain("<loc>https://farsifix.site/</loc>");
});
