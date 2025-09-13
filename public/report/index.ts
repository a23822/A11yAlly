declare let firebase: any;

const firebaseConfig = {
  // script.ts와 동일하게 Firebase 설정값을 붙여넣어 주세요.
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  // ...
  appId: 'YOUR_APP_ID',
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loadingIndicator = document.getElementById(
  'loading-indicator',
) as HTMLElement;
const reportContent = document.getElementById('report-content') as HTMLElement;

// URL에서 리포트 ID를 가져오는 함수
const getReportIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

// 리포트 데이터를 화면에 표시하는 함수
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

  // ★★★ 무료 사용자에게 업그레이드 버튼 표시 ★★★
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

// 페이지가 로드될 때 실행되는 메인 로직
auth.onAuthStateChanged(async (user) => {
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
    // 로그인되지 않은 사용자
    window.location.href = '/'; // 홈으로 리디렉션
  }
});
