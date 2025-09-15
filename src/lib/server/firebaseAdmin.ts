import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

import {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} from "$env/static/private";

if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("🚨 Error initializing Firebase Admin SDK:", error);
  }
}

// 초기화된 admin 인스턴스에서 db와 auth를 내보냅니다.
export const db = admin.firestore();
export const auth = admin.auth();
