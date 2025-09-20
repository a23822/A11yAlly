import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/firebaseAdmin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { Report } from "$lib/types";
import admin from "firebase-admin";

export const GET: RequestHandler = async ({ locals }) => {
  if (!db) {
    return json({ error: "서버 설정 오류." }, { status: 500 });
  }

  const uid = locals.user?.uid;

  try {
    const reportsRef = db.collection("reports");
    const snapshot = await reportsRef
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .get();

    if (snapshot.empty) {
      return json([], { status: 200 }); // 빈 배열 반환
    }

    const reports: Report[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as Omit<Report, "id" | "timestamp"> & {
        timestamp: admin.firestore.Timestamp;
      };
      reports.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate().toISOString(),
      });
    });

    return json(reports, { status: 200 });
  } catch (error) {
    console.error("전체 리포트 조회 오류:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
};
