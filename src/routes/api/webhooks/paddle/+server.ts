// src/routes/api/webhooks/paddle/+server.ts

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { REVENUECAT_PUBLIC_API_KEY } from "$env/static/private"; // RevenueCat 비밀키가 아닌 공개키가 필요합니다.
import { db } from "$lib/server/firebaseAdmin";

export const POST: RequestHandler = async ({ request }) => {
  const event = await request.json();

  // Paddle 웹훅 이벤트가 'transaction.completed'일 때만 처리
  if (event.event_type === "transaction.completed") {
    const transactionData = event.data;
    const firebaseUid = transactionData.custom_data?.firebase_uid;
    const paddleTransactionId = transactionData.id; // Paddle 거래 ID

    if (!firebaseUid || !paddleTransactionId) {
      console.error(
        "Paddle 웹훅에 firebase_uid 또는 transaction ID가 없습니다."
      );
      return json({ error: "필수 정보 누락" }, { status: 400 });
    }

    try {
      // --- RevenueCat 영수증(Receipt) API 호출 ---
      const response = await fetch("https://api.revenuecat.com/v1/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Platform": "paddle",
          // 문서에 나온대로, 여기에는 RevenueCat의 Public API Key를 Bearer 토큰으로 보냅니다.
          Authorization: `Bearer ${REVENUECAT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          app_user_id: firebaseUid,
          fetch_token: paddleTransactionId, // Paddle 거래 ID를 fetch_token으로 사용
          price: transactionData.details.totals.grand_total / 100, // Paddle은 센트 단위로 오므로 100으로 나눔
          currency: transactionData.details.totals.currency_code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("RevenueCat 영수증 전송 실패:", errorData);
        throw new Error("RevenueCat 구독 동기화 실패");
      }

      console.log(
        `사용자 ${firebaseUid}의 구독 정보가 RevenueCat에 성공적으로 동기화되었습니다.`
      );

      // 성공 시 Firestore DB도 업데이트 (선택사항이지만 권장)
      if (db) {
        await db.collection("users").doc(firebaseUid).update({ is_pro: true });
      }
    } catch (error) {
      console.error("웹훅 처리 중 오류:", error);
      // 오류가 발생해도 Paddle에게는 성공(200)으로 응답해야 재전송을 막을 수 있습니다.
    }
  }

  return json({ status: "received" });
};
