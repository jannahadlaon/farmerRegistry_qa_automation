import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { loginAsFarmerAdmin } from '../utils/utils.js';
import path from 'path';

test('Add Event Data to Individual', async ({ browser }) => {
    test.setTimeout(200000);
    const page = await loginAsFarmerAdmin(browser);
    // Go to Individuals and create a new one
    await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Individuals' }).click();
    await page.getByRole('button', { name: 'New' }).click();
    // Fill in Individual details
    const lastName = faker.person.lastName();
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const fullName = `${lastName}, ${firstName} ${middleName}`;
    await page.locator('#family_name_0').fill(lastName);
    await page.locator('#given_name_0').fill(firstName);
    await page.locator('#addl_name_0').fill(middleName);
    await page.getByRole('button', { name: /Save/i }).click();
    console.log('New Individual created:', fullName);
    // Go to Event Data tab
    await page.locator('button:has(.fa-calendar)').click();
    await page.locator('#event_data_model_0').selectOption({ label: 'House Visit' });
    await page.locator('button[name="next_page"]').click();
    // Fill event details
    const randomNumber = faker.number.int({ min: 0, max: 500 });
    await page.getByRole('textbox', { name: 'Summary' }).fill('This is a test');
    await page.getByRole('checkbox', { name: 'Is Farm' }).check();
    await page.getByRole('textbox', { name: 'Farm Size Acre' }).fill(String(randomNumber));
    await page.getByRole('textbox', { name: 'Number Of Pigs' }).fill(String(randomNumber));
    await page.getByRole('textbox', { name: 'Number Of Cows' }).fill(String(randomNumber));
    await page.getByRole('textbox', { name: 'No Food Stock' }).fill(String(randomNumber));
    await page.getByRole('checkbox', { name: 'Disabled' }).check();
    // Photo Upload
    await page.getByLabel('Upload your file').setInputFiles('files/Image1.jpg');
    await page.locator('button[name="create_event"]').click();
    // await page.getByLabel('Main actions').getByRole('button', { name: 'Save' }).click();

    // Verify event appears in the table
    await page.getByRole('tab', { name: /Event Data/i }).click();
    await expect(page.locator('tbody')).toContainText('House Visit');
    await page.locator('button[name="open_form"]').click();
    await expect(page.locator('div[name="summary"]')).toContainText('This is a test');
    await expect(page.getByRole('checkbox', { name: 'Is Farm' })).toBeChecked();
    await expect(page.locator('div[name="farm_size_acre"]')).toContainText(String(randomNumber)+ '.00');
    await expect(page.locator('div[name="number_of_pigs"]')).toContainText(String(randomNumber));
    await expect(page.locator('div[name="number_of_cows"]')).toContainText(String(randomNumber));
    await expect(page.locator('div[name="no_food_stock"]')).toContainText(String(randomNumber));
    await expect(page.getByRole('checkbox', { name: 'Disabled' })).toBeChecked();
    await expect(page.getByRole('link', { name: 'Image1.jpg' })).toBeVisible();
    await expect(page.getByText('Image1.jpg')).toBeVisible();
    console.log('Event Data verified successfully for Individual:', fullName);

});