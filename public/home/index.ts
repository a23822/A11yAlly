declare let firebase: any;

const firebaseConfig = {
  apiKey: 'AIzaSyDi9E09ykehPle0BM6MBvQTiTcStnwXjJU',
  authDomain: 'a11yquest.firebaseapp.com',
  projectId: 'a11yquest',
  storageBucket: 'a11yquest.firebasestorage.app',
  messagingSenderId: '890495901051',
  appId: '1:890495901051:web:5ebfdb9bf334960e40b1de',
  measurementId: 'G-QZV23WQTE4',
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const form = document.getElementById('analyze-form') as HTMLFormElement;
const urlInput = document.getElementById('url-input') as HTMLInputElement;
const visionDeficiencySelect = document.getElementById(
  'vision-deficiency-select',
) as HTMLSelectElement;
const loadingIndicator = document.getElementById(
  'loading-indicator',
) as HTMLElement;
const resultSection = document.getElementById('result-section') as HTMLElement;

const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const userInfo = document.getElementById('user-info') as HTMLElement;
const userEmail = document.getElementById('user-email') as HTMLSpanElement;

// 로그인 버튼 클릭 이벤트
loginBtn.addEventListener('click', () => {
  auth
    .signInWithPopup(provider)
    .then((result: any) => {
      console.log('로그인 성공:', result.user);
    })
    .catch((error: any) => {
      console.error('로그인 오류:', error);
    });
});

// 로그아웃 버튼 클릭 이벤트
logoutBtn.addEventListener('click', () => {
  auth
    .signOut()
    .then(() => {
      console.log('로그아웃 성공');
    })
    .catch((error: any) => {
      console.error('로그아웃 오류:', error);
    });
});

// 사용자의 로그인 상태 변화를 감지합니다.
auth.onAuthStateChanged(async (user: any) => {
  if (user) {
    loginBtn.classList.add('hidden');
    userInfo.classList.remove('hidden');
    userEmail.textContent = user.email;

    try {
      // 백엔드로 사용자 정보를 보내 DB에 저장/업데이트 요청
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
        }),
      });
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
    }
  } else {
    loginBtn.classList.remove('hidden');
    userInfo.classList.add('hidden');
    userEmail.textContent = '';
  }
});

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

  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert('분석을 실행하려면 먼저 로그인해주세요.');
    return;
  }

  const url = urlInput.value;
  const visionDeficiency = visionDeficiencySelect.value;

  resultSection.classList.add('hidden');
  resultSection.innerHTML = '';
  loadingIndicator.classList.remove('hidden');

  try {
    // ▼▼▼ 2. 사용자의 ID 토큰 가져오기 ▼▼▼
    const idToken = await currentUser.getIdToken();

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`, // 신분증(ID 토큰) 추가
      },
      body: JSON.stringify({
        url,
        visionDeficiency: visionDeficiency || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '분석 중 오류가 발생했습니다.');
    }

    const data: AnalysisResult & { reportId: string } = await response.json();
    window.location.href = `/report.html?id=${data.reportId}`;
  } catch (error) {
    resultSection.innerHTML = `<p style="color: red;"><strong>오류:</strong> ${(error as Error).message}</p>`;
  } finally {
    loadingIndicator.classList.remove('hidden');
    resultSection.classList.remove('hidden');
  }
});
