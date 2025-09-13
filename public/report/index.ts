// public/report/index.ts

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import type { User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDi9E09ykehPle0BM6MBvQTiTcStnwXjJU',
  authDomain: 'a11yquest.firebaseapp.com',
  projectId: 'a11yquest',
  storageBucket: 'a11yquest.firebasestorage.app',
  messagingSenderId: '890495901051',
  appId: '1:890495901051:web:5ebfdb9bf334960e40b1de',
  measurementId: 'G-QZV23WQTE4',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ... (이하 나머지 코드는 이전과 동일하게 유지됩니다)
const loadingIndicator = document.getElementById(
  'loading-indicator',
) as HTMLElement;
const reportContent = document.getElementById('report-content') as HTMLElement;

const getReportIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

const displayReport = (data: any) => {
  const { title, url, issues_json } = data;
  const {
    simulatedDeficiency,
    aiAnalysis,
    axeAiAnalysis,
    accessibilityViolations,
    isTruncated,
  } = issues_json;

  let html = `
    <article>
      <h2>분석 대상: ${title}</h2>
      <p><strong>URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
    </article>
    <article>
      <h2>AI 시각적 분석 (${simulatedDeficiency})</h2>
      <div>${aiAnalysis.replace(/\n/g, '<br>')}</div>
    </article>
    <article>
      <h2>Axe-core 기반 AI 분석</h2>
      <div>${axeAiAnalysis.replace(/\n/g, '<br>')}</div>
    </article>
    <article>
      <h2>상세 위반 사항</h2>
  `;

  if (accessibilityViolations && accessibilityViolations.length > 0) {
    accessibilityViolations.forEach((v: any) => {
      html += `
        <div class="violation-card">
          <h3>[${v.impact}] ${v.help}</h3>
          <p>${v.description}</p>
          <p><strong>도움말 URL:</strong> <a href="${v.helpUrl}" target="_blank">${v.helpUrl}</a></p>
        </div>
      `;
    });
  } else {
    html += '<p>발견된 접근성 위반 사항이 없습니다! 🎉</p>';
  }

  if (isTruncated) {
    html += `
      <div class="upgrade-cta">
        <h3>전체 리포트를 보려면 업그레이드하세요!</h3>
        <p>상위 3개의 이슈만 표시되었습니다. Pro Plan으로 업그레이드하고 모든 접근성 문제점을 확인하세요.</p>
        <button id="upgrade-btn">Pro Plan으로 업그레이드</button>
      </div>
    `;
  }

  html += '</article>';
  reportContent.innerHTML = html;
};

onAuthStateChanged(auth, async (user: User | null) => {
  if (user) {
    const reportId = getReportIdFromUrl();
    if (!reportId) {
      reportContent.innerHTML =
        '<p style="color: red;"><strong>오류:</strong> 리포트 ID를 찾을 수 없습니다.</p>';
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/report/${reportId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || '리포트를 불러오는 데 실패했습니다.',
        );
      }

      const reportData = await response.json();
      displayReport(reportData);
    } catch (error) {
      reportContent.innerHTML = `<p style="color: red;"><strong>오류:</strong> ${(error as Error).message}</p>`;
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  } else {
    window.location.href = '/';
  }
});
