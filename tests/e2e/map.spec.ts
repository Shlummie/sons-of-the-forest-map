import { expect, test } from "@playwright/test";

test("loads the map and exposes the core controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Sons of the Forest MAP/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Surface" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText(/visible records/i)).toBeVisible();
  await expect(page.locator(".leaflet-container")).toBeVisible();
});

test("searches aliases and opens a location detail", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder(/Search names/i).fill("shovel");
  await expect(page.getByText(/visible records/i)).toContainText(/1/);
  await expect(page.locator(".sotf-marker-host").first()).toBeVisible();
  await page.locator(".sotf-marker-host").first().click();
  await expect(page.getByRole("heading", { name: /Shovel/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Copy coordinates/i })).toBeVisible();
});

test("persists favorites and supports mobile filter drawer", async ({ page, isMobile }) => {
  await page.goto("/?location=sotf-4");
  if (isMobile) {
    const filterSidebar = page.getByRole("complementary", { name: /Map filters/i });
    if (await filterSidebar.evaluate((node) => node.classList.contains("is-open"))) await filterSidebar.getByRole("button", { name: /Close filters/i }).click();
    await page.locator(".mobile-filter-button").click();
    await expect(filterSidebar).toHaveClass(/is-open/);
    await filterSidebar.getByRole("button", { name: /Close filters/i }).click();
  }
  await expect(page.getByRole("heading", { name: "Modern Axe" })).toBeVisible();
  await page.getByRole("button", { name: /Favorite/i }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: /Favorited/i })).toBeVisible();
});
