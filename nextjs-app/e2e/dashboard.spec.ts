import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should render dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Привет!')).toBeVisible();
    await expect(page.getByText('Мои заявки')).toBeVisible();
    await expect(page.getByText('Задачи от ментора')).toBeVisible();
  });

  test('should show stat cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Заявки')).toBeVisible();
    await expect(page.getByText('Документы')).toBeVisible();
    await expect(page.getByText(/Streak/)).toBeVisible();
    await expect(page.getByText('Nobilis Coins')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Все →')).toBeVisible();
  });
});

test.describe('Applications Page', () => {
  test('should render applications', async ({ page }) => {
    await page.goto('/dashboard/applications');
    await expect(page.getByText('Мои заявки')).toBeVisible();
    await expect(page.getByText('University of Toronto')).toBeVisible();
    await expect(page.getByText('KIT Karlsruhe')).toBeVisible();
  });

  test('should show anti-panic banner', async ({ page }) => {
    await page.goto('/dashboard/applications');
    await expect(page.getByText(/Университеты обычно отвечают/)).toBeVisible();
  });

  test('should have filter buttons', async ({ page }) => {
    await page.goto('/dashboard/applications');
    await expect(page.getByText(/Все \(5\)/)).toBeVisible();
  });
});

test.describe('Documents Page', () => {
  test('should render document vault', async ({ page }) => {
    await page.goto('/dashboard/documents');
    await expect(page.getByText('Сейф документов')).toBeVisible();
    await expect(page.getByText('Паспорт')).toBeVisible();
    await expect(page.getByText('IELTS сертификат')).toBeVisible();
  });
});

test.describe('Essays Page', () => {
  test('should render essay list', async ({ page }) => {
    await page.goto('/dashboard/essays');
    await expect(page.getByText('Эссе-редактор')).toBeVisible();
    await expect(page.getByText('Why UofT?')).toBeVisible();
  });
});

test.describe('Compare Page', () => {
  test('should render comparison table', async ({ page }) => {
    await page.goto('/dashboard/compare');
    await expect(page.getByText('Сравнение офферов')).toBeVisible();
    await expect(page.getByText('BEST MATCH')).toBeVisible();
  });
});
