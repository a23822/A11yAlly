import { Request, Response } from 'express';
import { getVisualInfo, AnalyzeRequestBody } from '../services/puppeteerService';
import { getAccessibilityViolations } from '../services/playwrightService';
import { analyzeScreenshot, analyzeAxeReport } from '../services/geminiService';

export const analyzeUrl = async (req: Request, res: Response) => {
  const { url, visionDeficiency } = req.body as AnalyzeRequestBody;

  if (!url) {
    return res.status(400).send({ error: '분석할 URL을 입력해주세요.' });
  }

  try {
    // 각 서비스 함수를 호출합니다.
    const [visualInfo, accessibilityViolations] = await Promise.all([
      getVisualInfo(url, visionDeficiency),
      getAccessibilityViolations(url),
    ]);

    const { screenshotBase64, pageTitle } = visualInfo;

    const [aiAnalysis, axeAiAnalysis] = await Promise.all([
      analyzeScreenshot(`data:image/png;base64,${screenshotBase64}`, visionDeficiency),
      analyzeAxeReport(accessibilityViolations),
    ]);

    res.status(200).send({
      message: '분석 성공!',
      analyzedUrl: url,
      title: pageTitle,
      simulatedDeficiency: visionDeficiency || 'none',
      aiAnalysis: aiAnalysis,
      axeAiAnalysis: axeAiAnalysis,
      accessibilityViolations: accessibilityViolations,
    });
  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    res.status(500).send({ error: '페이지를 분석하는 중에 오류가 발생했습니다.' });
  }
};