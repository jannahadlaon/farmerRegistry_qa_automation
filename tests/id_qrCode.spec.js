import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { loginAsFarmerAdmin, selectRandomDropdownOption } from '../utils/utils.js';

async function createIdType(page) {
    await page.locator('[data-menu-xmlid="g2p_registry_base.menu_id_type"]').click();
    await page.getByRole('button', { name: 'New' }).click();
    const idName = 'Test ID ' + faker.string.numeric(5);
    console.log(`Generated ID Name: ${idName}`);
    await page.getByRole('textbox').first().fill(idName);
    await page.getByRole('button', { name: 'Save' }).click();
    return idName;
}

test('Create ID type', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    await expect(page.getByText('Configuration')).toBeVisible();
    await page.locator('[data-hotkey="3"]').click();
    const idName = await createIdType(page);
    await page.getByRole('searchbox').fill(idName);
    await page.getByRole('searchbox').press('Enter');
    await expect(page.locator(`td.o_list_char[name="name"][data-tooltip="${idName}"]`, { exact: true })).toHaveText(idName);
    console.log(`ID type created successfully with name: ${idName}`);
});

test('Edit ID type', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    await expect(page.getByText('Configuration')).toBeVisible();
    await page.locator('[data-hotkey="3"]').click();
    const idName = await createIdType(page);
    await page.getByRole('searchbox').fill(idName);
    await page.getByRole('searchbox').press('Enter');
    await expect(page.locator(`td.o_list_char[name="name"][data-tooltip="${idName}"]`, { exact: true })).toHaveText(idName);
    await page.locator(`td.o_list_char[name="name"][data-tooltip="${idName}"]`).click();
    const editedName = 'Test ID ' + faker.string.numeric(5) + '_edit';
    console.log(`Generated Edited ID Name: ${editedName}`);
    await page.getByRole('textbox').first().fill(editedName);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('searchbox').fill(editedName);
    await page.getByRole('searchbox').press('Enter');
    await page.getByRole('cell', { name: editedName }).click();
    await expect(page.getByRole('cell', { name: editedName }).getByRole('textbox')).toHaveValue(editedName);
    console.log(`ID type edited successfully to: ${editedName}`);

});

test('Delete ID type', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    await expect(page.getByText('Configuration')).toBeVisible();
    await page.locator('[data-hotkey="3"]').click();
    const idName = await createIdType(page);
    await page.getByRole('searchbox').fill(idName);
    await page.getByRole('searchbox').press('Enter');
    await page.getByRole('cell', { name: idName }).click();
    await expect(page.getByRole('cell', { name: idName }).getByRole('textbox')).toHaveValue(idName);
    await page.getByRole('row', { name: idName }).getByLabel('').check();
    await expect(page.getByRole('button', { name: 'Actions' })).toHaveText('Actions');
    await page.locator('button[data-hotkey="u"]').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'No, keep it' }).click();
    await expect(page.getByRole('button', { name: 'Actions' })).toHaveText('Actions');
    await page.locator('button[data-hotkey="u"]').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(5000);
    await expect(page.getByRole('cell', { name: idName }).getByRole('textbox')).toBeHidden();
    console.log(`ID type deleted successfully`);

});

test('Add an ID to an individual', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Individuals' }).click();
    await page.getByRole('button', { name: 'New' }).click();
    const lastName = faker.person.lastName();
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();  
    const fullName = `${lastName}, ${firstName} ${middleName}`;
    console.log(`Generated Full Name: Name: ${fullName}`);
    await page.locator('#family_name_0').fill(lastName);
    await page.locator('#given_name_0').fill(firstName);
    await page.locator('#addl_name_0').fill(middleName);
    // Add ID
    await page.getByRole('tab', { name: 'ids' }).click();
    await page.getByRole('button', { name: 'Add a line' }).click();
    const selectedIdType = await selectRandomDropdownOption(page, 'div[name="id_type"] input', 'id type');
    console.log(`Selected id type: ${selectedIdType}`);
    await page.locator('div[name="value"] input').fill(faker.string.numeric(12));
    await page.locator('div[name="description"] input').fill('This is a test');
    // Save Individual
    await page.getByRole('button', { name: 'Save manually' }).click();
    await page.getByRole('menuitem', { name: 'Individuals' }).click();
    await expect(page.getByRole('cell', { name: `${fullName.toUpperCase()}` })).toBeVisible();    
    console.log(`Individual created successfully with ID`);
});

test('Delete ID in an Individual', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Individuals' }).click();
    await page.getByRole('button', { name: 'New' }).click();
    const lastName = faker.person.lastName();
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();  
    const fullName = `${lastName}, ${firstName} ${middleName}`;
    console.log(`Generated Full Name: Name: ${fullName}`);
    await page.locator('#family_name_0').fill(lastName);
    await page.locator('#given_name_0').fill(firstName);
    await page.locator('#addl_name_0').fill(middleName);
    // Add ID
    await page.getByRole('tab', { name: 'ids' }).click();
    await page.getByRole('button', { name: 'Add a line' }).click();
    const selectedIdType = await selectRandomDropdownOption(page, 'div[name="id_type"] input', 'id type');
    console.log(`Selected id type: ${selectedIdType}`);
    await page.locator('div[name="value"] input').fill(faker.string.numeric(12));
    await page.locator('div[name="description"] input').fill('This is a test');
    // Save Individual
    await page.getByRole('button', { name: 'Save manually' }).click();
    // Delete ID
    await page.locator('button[aria-label="Delete row"]').click();
    await page.getByRole('button', { name: 'Save manually' }).click();
    // Verify the ID row is deleted (ID value input should not be visible)
    await expect(page.locator('div[name="value"] input')).toBeHidden();
    console.log(`ID deleted successfully`);
});

// test('Generate QR code', async ({ browser }) => {
// });