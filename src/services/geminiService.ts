import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODELS } from '../constants';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const { FLASH } = GEMINI_MODELS;


// 스크린샷 이미지를 분석하고 텍스트 설명을 반환하는 함수
export async function analyzeScreenshot(base64Image: string, visionDeficiency?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: FLASH });

    const prompt = `당신은 ${visionDeficiency || '일반'} 시야를 가진 웹 접근성 전문가입니다. 이 웹페이지 스크린샷을 보고, 색상 대비가 부족하거나, 배경과 텍스트/버튼이 잘 구분되지 않는 등 색상과 관련된 접근성 문제점 3가지를 찾아서 설명해주세요.`;

    const imageParts = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Image.replace('data:image/png;base64,', ''),
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const analysisText = response.text();
    
    return analysisText;

  } catch (error) {
    console.error('Gemini 분석 중 오류:', error);
    return 'AI 분석 중 오류가 발생했습니다.';
  }
}
