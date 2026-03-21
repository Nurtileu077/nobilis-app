import { test, expect } from '@playwright/test';

test.describe('Prep (Gamification)', () => {
  test('should render skill tree', async ({ page }) => {
    await page.goto('/prep');
    await expect(page.getByText('Nobilis.Prep')).toBeVisible();
    await expect(page.getByText('Reading')).toBeVisible();
    await expect(page.getByText('Listening')).toBeVisible();
    await expect(page.getByText('Writing')).toBeVisible();
    await expect(page.getByText('Speaking')).toBeVisible();
  });

  test('should show locked Math skill', async ({ page }) => {
    await page.goto('/prep');
    await expect(page.getByText('Math (SAT)')).toBeVisible();
    await expect(page.getByText(/Достигни уровня 3/)).toBeVisible();
  });

  test('should show daily challenge', async ({ page }) => {
    await page.goto('/prep');
    await expect(page.getByText('Ежедневный челлендж')).toBeVisible();
  });

  test('should navigate to quiz from skill', async ({ page }) => {
    await page.goto('/prep');
    await page.getByText('Reading').click();
    await expect(page).toHaveURL(/\/prep\/quiz\/reading/);
  });
});

test.describe('Quiz Page', () => {
  test('should render quiz question', async ({ page }) => {
    await page.goto('/prep/quiz/reading');
    await expect(page.getByText(/Вопрос 1/)).toBeVisible();
    await expect(page.getByText(/Choose the correct word/)).toBeVisible();
  });

  test('should show answer options', async ({ page }) => {
    await page.goto('/prep/quiz/reading');
    await expect(page.getByText('A')).toBeVisible();
    await expect(page.getByText('B')).toBeVisible();
    await expect(page.getByText('C')).toBeVisible();
    await expect(page.getByText('D')).toBeVisible();
  });

  test('should show timer', async ({ page }) => {
    await page.goto('/prep/quiz/reading');
    await expect(page.getByText(/\d+s/)).toBeVisible();
  });

  test('should show hearts (lives)', async ({ page }) => {
    await page.goto('/prep/quiz/reading');
    // Hearts are SVG elements
    const hearts = page.locator('svg');
    expect(await hearts.count()).toBeGreaterThan(0);
  });
});

test.describe('Rewards Store', () => {
  test('should render rewards page', async ({ page }) => {
    await page.goto('/rewards');
    await expect(page.getByText('Nobilis Coins')).toBeVisible();
    await expect(page.getByText('450')).toBeVisible();
  });

  test('should show shop items', async ({ page }) => {
    await page.goto('/rewards');
    await expect(page.getByText(/Скидка 10%/)).toBeVisible();
    await expect(page.getByText(/AI эссе ревью/)).toBeVisible();
  });

  test('should switch between shop and history tabs', async ({ page }) => {
    await page.goto('/rewards');
    await page.getByText('История').click();
    await expect(page.getByText('Ежедневный челлендж')).toBeVisible();
    await page.getByText('Магазин').click();
    await expect(page.getByText(/Скидка 10%/)).toBeVisible();
  });
});
