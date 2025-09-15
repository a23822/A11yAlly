import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import type { Result } from "axe-core";
import type { AnalyzeRequestBody } from "$lib/types";

/**
 * Axe-core를 사용하여 페이지의 접근성 위반 사항을 분석합니다.
 * (접근성 트리 기반 분석)
 */
export async function getAccessibilityViolations(
  url: string
): Promise<Result[]> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  try {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    return accessibilityScanResults.violations;
  } finally {
    await browser.close();
  }
}

/**
 * 페이지를 스크린샷하고 제목과 같은 시각적 정보를 가져옵니다.
 * (스크린 기반 분석)
 */
export async function getVisualInfo(
  url: string,
  visionDeficiency?: AnalyzeRequestBody["visionDeficiency"]
) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    colorScheme: "light",
    // visionDeficiency 값이 있을 경우에만 해당 옵션을 적용합니다.
    ...(visionDeficiency && { visionDeficiency }),
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  try {
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      timeout: 60000,
    });
    const screenshotBase64 = screenshotBuffer.toString("base64");
    const pageTitle = await page.title();

    return { screenshotBase64, pageTitle };
  } finally {
    await browser.close();
  }
}
