import { readable } from "svelte/store";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { browser } from "$app/environment";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID,
} from "$env/static/public";

const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID,
};

// readable 스토어는 외부에서 값을 직접 변경할 수 없어 더 안전합니다.
export const user = readable<User | null | undefined>(undefined, (set) => {
  if (browser) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set(user); // 로그인 상태가 변경되면 스토어의 값을 업데이트합니다.
    });

    // 스토어 구독이 끝나면 리스너를 정리합니다.
    return () => unsubscribe();
  } else {
    set(null); // 서버 환경에서는 user를 null로 설정
  }
});
