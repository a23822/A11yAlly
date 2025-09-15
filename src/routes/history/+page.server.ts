import { error } from "@sveltejs/kit";
import { db } from "$lib/server/firebaseAdmin";
import type { PageServerLoad } from "./$types";
import type { Report } from "$lib/types";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const load: PageServerLoad = async ({ locals }) => {
  const uid = locals.user?.uid;
  if (!uid) {
    throw error(401, "인증이 필요합니다.");
  }

  try {
    // 1. Firestore에서 현재 사용자의 정보를 가져옵니다.
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      // 이론적으로는 발생하면 안 되지만, 방어 코드를 추가합니다.
      throw error(404, "사용자 정보를 찾을 수 없습니다.");
    }

    const isProUser = userDoc.data()?.is_pro === true;

    // 2. Pro 사용자가 아닐 경우, 리포트 목록 없이 Pro 상태만 반환합니다.
    if (!isProUser) {
      return { isPro: false, reports: [] };
    }

    // 3. Pro 사용자일 경우, 해당 사용자의 모든 리포트를 시간순으로 가져옵니다.
    const reportsRef = db.collection("reports");
    const snapshot = await reportsRef
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .get();

    const reports: Report[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as Report;
      reports.push({
        id: doc.id,
        ...data,
        // Timestamp 객체를 JSON으로 변환 가능한 문자열로 변경
        timestamp: data.timestamp.toDate().toISOString(),
      });
    });

    return { isPro: true, reports };
  } catch (e) {
    console.error("히스토리 로딩 중 오류:", e);
    throw error(500, "분석 기록을 불러오는 중 오류가 발생했습니다.");
  }
};
