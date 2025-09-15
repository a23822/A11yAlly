export type RevenueCatEventType =
  | 'INITIAL_PURCHASE' // 첫 구매
  | 'RENEWAL' // 갱신
  | 'CANCELLATION' // 취소 (자동 갱신 중단)
  | 'EXPIRATION' // 만료 (접근 권한 종료)
  | 'PRODUCT_CHANGE' // 상품 변경
  | 'NON_RENEWING_PURCHASE'
  | 'TEST'; // 테스트 이벤트

export interface RevenueCatWebhookBody {
  api_version: string;
  event: {
    id: string;
    type: RevenueCatEventType;
    event_timestamp_ms: number;
    app_user_id: string; // Firebase UID
    // 활성화된 권한 목록 (예: ['pro_access'])
    entitlement_ids: string[];
    environment: 'PRODUCTION' | 'SANDBOX' | 'STRIPE_TEST';
    // ... 기타 필요한 필드들
  };
}
