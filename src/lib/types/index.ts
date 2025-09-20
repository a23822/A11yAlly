import type { Result } from "axe-core";

export interface AnalyzeRequestBody {
  url: string;
  visionDeficiency?:
    | "protanopia"
    | "deuteranopia"
    | "tritanopia"
    | "achromatopsia";
}
export interface Report {
  id?: string;
  userId: string;
  url: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timestamp: any; // 서버와 클라이언트 간 타입이 달라 any 사용이 불가피함
  issues_json: {
    simulatedDeficiency: string;
    aiAnalysis: string;
    axeAiAnalysis: string;
    accessibilityViolations: Result[];
    isTruncated?: boolean;
  };
}
