// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/admin');

  await expect(page.getByText('Magnus 50')).toBeVisible();
});
