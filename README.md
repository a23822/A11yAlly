# A11yQuest - 웹 접근성 퀘스트

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F0Z3Z5L)

A11yQuest는 웹 접근성을 게임처럼 재미있게 분석하고 개선할 수 있도록 돕는 서비스입니다. 사용자가 웹사이트 URL을 입력하면, AI가 시각적 요소와 코드 구조를 다각도로 분석하여 접근성 문제점을 찾아내고 개선 가이드를 퀘스트 형식으로 제공합니다.

## ✨ 핵심 기능

- **AI 기반 다각도 분석**:
  - **스크린 기반 시각 분석**: Gemini AI가 웹사이트 스크린샷을 보고 색상 대비, 가독성 등 시각적 문제점을 분석합니다.
  - **접근성 트리 기반 구조 분석**: Playwright와 Axe-core를 사용하여 스크린 리더 사용자를 위한 코드 구조의 문제점을 진단합니다.
- **색맹 시뮬레이션**: 적색맹, 녹색맹 등 다양한 색맹 유형의 시점에서 웹사이트가 어떻게 보이는지 실시간으로 확인할 수 있습니다.
- **게이미피케이션**: 분석된 접근성 문제들을 '퀘스트'로 여기고 해결해나가는 재미 요소를 도입하여 동기를 부여합니다. (구현 예정)

## 🛠️ 기술 스택

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: HTML, SCSS, TypeScript
- **Web Automation**: Playwright
- **AI**: Google Gemini API
- **Code Quality**: ESLint, Prettier, Stylelint

## 🚀 시작하기

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone [https://github.com/](https://github.com/)[Your-Username]/A11yQuest.git
cd A11yQuest
pnpm install
```
