import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { loginAsFarmerAdmin } from '../utils/utils.js';

async function createDocType(page) {
    await page.locator('button[data-hotkey="h"]').click();
    await page.getByRole('menuitem', { name: 'DMS' }).click();
    await expect(page.getByText('Configuration')).toBeVisible();
    await page.locator('[data-menu-xmlid="spp_dms.menu_spp_dms_config"]').click();
    await page.locator('[data-menu-xmlid="spp_dms.menu_spp_dms_category"]').click();
    await page.getByRole('button', { name: 'New' }).click();
    const DocType = 'Test Doc ' + faker.string.numeric(5);
    console.log(`Generated Document Type: ${DocType}`);
    await page.getByRole('textbox').first().fill(DocType);
    await page.getByRole('button', { name: 'Save' }).click();
    return DocType;
}

test('Create Document type', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    const DocType = await createDocType(page);
    await page.locator('div[name="name"] input').fill(DocType);
    await page.getByRole('searchbox').fill(DocType);
    await page.getByRole('searchbox').press('Enter');
    await expect(page.locator(`td.o_list_char[name="name"][data-tooltip="${DocType}"]`, { exact: true })).toHaveText(DocType);
})

test('Edit Doc Type', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    const DocType = await createDocType(page);
    await page.locator('div[name="name"] input').fill(DocType);
    await page.getByRole('searchbox').fill(DocType);
    await page.getByRole('searchbox').press('Enter');
    await expect(page.locator(`td.o_list_char[name="name"][data-tooltip="${DocType}"]`, { exact: true })).toHaveText(DocType);
    await page.locator(`td.o_list_char[name="name"][data-tooltip="${DocType}"]`).click();
    const editedDoc = 'Test Doc ' + faker.string.numeric(5) + '_edit';
    console.log(`Generated Edited Doc Name: ${editedDoc}`);
    await page.getByRole('textbox').first().fill(editedDoc);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('searchbox').fill(editedDoc);
    await page.getByRole('searchbox').press('Enter');
    await page.getByRole('cell', { name: editedDoc }).click();
    await expect(page.getByRole('cell', { name: editedDoc }).getByRole('textbox')).toHaveValue(editedDoc);
});

test('Delete Doc Type', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    const DocType = await createDocType(page);
    await page.locator('div[name="name"] input').fill(DocType);
    await page.getByRole('searchbox').fill(DocType);
    await page.getByRole('searchbox').press('Enter');
    await expect(page.locator(`td.o_list_char[name="name"][data-tooltip="${DocType}"]`, { exact: true })).toHaveText(DocType);
    await page.getByRole('cell', { name: DocType }).click();
    await expect(page.getByRole('cell', { name: DocType }).getByRole('textbox')).toHaveValue(DocType);
    await page.getByRole('row', { name: DocType }).locator('input[type="checkbox"]').check();
    await expect(page.getByRole('button', { name: 'Actions' })).toHaveText('Actions');
    await page.locator('button[data-hotkey="u"]').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'No, keep it' }).click();
    await expect(page.getByRole('button', { name: 'Actions' })).toHaveText('Actions');
    await page.locator('button[data-hotkey="u"]').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(3000);
    await expect(page.getByRole('cell', { name: DocType }).getByRole('textbox')).toBeHidden();
});