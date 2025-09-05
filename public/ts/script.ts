const form = document.getElementById('analyze-form') as HTMLFormElement;
const urlInput = document.getElementById('url-input') as HTMLInputElement;
const visionDeficiencySelect = document.getElementById(
  'vision-deficiency-select',
) as HTMLSelectElement;
const loadingIndicator = document.getElementById(
  'loading-indicator',
) as HTMLElement;
const resultSection = document.getElementById('result-section') as HTMLElement;

// 서버로부터 받는 데이터의 타입을 정의합니다.
interface AnalysisResult {
  title: string;
  analyzedUrl: string;
  simulatedDeficiency: string;
  aiAnalysis: string;
  axeAiAnalysis: string;
  accessibilityViolations: {
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    help: string;
    description: string;
    helpUrl: string;
  }[];
}

form.addEventListener('submit', async (e: Event) => {
  e.preventDefault();

  const url = urlInput.value;
  const visionDeficiency = visionDeficiencySelect.value;

  resultSection.classList.add('hidden');
  resultSection.innerHTML = '';
  loadingIndicator.classList.remove('hidden');

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        visionDeficiency: visionDeficiency || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '분석 중 오류가 발생했습니다.');
    }

    const data: AnalysisResult = await response.json();
    displayResults(data);
  } catch (error) {
    // error 객체의 타입을 명시하여 안전하게 message 속성에 접근합니다.
    resultSection.innerHTML = `<p style="color: red;"><strong>오류:</strong> ${(error as Error).message}</p>`;
  } finally {
    loadingIndicator.classList.remove('hidden');
    resultSection.classList.remove('hidden');
  }
});

function displayResults(data: AnalysisResult) {
  const {
    title,
    analyzedUrl,
    simulatedDeficiency,
    aiAnalysis,
    axeAiAnalysis,
    accessibilityViolations,
  } = data;

  const aiAnalysisHtml = `
        <article>
            <h2>AI 시각적 분석 (${simulatedDeficiency})</h2>
            <p><strong>${title}</strong> (${analyzedUrl}) 사이트를 AI가 분석한 결과입니다.</p>
            <div>${aiAnalysis.replace(/\n/g, '<br>')}</div>
        </article>
    `;

  const axeAiAnalysisHtml = `
        <article>
            <h2>Axe-core 기반 AI 분석</h2>
            <div>${axeAiAnalysis.replace(/\n/g, '<br>')}</div>
        </article>
    `;

  let violationsHtml = '<article><h2>상세 위반 사항</h2>';
  if (accessibilityViolations && accessibilityViolations.length > 0) {
    accessibilityViolations.forEach((v) => {
      violationsHtml += `
                <div class="violation-card">
                    <h3>[${v.impact}] ${v.help}</h3>
                    <p>${v.description}</p>
                    <p><strong>도움말 URL:</strong> <a href="${v.helpUrl}" target="_blank">${v.helpUrl}</a></p>
                </div>
            `;
    });
  } else {
    violationsHtml += '<p>발견된 접근성 위반 사항이 없습니다! 🎉</p>';
  }
  violationsHtml += '</article>';

  resultSection.innerHTML = aiAnalysisHtml + axeAiAnalysisHtml + violationsHtml;
}
