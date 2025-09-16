import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { loginAsFarmerAdmin, selectRandomDropdownOption, selectRandomSelectOption, clickRandomGroup} from '../utils/utils.js';

test('Register Individual', async ({ browser }) => {
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
    // Add bank details
    await page.getByRole('tab', { name: 'Bank Details' }).click();
    await page.getByRole('button', { name: 'Add a line' }).click();
    const selectedBank = await selectRandomDropdownOption(page, 'div[name="bank_id"] input', 'bank');
    console.log(`Selected bank: ${selectedBank}`);
    await page.locator('div[name="acc_number"] input').fill(faker.finance.accountNumber());
    // Add Personal Info
    await page.getByRole('tab', { name: 'Personal Info' }).click();
    await page.locator('input#birthdate_1').fill(faker.date.past({ years: 100, refDate: '2025-01-01' }).toISOString().split('T')[0]);
    await page.getByRole('button', { name: 'Add a line' }).click();
    await page.locator('#phone_no_0').fill('+63938' + faker.string.numeric(7));
    await page.getByRole('button', { name: 'Save & Close' }).click();
    await page.locator('input#email_1').fill(faker.internet.email());
    await page.locator('#gender_1').click();
    const selectedSex = await selectRandomDropdownOption(page, 'div[name="gender"] input', '');
    console.log(`Selected sex: ${selectedSex}`);
    const selectedMaritalStatus = await selectRandomSelectOption(page, 'marital_status_0', 'marital status');
    const selectedEducation = await selectRandomSelectOption(page, 'highest_education_level_0', 'educational level');
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
});

test('Register Group', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    await expect(page.getByRole('menuitem', { name: 'Groups' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Groups' }).click();
    await page.getByRole('button', { name: 'New' }).click();
    const groupName = 'Farmer ' + faker.person.lastName();
    console.log(`Generated Group Name: ${groupName}`);
    await page.locator('input#name_0').fill(groupName);
    // Add Farmer in Group
    const lastName = faker.person.lastName();
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();  
    const fullName = `${lastName}, ${firstName} ${middleName}`;
    console.log(`Generated Full Name: Name: ${fullName}`);
    await page.locator('#farmer_family_name_0').fill(lastName);
    await page.locator('#farmer_given_name_0').fill(firstName);
    await page.locator('#farmer_addtnl_name_0').fill(middleName);
    await page.locator('#farmer_national_id_0').fill(faker.string.numeric(12));
    await page.locator('#farmer_mobile_tel_0').fill('+63938' + faker.string.numeric(7));
    await page.locator('#farmer_birthdate_0').fill(faker.date.past({ years: 100, refDate: '2025-01-01' }).toISOString().split('T')[0]);
    await page.locator('#farmer_household_size_0').fill(faker.number.int({ min: 0, max: 15 }).toString());
    await page.locator('#farmer_postal_address_0').fill(faker.location.city());
    await page.locator('#farmer_email_0').fill(faker.internet.email());
    await page.locator('#farmer_sex_0').click();
    const selectedSex = await selectRandomDropdownOption(page, 'div[name="farmer_sex"] input', 'farmer sex');
    console.log(`Selected sex: ${selectedSex}`);
    const selectedEducation = await selectRandomSelectOption(page, 'farmer_highest_education_level_0', 'educational level');
    console.log(`Selected educational level: ${selectedEducation}`);
    // Save Group
    await page.getByRole('button', { name: 'Save manually' }).click();
    await page.getByRole('menuitem', { name: 'Groups' }).click();
    await expect(page.getByRole('cell', { name: `${groupName}` })).toBeVisible();
});

test('Adding new individual to group', async ({ browser }) => {
    test.setTimeout(200000); 
    const page = await loginAsFarmerAdmin(browser);
    await expect(page.getByRole('menuitem', { name: 'Groups' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Groups' }).click();
    const groupName = await clickRandomGroup(page, 'table.o_list_table', 'group');
    if (!groupName) {
        throw new Error('No groups found in the list - cannot proceed with test');
    }
    await page.getByRole('tab', { name: 'Members' }).click();
    await page.getByRole('button', { name: 'Add a line' }).click();
    const selectedIndividual = await selectRandomDropdownOption(page, 'div[name="individual"] input', 'individual');
    console.log(`Selected individual: ${selectedIndividual}`);
    await page.getByRole('button', { name: 'Save & Close' }).click();
    await page.getByRole('button', { name: 'Save manually' }).click();
    // Assert that the individual is shown in the added individuals list
    const memberRowLocator = page.locator('tr').filter({ hasText: selectedIndividual });
    await expect(memberRowLocator).toBeVisible();
    console.log(`Successfully verified individual "${selectedIndividual}" is added to group "${groupName}"`);
    await page.getByRole('menuitem', { name: 'Groups' }).click();

});
