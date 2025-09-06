import admin from 'firebase-admin';

// 서비스 계정 키 파일(.json)을 직접 가져오는 대신,
// 초기화 시 환경 변수를 사용하도록 설정합니다.
if (!admin.apps.length) {
  admin.initializeApp({
    // credential 옵션 없이 초기화하면,
    // Google Cloud 환경에서 자동으로 인증 정보를 찾습니다.
    // 로컬 개발 시에는 별도의 설정이 필요합니다.
  });
}

export const firestore = admin.firestore();
