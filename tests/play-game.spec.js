import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

function randomAnswer() {
  return Math.random() < 0.5 ? 0 : 1;
}

async function randomDelay() {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * 4000) + 1000; // Random delay between 1000ms and 5000ms
    setTimeout(resolve, delay);
  })
}

test('A player can play the game', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('textbox', { name: 'Lagnamn 🥳' }).fill(faker.person.fullName())
  await page.getByRole('button', { name: 'Starta' }).click();

  await randomDelay();

  await page.getByTestId(`answer-${randomAnswer()}`).click();
  await page.getByRole('button', { name: 'Nästa' }).click();

  await randomDelay();

  await page.getByTestId(`answer-${randomAnswer()}`).click();
  await page.getByRole('button', { name: 'Nästa' }).click();

  await randomDelay();

  await page.getByTestId(`answer-${randomAnswer()}`).click();
  await page.getByRole('button', { name: 'Nästa' }).click();

  await randomDelay();

  await page.getByTestId(`answer-${randomAnswer()}`).click();
  await page.getByRole('button', { name: 'Klar!' }).click();

  await randomDelay();

  await expect(page.getByText('Dina svar är registrerade.')).toBeVisible();
});
