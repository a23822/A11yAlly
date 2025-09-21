import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/firebaseAdmin";
import { generateNickname } from "$lib/server/nicknameGenerator";

export const POST: RequestHandler = async ({ request }) => {
  if (!db) {
    console.error("Firebase DB is not initialized.");
    return json({ error: "서버 설정 오류." }, { status: 500 });
  }

  const { uid, email } = await request.json();

  if (!uid || !email) {
    return json({ error: "uid와 email은 필수입니다." }, { status: 400 });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      // 새로운 사용자일 경우, 기본값으로 문서를 생성합니다.
      const nickname = generateNickname();
      await userRef.set({
        email: email,
        is_pro: false,
        createdAt: new Date(),
        nickname: nickname,
      });
      return json(
        { message: "새로운 사용자가 생성되었습니다." },
        { status: 201 }
      );
    } else {
      // 기존 사용자일 경우, 이메일만 업데이트 (필요 시)
      await userRef.update({ email: email });
      return json(
        { message: "기존 사용자 정보가 업데이트되었습니다." },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Firestore 사용자 생성/업데이트 오류:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: "인증되지 않았습니다." }, { status: 401 });
  }

  try {
    const userDoc = await db.collection("users").doc(locals.user.uid).get();
    if (!userDoc.exists) {
      return json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return json(userDoc.data(), { status: 200 });
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
};
