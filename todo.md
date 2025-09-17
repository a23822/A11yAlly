# 프로젝트 할 일 목록 (Shipathon 2025 MVP)

## 목표: SvelteKit으로 마이그레이션 완료 및 RevenueCat 연동 MVP 출시

---

### [완료] 1단계: SvelteKit으로 전체 프로젝트 마이그레이션 ✅

- [x] **SvelteKit 프로젝트 초기 설정**: pnpm을 사용하여 SvelteKit (Svelte 5) 프로젝트 생성.
- [x] **백엔드 이전**: 기존 Express API 로직을 SvelteKit API Routes (`+server.ts`) 방식으로 모두 이전 완료.
  - [x] 사용자 인증 (`/api/user`, `/api/session`)
  - [x] 접근성 분석 (`/api/analyze`)
  - [x] 리포트 조회 (`/api/report`, `/api/reports`)
- [x] **프론트엔드 이전**: 기존 Vanilla JS/HTML 페이지들을 Svelte 컴포넌트 (`+page.svelte`)로 모두 이전 완료.
  - [x] 홈페이지, 리포트 상세, 분석 히스토리, Paywall 페이지
- [x] **인증 시스템 구축**: Firebase 인증과 서버 사이드 세션 쿠키를 연동하여 안정적인 로그인 상태 관리 구현.
- [x] **전역 상태 관리**: Svelte Store를 활용하여 사용자 로그인 상태를 앱 전역에서 공유.
- [x] **배포 설정**: Render 배포를 위한 `Dockerfile` 및 `adapter-node` 설정 완료.

---

### [완료] 2단계: BM 적용 및 RevenueCat 연동 (결제 시뮬레이션) ✅

- [x] **BaaS 및 DB 스키마 설정 (Firebase)**: `Users`, `Reports` 컬렉션 구조 확정.
- [x] **RevenueCat 기본 설정**: Product, Entitlement(`pro_access`), Offering 설정 완료.
- [x] **[BM 적용] 기능 제한 구현**:
  - [x] 무료 사용자는 리포트 상세 내용 중 상위 3개 이슈만 확인 가능.
  - [x] 무료 사용자는 분석 히스토리 접근 시 Paywall 페이지로 안내.
- [x] **[핵심] RevenueCat 연동 완료 (결제 시뮬레이션 방식):**
  - [x] Stripe/Paddle의 국가 정책 및 샌드박스 불안정성 문제로 실제 결제 연동 대신 **'수동 Pro 등급 부여'** 방식으로 MVP 최종 구현.
  - [x] Paywall 페이지의 '업그레이드' 버튼 클릭 시, 서버가 RevenueCat의 REST API를 직접 호출하여 해당 사용자에게 Pro Entitlement를 부여하는 API (`/api/grant-pro`) 개발 완료.
  - [x] Pro 등급 부여 성공 시 Firestore의 `is_pro` 상태를 `true`로 업데이트하여 기능 제한 해제 확인.

---

### [3단계] 최종 테스트 및 발표 준비 (진행 중) 🏃

- [ ] **통합 시나리오 테스트:**
  - [ ] **무료 사용자**: 회원가입 → 분석 → 제한된 리포트 확인 → 히스토리 접근 시 Paywall 노출.
  - [ ] **업그레이드**: Paywall → '업그레이드' 버튼 클릭 → RevenueCat 및 Firestore에 Pro 상태 반영 확인.
  - [ ] **유료 사용자**: Pro 상태에서 히스토리 접근 및 전체 리포트 확인 기능 테스트.
- [ ] 버그 수정 및 최종 QA.
- [ ] Shipathon 발표 준비.

---

### [4단계] 앱 배포 🚀

- [ ] **모바일 앱 확장**: 동일한 Firebase/RevenueCat 백엔드를 사용하여 Android/iOS 앱 개발.
