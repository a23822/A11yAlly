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
  timestamp: any;
  issues_json: {
    simulatedDeficiency: string;
    aiAnalysis: string;
    axeAiAnalysis: string;
    accessibilityViolations: Result[];
    isTruncated?: boolean;
  };
}
