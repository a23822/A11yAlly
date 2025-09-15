import { error } from "@sveltejs/kit";
import { db } from "$lib/server/firebaseAdmin";
import type { PageServerLoad } from "./$types";
import type { Report } from "$lib/types";

// PageServerLoad: SvelteKit에서 페이지 로딩 시 서버에서 실행되는 함수의 타입
export const load: PageServerLoad = async ({ url, locals }) => {
  // locals.user는 hooks.server.ts에서 넣어준 사용자 정보입니다.
  const uid = locals.user?.uid;
  if (!uid) {
    // 로그인되지 않은 사용자는 접근할 수 없음
    throw error(401, "인증되지 않은 사용자입니다.");
  }

  // URL 쿼리 파라미터에서 리포트 ID를 가져옵니다. (예: /report?id=abcde)
  const reportId = url.searchParams.get("id");
  if (!reportId) {
    throw error(400, "리포트 ID가 필요합니다.");
  }

  try {
    // Firestore에서 사용자 정보와 리포트 정보를 동시에 가져옵니다.
    const userRef = db.collection("users").doc(uid);
    const reportRef = db.collection("reports").doc(reportId);

    const [userDoc, reportDoc] = await Promise.all([
      userRef.get(),
      reportRef.get(),
    ]);

    if (!reportDoc.exists) {
      throw error(404, "리포트를 찾을 수 없습니다.");
    }

    const reportData = reportDoc.data() as Report;
    const userData = userDoc.data();

    // 자신의 리포트가 맞는지 확인
    if (reportData.userId !== uid) {
      throw error(403, "이 리포트에 접근할 권한이 없습니다.");
    }

    // Pro 사용자가 아닐 경우 데이터 일부를 잘라냅니다.
    const isProUser = userData?.is_pro === true;
    if (
      !isProUser &&
      reportData.issues_json.accessibilityViolations.length > 3
    ) {
      reportData.issues_json.accessibilityViolations =
        reportData.issues_json.accessibilityViolations.slice(0, 3);
      reportData.issues_json.isTruncated = true; // 데이터가 잘렸다는 표시 추가
    }

    // 여기서 return된 데이터는 +page.svelte에서 'data' prop으로 받을 수 있습니다.
    // Firestore의 Timestamp 객체는 JSON으로 변환할 수 없으므로 toDate()로 변환합니다.
    return {
      report: {
        ...reportData,
        timestamp: reportData.timestamp.toDate().toISOString(),
      },
    };
  } catch (e) {
    console.error("리포트 조회 오류:", e);
    // SvelteKit의 error 헬퍼를 사용해 적절한 HTTP 에러 페이지를 보여줍니다.
    if (e instanceof Error && (e as any).status) {
      throw e;
    }
    throw error(500, "리포트를 불러오는 중 서버 오류가 발생했습니다.");
  }
};
