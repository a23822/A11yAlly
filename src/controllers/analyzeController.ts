import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { analyzeScreenshot } from '../services/geminiService';

interface AnalyzeRequestBody {
  url: string
  visionDeficiency?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'
}

export const analyzeUrl = async (req: Request, res: Response) => {
  const { url, visionDeficiency } = req.body as AnalyzeRequestBody

  if (!url) {
    return res.status(400).send({ error: '분석할 URL을 입력해주세요.' })
  }

  const validDeficiencies = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  if (visionDeficiency && !validDeficiencies.includes(visionDeficiency)) {
    return res.status(400).send({ error: '유효하지 않은 visionDeficiency 값입니다.' })
  }

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    if (visionDeficiency) {
      await page.emulateVisionDeficiency(visionDeficiency);
    }

     const screenshotBase64 = await page.screenshot({ encoding: 'base64', fullPage: true });
     const pageTitle = await page.title();

    await browser.close();

    const aiAnalysis = await analyzeScreenshot(`data:image/png;base64,${screenshotBase64}`, visionDeficiency);

    res.status(200).send({
        message: '분석 성공!',
        analyzedUrl: url,
        title: pageTitle,
        simulatedDeficiency: visionDeficiency || 'none',
        aiAnalysis: aiAnalysis, // AI 분석 결과
        // screenshot: `data:image/png;base64,${screenshotBase64}` 
      });

  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    res.status(500).send({ error: '페이지를 분석하는 중에 오류가 발생했습니다.' })
  }
}