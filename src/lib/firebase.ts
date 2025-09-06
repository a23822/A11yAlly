import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
// import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (process.env.NODE_ENV !== 'production') {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error(
      '🚨 오류: Firebase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.',
    );
  }
}

// 앱 초기화
let app: FirebaseApp;

// 이미 초기화된 앱이 있는지 확인 (HMR/SSR 대응)
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  // 이미 초기화된 경우 기존 앱 인스턴스 사용
  app = getApps()[0];
}

// Auth 인스턴스 생성 및 내보내기
export const auth: Auth = getAuth(app);
// export const db = getFirestore(app); // Firestore 사용 시 주석 해제
export default app;
