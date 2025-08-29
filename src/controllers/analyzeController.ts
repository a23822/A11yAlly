import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { analyzeScreenshot } from '../services/geminiService';

interface AnalyzeRequestBody {
  url: string
  visionDeficiency?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
}

// --- Puppeteer 작업 함수 ---
async function getVisualInfo(url: string, visionDeficiency?: AnalyzeRequestBody['visionDeficiency']) {
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

// --- Playwright 작업 함수 ---
async function getAccessibilityViolations(url: string) {
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

export const analyzeUrl = async (req: Request, res: Response) => {
  const { url, visionDeficiency } = req.body as AnalyzeRequestBody;

  if (!url) {
    return res.status(400).send({ error: '분석할 URL을 입력해주세요.' });
  }

  try {
    const [visualInfo, accessibilityViolations] = await Promise.all([
      getVisualInfo(url, visionDeficiency),
      getAccessibilityViolations(url),
    ]);
    
    const { screenshotBase64, pageTitle } = visualInfo;
    
    const aiAnalysis = await analyzeScreenshot(`data:image/png;base64,${screenshotBase64}`, visionDeficiency);

    res.status(200).send({
      message: '분석 성공!',
      analyzedUrl: url,
      title: pageTitle,
      simulatedDeficiency: visionDeficiency || 'none',
      aiAnalysis: aiAnalysis, // Gemini AI 분석 (Puppeteer 스크린샷 기반)
      accessibilityViolations: accessibilityViolations, // Axe 접근성 분석 (Playwright 기반)
    });

  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    res.status(500).send({ error: '페이지를 분석하는 중에 오류가 발생했습니다.' });
  }
};