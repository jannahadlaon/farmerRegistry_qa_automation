import { test, expect } from '@playwright/test';
import path from 'path';
import { loginAsFarmerAdmin, selectRandomDropdownOption } from '../utils/utils.js';
import { faker } from '@faker-js/faker';

test('Creating a Change Request', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    await page.locator('button[data-hotkey="h"]').click();
    await expect(page.getByRole('menuitem', { name: 'Change Request' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Change Request' }).click();
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByLabel('Request Type:').selectOption('"spp.change.request.add.farmer"');
    const selectedRegistrant = await selectRandomDropdownOption(page, '#registrant_id_0', 'registrant');
    console.log('Selected registrant:', selectedRegistrant);
    const selectedApplicant = await selectRandomDropdownOption(page, '#applicant_id_0', 'applicant');
    console.log('Selected applicant:', selectedApplicant);
    const phoneNumber = '9386' + faker.string.numeric({ length: 6 });
    await page.locator('#applicant_phone_0').fill(phoneNumber);
    await page.getByRole('button', { name: 'CREATE' }).click();
    await page.locator('.fa-chevron-circle-right').click(); //Click NEXT button
    await page.getByRole('button', { name: 'Add a line' }).click();
    await selectRandomDropdownOption(page, '.o_field_widget.o_required_modifier.o_field_many2one input.o_input', 'person');
    await page.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: 'Head' }).click();    
    await page.getByRole('tab', { name: 'Attachments' }).click();
    await page.getByRole('button', { name: 'Request Form' }).click();
    const imagePath = path.resolve(__dirname, '../files/Image1.jpg');
    await page.getByLabel('Upload your file').setInputFiles(imagePath);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Request Validation' }).click();
    //Verification
    await page.getByRole('menuitem', { name: 'Change Request' }).click();
    await expect(page.locator('td:nth-child(6)').first()).toContainText('Add Farmer');
    await expect(page.getByText('Pending Validation', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: selectedApplicant }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: selectedRegistrant }).first()).toBeVisible();

});