import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { loginAsFarmerAdmin, selectRandomSelectOption } from '../utils/utils.js';

async function GetGroupCount (page) {
    await page.getByRole('menuitem', { name: 'Groups' }).click();
    const pagerLocator = page.locator('.o_pager_limit');
    const initialCountText = await pagerLocator.textContent();
    const initialGroupCount = parseInt(initialCountText.replace(/,/g, ''), 10);
    console.log(`Initial number of groups: ${initialGroupCount}`);
    return initialGroupCount; 
}

async function newGroupCount(page) {
    await page.reload();
    await page.locator('button[data-hotkey="h"]').click();
    await page.locator('[data-menu-xmlid="g2p_registry_base.g2p_main_menu_root"]').first().click();
    await page.getByRole('menuitem', { name: 'Groups' }).click();
    const pagerLocator = page.locator('.o_pager_limit');
    const newCountText = await pagerLocator.textContent();
    const newGroupCount = parseInt(newCountText.replace(/,/g, ''), 10);
    console.log(`New number of groups: ${newGroupCount}`);
    return newGroupCount;
}

test('Generating Sample Farmer Data', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    const initialGroupCount = await GetGroupCount(page);
    await page.locator('button[data-hotkey="h"]').click();
    await page.locator('[data-menu-xmlid="g2p_registry_base.g2p_main_menu_root"]').first().click();
    await expect(page.getByText('Configuration')).toBeVisible();
    await page.getByRole('button', { name: 'Configuration' }).click();
    const menuItem = page.locator('a[data-menu-xmlid="spp_farmer_registry_demo.menu_generate_farmer_data"]');
    await expect(menuItem).toBeVisible();
    await menuItem.click();
    await expect(page.getByText('Generate Farmer Data')).toBeVisible();
    await page.getByRole('button', { name: 'New' }).click();
    const sampleData = 'Sample Data' + faker.string.numeric(5);
    console.log(`Generated ID Name: ${sampleData}`);
    await page.locator('#name_0').fill(sampleData);
    const numberOfGroups = faker.number.int({ min: 1, max: 5 });
    console.log(`Number of groups to generate: ${numberOfGroups}`);
    await page.locator('#num_groups_0').fill(String(numberOfGroups));
    const selectedLocale = await selectRandomSelectOption(page, 'locale_0', '');
    console.log(`Selected locale: ${selectedLocale}`);
    await page.getByRole('button', { name: 'Save manually' }).click();
    await page.getByRole('button', { name: 'Generate Sample Data' }).click();
    //New Group Count and verify
    const newCount = await newGroupCount(page);
    console.log(`New number of groups: ${newCount}`);
    await expect(newCount).toBe(initialGroupCount + numberOfGroups);
    console.log(`Generated Sample Farmer Data successfully.`);
});