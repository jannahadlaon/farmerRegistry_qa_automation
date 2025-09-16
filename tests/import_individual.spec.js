import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';
import { loginAsFarmerAdmin, enableDevMode, generateCSV } from '../utils/utils.js';

test('Import Individual to Farmer Registry', async ({ browser }) => {
  test.setTimeout(200000); 
  const page = await loginAsFarmerAdmin(browser);
  await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Individuals' }).click();
  await page.locator('[data-tooltip="Actions"]').click();
  await page.getByRole('menuitem', { name: 'Import records' }).click();
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Upload File' }).click(),
  ]);
  await fileChooser.setFiles('files/ImportIndividuals.csv');
  await expect(page.getByRole('button', { name: 'Test' })).toBeVisible();
  await page.getByRole('button', { name: 'Test' }).click();
  await expect(page.locator('b')).toContainText('Everything seems valid.');
  await expect(page.getByRole('paragraph').filter({ hasText: 'Everything seems valid.' })).toBeVisible();
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('10 records successfully imported');
});

test('Export Individual from Farmer Registry', async ({ browser }) => {
  test.setTimeout(200000); 
  const page = await loginAsFarmerAdmin(browser);
  await enableDevMode(page);
  await page.getByRole('menuitem', { name: 'Individuals' }).click();
  await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
  await page.waitForSelector('table.o_list_table');
  await page.locator('table.o_list_table input[type="checkbox"]').first().check();
  await page.locator('span.o_dropdown_title:has-text("Actions")').waitFor({ state: 'visible' });
  await page.locator('span.o_dropdown_title:has-text("Actions")').click();
  await page.locator('span.dropdown-item:has-text("Export")').click();
  await page.getByText('I want to update data (import-compatible export)').click();
  await page.getByRole('radio', { name: 'XLSX' }).check();
  
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ]);

  const filePath = await download.path();
  const newFilePath = path.join('downloads', download.suggestedFilename());
  await fs.rename(filePath, newFilePath);
});

test('Update Existing Individual Info via import', async ({ browser }) => {
  test.setTimeout(200000); 
  const page = await loginAsFarmerAdmin(browser);
  await enableDevMode(page);
  //Import Individual
  await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Individuals' }).click();
  await page.locator('[data-tooltip="Actions"]').waitFor({ state: 'visible' }); 
  await page.locator('[data-tooltip="Actions"]').click();
  await page.getByRole('menuitem', { name: 'Import records' }).click();
  const [fileChooserImport] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Upload File' }).click(),
  ]);
  await fileChooserImport.setFiles('files/ToUpdate_Indiv.csv');
  await expect(page.getByRole('button', { name: 'Test' })).toBeVisible();
  await page.getByRole('button', { name: 'Test' }).click();
  await expect(page.locator('b')).toContainText('Everything seems valid.');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('1 records successfully imported');
  // Export Individual
  await page.getByRole('menuitem', { name: 'Individuals' }).click();
  await page.waitForSelector('table.o_list_table');
  await page.getByRole('searchbox').fill("DELA CRUZ, JUAN");
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByRole('cell', { name: "DELA CRUZ, JUAN" })).toBeVisible();
  const rowLocator = page.locator(`tr:has(td:has-text("DELA CRUZ, JUAN"))`);
  await rowLocator.locator('input[type="checkbox"]').check();
  await page.locator('span.o_dropdown_title:has-text("Actions")').waitFor({ state: 'visible' });
  await page.locator('span.o_dropdown_title:has-text("Actions")').click();
  await page.locator('span.dropdown-item:has-text("Export")').click();
  await page.getByText('I want to update data (import-compatible export)').waitFor({ state: 'visible' });
  await page.getByText('I want to update data (import-compatible export)').click();
  // await page.locator('#o-export-search-filter').fill('farmer');
  // await page.locator('div[data-field_id="farmer_family_name"] span.fa.fa-plus.float-end.m-1.o_add_field').click();
  // await page.locator('div[data-field_id="farmer_given_name"] span.fa.fa-plus.float-end.m-1.o_add_field').click();
  await page.locator('#o-export-search-filter').fill('name');
  await page.locator('div[data-field_id="family_name"] span.fa.fa-plus.float-end.m-1.o_add_field').click();
  await page.locator('div[data-field_id="given_name"] span.fa.fa-plus.float-end.m-1.o_add_field').click();
  await page.getByRole('radio', { name: 'CSV' }).check();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ]);
  // Save the downloaded file to the downloads folder
  const downloadsDir = path.join(__dirname, '..', 'downloads');
  await fs.mkdir(downloadsDir, { recursive: true });
  const exportedFilePath = path.join(downloadsDir, download.suggestedFilename());
  await download.saveAs(exportedFilePath);
  // Close the export dialog
  await page.locator('button[data-hotkey="z"]').click();
  // Edit and Re-import Individual
  const newImportFilePath = path.join(__dirname, '..', 'uploads', 'Updated_Indiv.csv');
  await generateCSV(exportedFilePath, newImportFilePath);
  await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Individuals' }).click();
  await page.locator('[data-tooltip="Actions"]').waitFor({ state: 'visible' }); 
  await page.locator('[data-tooltip="Actions"]').click();
  await page.getByRole('menuitem', { name: 'Import records' }).click();
  const [fileChooserReimport] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Upload File' }).click(),
  ]);
  await fileChooserReimport.setFiles(newImportFilePath);
  await expect(page.getByRole('button', { name: 'Test' })).toBeVisible();
  await page.getByRole('button', { name: 'Test' }).click();
  await expect(page.locator('b')).toContainText('Everything seems valid.');
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('1 records successfully imported');
});

test('Error Handling: No matching records found', async ({ browser }) => {
  test.setTimeout(200000); 
  const page = await loginAsFarmerAdmin(browser);
  await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Individuals' }).click();
  await page.locator('[data-tooltip="Actions"]').click();
  await page.getByRole('menuitem', { name: 'Import records' }).click();
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Upload File' }).click(),
  ]);
  await fileChooser.setFiles('files/NoMatchingRecord.csv');
  await expect(page.getByRole('button', { name: 'Test' })).toBeVisible();
  await page.getByRole('button', { name: 'Test' }).click();
  // Locate the alert role and check for the first error message.
  await expect(page.getByRole('paragraph').filter({ hasText: 'The file contains blocking' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('No matching record found for name \'Fire stricken\' in field \'Tags\'');
  await page.getByRole('button', { name: 'Cancel' }).click();
  console.log('Import cancelled');
});

test('Error Handling: Column contains incorrect values', async ({ browser }) => {
  const page = await loginAsFarmerAdmin(browser);
  await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Individuals' }).click();
  await page.locator('[data-tooltip="Actions"]').click();
  await page.getByRole('menuitem', { name: 'Import records' }).click();
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Upload File' }).click(),
  ]);
  await fileChooser.setFiles('files/IncorrectValues.csv');
  await expect(page.getByRole('button', { name: 'Test' })).toBeVisible();
  await page.getByRole('button', { name: 'Test' }).click();
  // Locate the alert role and check for the first error message.
  await expect(page.getByRole('paragraph').filter({ hasText: 'Column birthdate contains incorrect values. Error in line 1: time data \'01-1998-28\' does not match format \'%Y-%m-%d\'' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  console.log('Import cancelled');
  //Upload the correct file
  await page.locator('[data-tooltip="Actions"]').click();
  await page.getByRole('menuitem', { name: 'Import records' }).click();
  const [fileChooser2] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Upload File' }).click(),
  ]);
  await fileChooser2.setFiles('files/CorrectValues.csv');
  await page.getByRole('button', { name: 'Test' }).click();
  await expect(page.locator('b')).toContainText('Everything seems valid.');
  await expect(page.getByRole('paragraph').filter({ hasText: 'Everything seems valid.' })).toBeVisible();
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('1 records successfully imported');
  console.log('Import successful');
});

test('Error Handling: To import, select a field', async ({ browser }) => {
  const page = await loginAsFarmerAdmin(browser);
  await expect(page.getByRole('menuitem', { name: 'Individuals' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Individuals' }).click();
  await page.locator('[data-tooltip="Actions"]').click();
  await page.getByRole('menuitem', { name: 'Import records' }).click();
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Upload File' }).click(),
  ]);
  await fileChooser.setFiles('files/ToImportSelected.csv');
  await expect(page.getByRole('button', { name: 'Test' })).toBeVisible();
  await page.getByRole('button', { name: 'Test' }).click();
  // Locate the alert role and check for the first error message.
  await expect(page.getByRole('button', { name: 'To import, select a field...' })).toBeVisible();
  await page.getByRole('button', { name: 'To import, select a field...' }).click();
  await page.getByRole('menuitem', { name: 'Additional Name', exact: true }).click();
  await page.getByRole('button', { name: 'Test' }).click();
  await expect(page.getByRole('button', { name: 'To import, select a field...' })).toBeHidden();
  await expect(page.locator('b')).toContainText('Everything seems valid.');
  await expect(page.getByRole('paragraph').filter({ hasText: 'Everything seems valid.' })).toBeVisible();
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('1 records successfully imported');
  console.log('Import successful');
});

//Need to work on anything BELLOW
test('Error Handling: not allowed to access Import Matching', async ({ browser }) => {
});