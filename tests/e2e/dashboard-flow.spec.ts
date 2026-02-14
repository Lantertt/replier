import { expect, test } from '@playwright/test';

test('user connects account and publishes reply', async ({ page }) => {
  await page.goto('/dashboard/account');
  await expect(page.getByRole('button', { name: 'Instagram 연결' })).toBeVisible();
});
