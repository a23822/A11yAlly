import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/firebaseAdmin";
import type { RevenueCatWebhookBody } from "$lib/types/revenuecat";
import { REVENUECAT_WEBHOOK_SECRET } from "$env/static/private";

// RevenueCat 대시보드에 정의된 Pro 접근 권한 Entitlement ID
const PRO_ENTITLEMENT_ID = "pro_access";

export const POST: RequestHandler = async ({ request }) => {
  if (!REVENUECAT_WEBHOOK_SECRET) {
    console.error(
      "CRITICAL: REVENUECAT_WEBHOOK_SECRET is not set in .env file."
    );
    return json(
      { error: "Webhook secret not configured on server." },
      { status: 500 }
    );
  }

  const authorizationHeader = request.headers.get("Authorization");

  if (authorizationHeader !== REVENUECAT_WEBHOOK_SECRET) {
    console.warn("Unauthorized RevenueCat webhook attempt detected.");
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    console.error("[Webhook] Firestore instance is not available.");
    return json(
      { error: "Internal Server Error (Database unavailable)." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as RevenueCatWebhookBody;
    const {
      type: eventType,
      app_user_id: userId,
      entitlement_ids,
    } = body.event;

    console.log(`[Webhook] Received event: ${eventType} for user: ${userId}`);

    // TEST 이벤트 처리
    if (eventType === "TEST") {
      return json({ message: "Test event received successfully." });
    }

    if (!userId) {
      // user ID가 없는 웹훅은 처리할 필요 없음
      return json({ message: "Ignored: Missing user ID." });
    }

    let updateData: { is_pro: boolean; subscription_status?: string } | null =
      null;

    switch (eventType) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "NON_RENEWING_PURCHASE":
        // 구매, 갱신 시 Pro 권한이 포함되어 있는지 확인합니다.
        if (entitlement_ids.includes(PRO_ENTITLEMENT_ID)) {
          updateData = { is_pro: true, subscription_status: "active" };
        }
        break;

      case "EXPIRATION":
        // 만료 이벤트 발생 시, 만료된 항목이 Pro 권한인지 확인합니다.
        if (entitlement_ids.includes(PRO_ENTITLEMENT_ID)) {
          updateData = { is_pro: false, subscription_status: "expired" };
        }
        break;

      case "PRODUCT_CHANGE": {
        // 상품 변경 시, 현재 이벤트에 포함된 권한 목록을 기준으로 판단합니다.
        const hasProAccess = entitlement_ids.includes(PRO_ENTITLEMENT_ID);
        updateData = {
          is_pro: hasProAccess,
          subscription_status: hasProAccess ? "active" : "inactive_change",
        };
        break;
      }

      case "CANCELLATION":
        // 취소는 자동 갱신 해제를 의미하며, 즉시 권한을 박탈하지 않습니다. (EXPIRATION에서 처리)
        console.log(
          `[Webhook] Cancellation detected for ${userId}. Access will be revoked upon expiration.`
        );
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
        break;
    }

    // 상태 변경이 필요한 경우 Firestore 업데이트
    if (updateData !== null) {
      const userRef = db.collection("users").doc(userId); // Users -> users 컬렉션 이름 확인 필요
      const finalUpdate = {
        ...updateData,
        subscription_updated_at: new Date(), // 마지막 업데이트 시간 기록
      };

      await userRef.update(finalUpdate);
      console.log(
        `[Webhook] Successfully updated user ${userId}: is_pro=${updateData.is_pro}`
      );
    }

    // 모든 처리가 끝나면 성공 응답을 보냅니다.
    return json({ message: "Webhook processed successfully." });
  } catch (error) {
    console.error(`[Webhook] Error processing webhook:`, error);
    // 실패 시 500 에러 반환 (RevenueCat 재시도 유도)
    return json(
      { error: "Internal Server Error (Webhook processing failed)." },
      { status: 500 }
    );
  }
};
