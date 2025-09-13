import { Request, Response } from 'express';
import {
  getVisualInfo,
  getAccessibilityViolations,
} from '../services/playwrightService';
import { analyzeScreenshot, analyzeAxeReport } from '../services/geminiService';
import { AnalyzeRequestBody } from '../types';
import { firestore } from '../lib/firebaseAdmin';

export const analyzeUrl = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res
      .status(403)
      .send({ error: '인증된 사용자 정보를 찾을 수 없습니다.' });
  }

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

    const [aiAnalysis, axeAiAnalysis] = await Promise.all([
      analyzeScreenshot(
        `data:image/png;base64,${screenshotBase64}`,
        visionDeficiency,
      ),
      analyzeAxeReport(accessibilityViolations),
    ]);

    // ▼▼▼ Firestore에 저장할 리포트 데이터 생성 ▼▼▼
    const reportData = {
      userId: uid,
      url: url,
      title: pageTitle,
      timestamp: new Date(),
      issues_json: {
        simulatedDeficiency: visionDeficiency || 'none',
        aiAnalysis: aiAnalysis,
        axeAiAnalysis: axeAiAnalysis,
        accessibilityViolations: accessibilityViolations,
      },
    };

    const reportRef = await firestore.collection('reports').add(reportData);
    console.log(`리포트가 성공적으로 저장되었습니다. ID: ${reportRef.id}`);

    const responseData = {
      message: '분석 성공!',
      reportId: reportRef.id,
      analyzedUrl: url,
      title: pageTitle,
      simulatedDeficiency: visionDeficiency || 'none',
      aiAnalysis: aiAnalysis,
      axeAiAnalysis: axeAiAnalysis,
      accessibilityViolations: accessibilityViolations,
    };

    res.status(200).send(responseData);
  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    res
      .status(500)
      .send({ error: '페이지를 분석하는 중에 오류가 발생했습니다.' });
  }
};
