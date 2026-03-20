import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should display welcome step', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByText('В какую страну')).toBeVisible();
    await expect(page.getByText('Начать')).toBeVisible();
  });

  test('should navigate to swipe step', async ({ page }) => {
    await page.goto('/onboarding');
    await page.getByText('Начать').click();
    await expect(page.getByText('Выбери минимум 3 страны')).toBeVisible();
  });

  test('should show country cards with swipe buttons', async ({ page }) => {
    await page.goto('/onboarding');
    await page.getByText('Начать').click();
    // Should show like/nope buttons
    await expect(page.locator('button').filter({ has: page.locator('svg') })).toHaveCount(3); // back + X + heart
  });

  test('should navigate to metrics after selecting 3 countries', async ({ page }) => {
    await page.goto('/onboarding');
    await page.getByText('Начать').click();

    // Click heart (like) 3 times
    const heartButtons = page.locator('button').last();
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(300);
      // Find and click the green heart button
      const hearts = page.locator('button:has(svg)');
      const lastBtn = hearts.last();
      await lastBtn.click();
    }

    // Should show metrics form
    await expect(page.getByText('Расскажи о себе')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Onboarding Metrics', () => {
  test('should render metrics form elements', async ({ page }) => {
    // Navigate directly — the page handles step state
    await page.goto('/onboarding');
    await page.getByText('Начать').click();

    // Skip to metrics by swiping 3 right
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(200);
      const buttons = page.locator('button');
      await buttons.last().click();
    }

    await page.waitForTimeout(500);

    // Check form elements
    await expect(page.getByText(/Твой GPA/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Уровень английского')).toBeVisible();
    await expect(page.getByText(/IELTS балл/)).toBeVisible();
    await expect(page.getByText(/Бюджет на обучение/)).toBeVisible();
  });
});
