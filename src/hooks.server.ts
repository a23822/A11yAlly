// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { auth } from "$lib/server/firebaseAdmin";

export const handle: Handle = async ({ event, resolve }) => {
  // 1. 브라우저가 보낸 'session' 쿠키를 가져옵니다.
  const sessionCookie = event.cookies.get("session");

  if (!sessionCookie) {
    // 쿠키가 없으면 비로그인 상태로 다음 단계 진행
    event.locals.user = null;
    return resolve(event);
  }

  try {
    if (auth) {
      // 2. 쿠키가 유효한지 Firebase Admin SDK로 확인합니다.
      const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
      // 3. 유효하다면, event.locals에 사용자 정보를 담습니다.
      event.locals.user = decodedToken;
    }
  } catch (error) {
    // 쿠키가 유효하지 않으면 비로그인 상태로 처리
    event.locals.user = null;
    console.log("쿠키 검증 오류:", error);
  }

  // 4. 다음 단계(페이지의 load 함수 등)를 실행합니다.
  return resolve(event);
};
