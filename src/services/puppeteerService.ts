import puppeteer from 'puppeteer';

export interface AnalyzeRequestBody {
  url: string;
  visionDeficiency?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
}

export async function getVisualInfo(
  url: string,
  visionDeficiency?: AnalyzeRequestBody['visionDeficiency'],
) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    if (visionDeficiency) {
      await page.emulateVisionDeficiency(visionDeficiency);
    }

    const screenshotBase64 = await page.screenshot({ encoding: 'base64', fullPage: true });
    const pageTitle = await page.title();

    return { screenshotBase64, pageTitle };
  } finally {
    await browser.close();
  }
}