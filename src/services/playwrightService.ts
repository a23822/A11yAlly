import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { Result } from 'axe-core';

export async function getAccessibilityViolations(url: string): Promise<Result[]> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    return accessibilityScanResults.violations;
  } finally {
    await browser.close();
  }
}