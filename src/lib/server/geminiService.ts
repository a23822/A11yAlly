import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import type { Result } from "axe-core";
import { GEMINI_MODELS } from "$lib/constants";
import { GEMINI_API_KEY } from "$env/static/private";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const { FLASH } = GEMINI_MODELS;

// --- 재시도 유틸리티 함수 ---
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

async function retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof GoogleGenerativeAIFetchError &&
        error.status === 503
      ) {
        attempt++;
        if (attempt >= MAX_RETRIES) {
          throw error; // 재시도 횟수 초과 시 최종 에러 throw
        }
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.log(
          `Gemini API 503 에러. ${delay}ms 후 재시도합니다... (시도 ${attempt}/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error; // 503이 아닌 다른 에러는 즉시 throw
      }
    }
  }
  throw new Error("재시도 로직에 문제가 있습니다.");
}

// 스크린샷 이미지를 분석하고 텍스트 설명을 반환하는 함수
export async function analyzeScreenshot(
  base64Image: string,
  visionDeficiency?: string
) {
  return retryWithBackoff(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: FLASH });
      const prompt = `당신은 ${
        visionDeficiency || "일반"
      } 시야를 가진 웹 접근성 전문가입니다. 이 웹페이지 스크린샷을 보고, 색상 대비가 부족하거나, 배경과 텍스트/버튼이 잘 구분되지 않는 등 색상과 관련된 접근성 문제점 3가지를 찾아서 설명해주세요.`;
      const imageParts = [
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image.replace("data:image/png;base64,", ""),
          },
        },
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      return result.response.text();
    } catch (error) {
      console.error("Gemini 스크린샷 분석 중 오류:", error);
      throw error;
    }
  });
}

export async function analyzeAxeReport(violations: Result[]) {
  return retryWithBackoff(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: FLASH });
      const violationsJson = JSON.stringify(violations, null, 2);
      const prompt = `당신은 웹 접근성 컨설턴트입니다. 다음은 axe-core 도구에서 나온 접근성 위반 사항에 대한 JSON 데이터입니다.
      1. 이 문제들의 심각성을 평가하고, 가장 시급하게 해결해야 할 문제 3가지를 선정해주세요.
      2. 각 문제의 원인과 사용자에게 미치는 영향을 쉽게 설명해주세요.
      3. 문제를 해결할 수 있는 코드 예시나 구체적인 가이드를 제시해주세요.

      [JSON 데이터]
      ${violationsJson}`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini Axe 분석 중 오류:", error);
      throw error;
    }
  });
}
