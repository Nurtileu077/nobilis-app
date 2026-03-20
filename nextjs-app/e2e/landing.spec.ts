import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display Nobilis branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Nobilis')).toBeVisible();
    await expect(page.getByText('Academy')).toBeVisible();
  });

  test('should display hero text', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Поступи в топ-вуз за рубежом')).toBeVisible();
  });

  test('should display stats', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('5000+')).toBeVisible();
    await expect(page.getByText('92%')).toBeVisible();
    await expect(page.getByText('30+')).toBeVisible();
  });

  test('should have CTA button that links to onboarding', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByText('Рассчитать шансы бесплатно');
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL('/onboarding');
  });
});
