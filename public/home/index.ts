import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import type { User, UserCredential } from 'firebase/auth';

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
const provider = new GoogleAuthProvider();

// ... (이하 나머지 코드는 이전과 동일하게 유지됩니다)
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

loginBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result: UserCredential) => {
      console.log('로그인 성공:', result.user);
    })
    .catch((error) => {
      console.error('로그인 오류:', error);
    });
});

logoutBtn.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log('로그아웃 성공');
    })
    .catch((error) => {
      console.error('로그아웃 오류:', error);
    });
});

onAuthStateChanged(auth, async (user: User | null) => {
  if (user) {
    loginBtn.classList.add('hidden');
    userInfo.classList.remove('hidden');
    userEmail.textContent = user.email;

    try {
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
    const idToken = await currentUser.getIdToken();

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
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
    window.location.href = `/report?id=${data.reportId}`;
  } catch (error) {
    resultSection.innerHTML = `<p style="color: red;"><strong>오류:</strong> ${(error as Error).message}</p>`;
  } finally {
    loadingIndicator.classList.remove('hidden');
    resultSection.classList.remove('hidden');
  }
});
