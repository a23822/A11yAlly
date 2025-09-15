import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/firebaseAdmin";

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!db) {
    return json({ error: "서버 설정 오류." }, { status: 500 });
  }

  const { reportId } = params; // URL에서 reportId를 가져옵니다.
  const uid = locals.user?.uid; // 인증된 사용자 ID

  if (!reportId) {
    return json({ error: "리포트 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const userRef = db.collection("users").doc(uid!);
    const reportRef = db.collection("reports").doc(reportId);

    const [userDoc, reportDoc] = await Promise.all([
      userRef.get(),
      reportRef.get(),
    ]);

    if (!reportDoc.exists) {
      return json({ error: "리포트를 찾을 수 없습니다." }, { status: 404 });
    }

    const reportData = reportDoc.data()!;
    const userData = userDoc.data();

    if (reportData.userId !== uid) {
      return json(
        { error: "이 리포트에 접근할 권한이 없습니다." },
        { status: 403 }
      );
    }

    const isProUser = userData?.is_pro === true;

    if (!isProUser) {
      if (reportData.issues_json.accessibilityViolations.length > 3) {
        reportData.issues_json.accessibilityViolations =
          reportData.issues_json.accessibilityViolations.slice(0, 3);
        reportData.issues_json.isTruncated = true;
      }
    }

    return json(reportData, { status: 200 });
  } catch (error) {
    console.error("리포트 조회 오류:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
};
