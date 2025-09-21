import type { Handle } from "@sveltejs/kit";
import { auth } from "$lib/server/firebaseAdmin";

export const handle: Handle = async ({ event, resolve }) => {
  // 1. 브라우저가 보낸 'session' 쿠키를 가져옵니다.
  const sessionCookie = event.cookies.get("session");

  if (!sessionCookie) {
    // 쿠키가 없으면 비로그인 상태로 다음 단계 진행
    event.locals.user = null;
  } else {
    try {
      if (auth) {
        // 2. 쿠키가 유효한지 Firebase Admin SDK로 확인합니다.
        const decodedToken = await auth.verifySessionCookie(
          sessionCookie,
          true
        );
        // 3. 유효하다면, event.locals에 사용자 정보를 담습니다.
        event.locals.user = decodedToken;
      }
    } catch (error) {
      // 쿠키가 유효하지 않으면 비로그인 상태로 처리
      event.locals.user = null;
    }
  }

  // 4. 다음 단계(페이지의 load 함수 등)를 실행하여 응답을 생성합니다.
  const response = await resolve(event);

  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups"
  );

  // 5. 헤더가 추가된 최종 응답을 반환합니다.
  return response;
};
