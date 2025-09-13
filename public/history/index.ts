import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
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
const db = getFirestore(app);

const loadingIndicator = document.getElementById(
  'loading-indicator',
) as HTMLElement;
const historyContent = document.getElementById(
  'history-content',
) as HTMLElement;

const showPaywall = () => {
  historyContent.innerHTML = `
    <div class="upgrade-cta">
      <h3>분석 히스토리 기능은 Pro Plan 사용자 전용입니다.</h3>
      <p>Pro Plan으로 업그레이드하고 모든 분석 기록을 확인하고 관리하세요.</p>
      <button id="upgrade-btn">Pro Plan으로 업그레이드</button>
    </div>
  `;
};

const displayHistory = (reports: any[]) => {
  if (reports.length === 0) {
    historyContent.innerHTML =
      '<p>아직 분석한 기록이 없습니다. 홈페이지에서 분석을 시작해보세요!</p>';
    return;
  }

  let html = '';
  reports.forEach((report) => {
    html += `
      <div class="report-list-item">
        <div class="report-info">
          <a href="/report?id=${report.id}">${report.title}</a>
          <div class="report-meta">
            <span>${new Date(report.timestamp.seconds * 1000).toLocaleString()}</span> | 
            <span>${report.url}</span>
          </div>
        </div>
      </div>
    `;
  });
  historyContent.innerHTML = html;
};

onAuthStateChanged(auth, async (user: User | null) => {
  if (user) {
    try {
      // 1. Firestore에서 사용자 정보 가져오기
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().is_pro === true) {
        // 2a. Pro 사용자일 경우, 리포트 목록 API 호출
        const idToken = await user.getIdToken();
        const response = await fetch('/api/reports', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!response.ok) throw new Error('히스토리 로딩 실패');

        const reports = await response.json();
        displayHistory(reports);
      } else {
        // 2b. 무료 사용자일 경우, Paywall 표시
        showPaywall();
      }
    } catch (error) {
      console.error('히스토리 로딩 중 오류:', error);
      historyContent.innerHTML = `<p style="color: red;">오류가 발생했습니다: ${(error as Error).message}</p>`;
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  } else {
    // 로그인되지 않은 사용자
    window.location.href = '/'; // 홈으로 리디렉션
  }
});
