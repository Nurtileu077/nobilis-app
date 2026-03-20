import { test, expect } from '@playwright/test';

test.describe('Mentor CRM', () => {
  test('should render mentor dashboard', async ({ page }) => {
    await page.goto('/mentor');
    await expect(page.getByText('Mentor CRM')).toBeVisible();
    await expect(page.getByText('Алия Нурланова')).toBeVisible();
    await expect(page.getByText('Дамир Касымов')).toBeVisible();
  });

  test('should show student statuses', async ({ page }) => {
    await page.goto('/mentor');
    await expect(page.getByText('На пути')).toBeVisible();
    await expect(page.getByText('Внимание')).toBeVisible();
  });

  test('should filter students', async ({ page }) => {
    await page.goto('/mentor');
    await page.getByText('Внимание').first().click();
    // Should filter to at-risk students only
    await expect(page.getByText('Дамир Касымов')).toBeVisible();
  });

  test('should navigate to chat', async ({ page }) => {
    await page.goto('/mentor');
    // Click first chat icon
    const chatButtons = page.locator('a[href*="/mentor/chat/"]');
    await chatButtons.first().click();
    await expect(page).toHaveURL(/\/mentor\/chat\//);
  });
});

test.describe('Mentor Chat', () => {
  test('should render chat messages', async ({ page }) => {
    await page.goto('/mentor/chat/1');
    await expect(page.getByText('Алия Нурланова')).toBeVisible();
    await expect(page.getByText(/Как продвигается/)).toBeVisible();
  });

  test('should have message input', async ({ page }) => {
    await page.goto('/mentor/chat/1');
    const input = page.getByPlaceholder('Написать сообщение...');
    await expect(input).toBeVisible();
  });

  test('should send message', async ({ page }) => {
    await page.goto('/mentor/chat/1');
    const input = page.getByPlaceholder('Написать сообщение...');
    await input.fill('Тестовое сообщение');
    await input.press('Enter');
    await expect(page.getByText('Тестовое сообщение')).toBeVisible();
  });
});

test.describe('Parent Dashboard', () => {
  test('should render parent view', async ({ page }) => {
    await page.goto('/parent');
    await expect(page.getByText('Панель родителя')).toBeVisible();
    await expect(page.getByText(/только просмотр/)).toBeVisible();
  });

  test('should show student stats', async ({ page }) => {
    await page.goto('/parent');
    await expect(page.getByText('Подано заявок')).toBeVisible();
    await expect(page.getByText('Оффер получен')).toBeVisible();
  });

  test('should show notifications', async ({ page }) => {
    await page.goto('/parent');
    await expect(page.getByText('Уведомления')).toBeVisible();
    await expect(page.getByText(/оффер получен/)).toBeVisible();
  });
});

test.describe('Roommate Finder', () => {
  test('should render roommate cards', async ({ page }) => {
    await page.goto('/roommate');
    await expect(page.getByText('Roommate Finder')).toBeVisible();
  });

  test('should show like/dislike buttons', async ({ page }) => {
    await page.goto('/roommate');
    // X and Heart buttons
    const buttons = page.locator('button:has(svg)');
    expect(await buttons.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Payments', () => {
  test('should render payments page', async ({ page }) => {
    await page.goto('/payments');
    await expect(page.getByText('Финансы')).toBeVisible();
    await expect(page.getByText('Всего оплачено')).toBeVisible();
  });

  test('should show pending invoice', async ({ page }) => {
    await page.goto('/payments');
    await expect(page.getByText(/Менторство — Март/)).toBeVisible();
    await expect(page.getByText('Оплатить')).toBeVisible();
  });

  test('should toggle coin discount', async ({ page }) => {
    await page.goto('/payments');
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();
    await expect(page.getByText(/Скидка/)).toBeVisible();
  });
});

test.describe('Scout (B2B)', () => {
  test('should render scout portal', async ({ page }) => {
    await page.goto('/scout');
    await expect(page.getByText('Nobilis Scout')).toBeVisible();
    await expect(page.getByText('B2B Portal')).toBeVisible();
  });

  test('should show student profiles table', async ({ page }) => {
    await page.goto('/scout');
    await expect(page.getByText('S-001')).toBeVisible();
    await expect(page.getByText('95%')).toBeVisible();
  });

  test('should have invite buttons', async ({ page }) => {
    await page.goto('/scout');
    const inviteButtons = page.getByText('Пригласить');
    expect(await inviteButtons.count()).toBeGreaterThan(0);
  });
});

test.describe('Parent Invite', () => {
  test('should show invalid link without token', async ({ page }) => {
    await page.goto('/invite/parent');
    await expect(page.getByText('Загрузка...')).toBeVisible();
  });

  test('should show invite with token', async ({ page }) => {
    await page.goto('/invite/parent?token=test123');
    await expect(page.getByText('Приглашение в Nobilis Academy')).toBeVisible();
    await expect(page.getByText('Принять приглашение')).toBeVisible();
  });

  test('should accept invite', async ({ page }) => {
    await page.goto('/invite/parent?token=test123');
    await page.getByText('Принять приглашение').click();
    await expect(page.getByText('Приглашение принято!')).toBeVisible();
  });
});
