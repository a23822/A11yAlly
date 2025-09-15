import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  getVisualInfo,
  getAccessibilityViolations,
} from "$lib/server/playwrightService";
import { analyzeScreenshot, analyzeAxeReport } from "$lib/server/geminiService";
import { db } from "$lib/server/firebaseAdmin";
import type { AnalyzeRequestBody } from "$lib/types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!db) {
    console.error("Firebase DB is not initialized.");
    return json({ error: "서버 설정 오류." }, { status: 500 });
  }

  // hooks.server.ts에서 인증 처리 후 event.locals에 담아준 사용자 정보
  const uid = locals.user?.uid;
  if (!uid) {
    return json(
      { error: "인증된 사용자 정보를 찾을 수 없습니다." },
      { status: 403 }
    );
  }

  const { url, visionDeficiency } =
    (await request.json()) as AnalyzeRequestBody;

  if (!url) {
    return json({ error: "분석할 URL을 입력해주세요." }, { status: 400 });
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
        visionDeficiency
      ),
      analyzeAxeReport(accessibilityViolations),
    ]);

    const reportData = {
      userId: uid,
      url: url,
      title: pageTitle,
      timestamp: new Date(),
      issues_json: {
        simulatedDeficiency: visionDeficiency || "none",
        aiAnalysis: aiAnalysis,
        axeAiAnalysis: axeAiAnalysis,
        accessibilityViolations: accessibilityViolations,
      },
    };

    const reportRef = await db.collection("reports").add(reportData);
    console.log(`리포트가 성공적으로 저장되었습니다. ID: ${reportRef.id}`);

    const responseData = {
      message: "분석 성공!",
      reportId: reportRef.id,
      analyzedUrl: url,
      title: pageTitle,
      simulatedDeficiency: visionDeficiency || "none",
      aiAnalysis: aiAnalysis,
      axeAiAnalysis: axeAiAnalysis,
      accessibilityViolations: accessibilityViolations,
    };

    return json(responseData, { status: 200 });
  } catch (error) {
    console.error("분석 중 오류 발생:", error);
    return json(
      { error: "페이지를 분석하는 중에 오류가 발생했습니다." },
      { status: 500 }
    );
  }
};
