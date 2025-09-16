import { getHttpCredentials } from './authHelper';
import fs from 'fs/promises';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { faker } from '@faker-js/faker';

export async function loginAsFarmerAdmin(browser) {
  const targetUrl = process.env.TICAO3_URL;
  const context = await browser.newContext({
    httpCredentials: getHttpCredentials(targetUrl),
  });
  const page = await context.newPage();
  await page.goto(targetUrl);
  await page.getByRole('link', { name: 'devel' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ADMIN_USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  return page;
}

export async function loginAsSPMISAdmin(browser) {
  const targetUrl = process.env.TICAO2_URL;
  const context = await browser.newContext({
    httpCredentials: getHttpCredentials(targetUrl),
  });
  const page = await context.newPage();
  await page.goto(targetUrl);
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ADMIN_USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  return page;
}

export async function enableDevMode(page) {
  await page.locator('button[data-hotkey="h"]').click();
  await page.getByRole('menuitem', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Activate the developer mode', exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('link', { name: 'Activate the developer mode', exact: true }).click();
}

export async function generateCSV(filePath, newFilePath) {
  try {
    const data = await fs.readFile(filePath, { encoding: 'utf-8' });
    const records = await new Promise((resolve, reject) => {
      parse(data, {
        columns: true,
        skip_empty_lines: true
      }, (err, records) => {
        if (err) return reject(err);
        resolve(records);
      });
    });
    const updatedRecords = records.map(record => {
      const newFirstName = faker.person.firstName();
      const newLastName = faker.person.lastName();
      const newBirthdate = faker.date.past({ years: 100, refDate: '2025-01-01' }).toISOString().split('T')[0];
      const newAddress = `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`;
      // record.farmer_given_name = newFirstName;
      // record.farmer_family_name = newLastName;
      record.given_name = newFirstName;
      record.family_name = newLastName;
      record.birthdate = newBirthdate;
      record.address = newAddress;
      record.name = `${newLastName.toUpperCase()}, ${newFirstName.toUpperCase()}`;
      return record;
    });
    const output = await new Promise((resolve, reject) => {
      stringify(updatedRecords, { header: true }, (err, output) => {
        if (err) return reject(err);
        resolve(output);
      });
    });
    await fs.writeFile(newFilePath, output, 'utf-8');
    return newFilePath;
  } catch (err) {
    console.error('Error in updateCsvData:', err);
    throw err;
  }
}

export async function getAllAutoCompleteOptions(page, selector) {
    return await page.evaluate((selector) => {
        // Wait a bit for the dropdown to fully load
        const dropdown = document.querySelector('.o-autocomplete--dropdown-menu.show');
        if (!dropdown) return [];
        
        // Get all list items that are actual bank options (not search more or start typing)
        const items = dropdown.querySelectorAll("li:not(.o_m2o_dropdown_option_search_more):not(.o_m2o_start_typing):not(.o_m2o_dropdown_option)");
        
        // Filter out items that contain "Search More" or "Start typing" in their text
        const validOptions = [...items].filter(item => {
            const text = item.textContent.trim();
            return text && 
                   !text.includes('Search More') && 
                   !text.includes('Start typing') && 
                   !text.includes('Loading') &&
                   text.length > 0;
        });
        
        return validOptions.map(o => o.textContent.trim());
    }, selector);
}

export function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

export async function selectRandomDropdownOption(page, selector, dropdownName = 'dropdown') {
    await page.locator(selector).click();
    await page.waitForSelector('.o-autocomplete--dropdown-menu.show', { timeout: 30000 });
    await page.waitForTimeout(2000);
    const options = await getAllAutoCompleteOptions(page, selector);
    console.log(`Available ${dropdownName} options:`, options);
    if (options.length === 0) {
        throw new Error(`No valid ${dropdownName} options found in dropdown`);
    }
    const randomOption = getRandomItem(options);
    const optionElements = await page.locator('.o-autocomplete--dropdown-menu.show li a').all();
    let clicked = false;
    for (const element of optionElements) {
        const text = await element.textContent();
        if (text.trim() === randomOption) {
            await element.click();
            clicked = true;
            break;
        }
    }
    
    if (!clicked) {
        throw new Error(`Could not find option "${randomOption}" in dropdown`);
    }
    
    await page.waitForTimeout(500);
    return randomOption;
}

export async function selectRandomSelectOption(page, selectId, dropdownName = 'dropdown') {
    const options = await page.locator(`#${selectId} option`).allTextContents();
    const validOptions = options.filter(option => option.trim() !== '' && option !== 'false');
    console.log(`Available ${dropdownName} options:`, validOptions);
    
    if (validOptions.length === 0) {
        throw new Error(`No valid ${dropdownName} options found in select`);
    }
    
    const randomOption = getRandomItem(validOptions);
    await page.selectOption(`#${selectId}`, randomOption);
    console.log(`Selected ${dropdownName}: ${randomOption}`);
    return randomOption;
}

export async function clickRandomGroup(page, tableSelector = 'table.o_list_table', rowType = 'row') {
    await page.waitForSelector(tableSelector, { timeout: 10000 });
    const rows = await page.locator(`${tableSelector} tbody tr.o_data_row`).all();
    if (rows.length === 0) {
        console.log(`No ${rowType}s found in table`);
        return null;
    }
    console.log(`Found ${rows.length} ${rowType}s in table`);
    const randomRow = getRandomItem(rows);
    await randomRow.waitFor({ state: 'visible' });
    const cells = await randomRow.locator('td').all();
    let rowText = '';
    for (const cell of cells) {
        const cellText = await cell.textContent();
        if (cellText && cellText.trim() !== '') {
            rowText = cellText.trim();
            break;
        }
    }
    if (!rowText) {
        const rowId = await randomRow.getAttribute('data-id');
        console.log(`Row data-id: ${rowId}`);
        rowText = `Group_${rowId}`; // Fallback name
    }
    console.log(`About to click on ${rowType}: "${rowText}"`);
    await randomRow.click({ force: true });
    await page.waitForTimeout(2000);
    return rowText;
}

