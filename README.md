# Farmer Registry Automation

Automated end-to-end tests for Farmer Registry using [Playwright](https://playwright.dev/).

## Project Structure

- `tests/` - Playwright test specs (individual, registration, event data, DMS, etc.)
- `utils/` - Utility scripts for authentication, CSV generation, and helpers
- `files/` - Sample CSVs and images for import/export tests
- `downloads/` - Downloaded files during tests (ignored by git)
- `uploads/` - Generated files for re-import (ignored by git)
- `.github/workflows/` - CI workflow for Playwright tests

## Setup

1. Install dependencies:

    ```sh
    npm install
    ```

2. Configure environment variables in `utils/.env` (see `.gitignore`).

## Running Tests

Run all Playwright tests:

```sh
npx playwright test
```

View HTML test report:

```sh
npx playwright show-report
```

## Continuous Integration

Tests run automatically on GitHub Actions via [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml).

## Notes

- Sensitive files (`utils/.env`, `downloads/`, `uploads/`) are excluded from git.
- Update `utils/.env` with your credentials and