export interface AnalyzeRequestBody {
  url: string;
  visionDeficiency?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
}