# A11yAlly - 당신의 웹 접근성 동맹

A11yAlly는 웹 접근성을 게임처럼 재미있게 분석하고 개선할 수 있도록 돕는 서비스입니다. 사용자가 웹사이트 URL을 입력하면, AI가 시각적 요소와 코드 구조를 다각도로 분석하여 접근성 문제점을 찾아내고 개선 가이드를 제공합니다.

## ✨ 핵심 기능

- **AI 기반 다각도 분석**:
  - **스크린 기반 시각 분석**: Gemini AI가 웹사이트 스크린샷을 보고 색상 대비, 가독성 등 시각적 문제점을 분석합니다.
  - **접근성 트리 기반 구조 분석**: Playwright와 Axe-core를 사용하여 스크린 리더 사용자를 위한 코드 구조의 문제점을 진단합니다.
- **색맹 시뮬레이션**: 적색맹, 녹색맹 등 다양한 색맹 유형의 시점에서 웹사이트가 어떻게 보이는지 실시간으로 확인할 수 있습니다.
- **구독 기반 기능 제한**: RevenueCat과 연동하여 무료 사용자와 유료(Pro) 사용자를 구분하고, 제공되는 정보의 깊이를 다르게 합니다.

## 🛠️ 기술 스택

- **프레임워크**: SvelteKit (Svelte 5)
- **언어**: TypeScript
- **패키지 매니저**: pnpm
- **BaaS (백엔드)**: Firebase (Authentication, Firestore)
- **구독 관리**: RevenueCat
- **웹 자동화/AI**: Playwright, Google Gemini API
- **코드 품질**: ESLint, Prettier, Stylelint
- **배포**: Render (Docker)

## 🚀 시작하기

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone [https://github.com/a23822/A11yAlly.git](https://github.com/a23822/A11yAlly.git)
cd A11yAlly
pnpm install
```
