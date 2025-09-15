<script lang="ts">
	import { user } from '$lib/stores/authStore';
	import { PUBLIC_REVENUECAT_PUBLIC_API_KEY } from '$env/static/public';
	import { Purchases, LogLevel } from '@revenuecat/purchases-js';
	import { goto } from '$app/navigation';

	let purchaseBtnText = '사용자 정보 확인 중...';
	let isButtonDisabled = true;
	let errorMessage = '';
	let isRevenueCatReady = false;

	user.subscribe((currentUser) => {
		if (currentUser) {
			if (!isRevenueCatReady && PUBLIC_REVENUECAT_PUBLIC_API_KEY) {
				Purchases.setLogLevel(LogLevel.Debug);

				Purchases.configure({
					apiKey: PUBLIC_REVENUECAT_PUBLIC_API_KEY,
					appUserId: currentUser.uid
				});

				isRevenueCatReady = true;
				isButtonDisabled = false;
				purchaseBtnText = '월 ₩9,900으로 Pro 시작하기';
			}
		} else if (currentUser === null) {
			isButtonDisabled = true;
			purchaseBtnText = '로그인이 필요합니다.';
			if (typeof window !== 'undefined') {
				goto('/');
			}
		}
	});

	async function handlePurchase() {
		isButtonDisabled = true;
		purchaseBtnText = '처리 중...';
		errorMessage = '';
		try {
			const offerings = await Purchases.getSharedInstance().getOfferings();
			if (!offerings.current || offerings.current.availablePackages.length === 0) {
				throw new Error('판매 중인 상품을 찾을 수 없습니다.');
			}
			const packageToPurchase = offerings.current.availablePackages[0];
			
			const { customerInfo } = await Purchases.getSharedInstance().purchasePackage(packageToPurchase);
			
			if (customerInfo.entitlements.active['pro_access']) {
				alert('업그레이드 성공! Pro 플랜이 활성화되었습니다.');
				window.location.href = '/history';
			} else {
				throw new Error('구매는 완료되었으나 Pro 플랜 활성화에 실패했습니다.');
			}
		} catch (error: any) {
			if (!error.userCancelled) {
				console.error('결제 처리 중 오류:', error);
				errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
			}
			isButtonDisabled = false;
			purchaseBtnText = '월 ₩9,900으로 Pro 시작하기';
		}
	}
</script>

<div class="container">
	<header>
		<h1>A11yAlly Pro</h1>
		<p>모든 기능을 잠금 해제하고 최고의 웹 접근성 분석을 경험하세요.</p>
	</header>
	<main id="paywall-content">
		<div class="plan-features">
			<h2>Pro 플랜의 특별한 기능</h2>
			<ul>
				<li>✔️ 모든 접근성 위반 사항 상세 리포트</li>
				<li>✔️ 과거 모든 분석 기록 확인 및 관리</li>
				<li>✔️ 우선적인 기술 지원</li>
			</ul>
		</div>

		{#if errorMessage}
			<div id="error-message">{errorMessage}</div>
		{/if}
		
		<button id="purchase-btn" on:click={handlePurchase} disabled={isButtonDisabled}>
			{purchaseBtnText}
		</button>
		
		<p class="notice">
			결제는 Stripe를 통해 안전하게 처리됩니다. 언제든지 구독을 취소할 수 있습니다.
		</p>
	</main>
</div>

<style lang="scss">
	// 기존 public/paywall/_index.scss 파일의 내용을 가져옵니다.
	.plan-features {
		margin-bottom: 30px;
		ul {
			list-style: none;
			padding-left: 0;
			li {
				font-size: 1.1em;
				margin-bottom: 10px;
			}
		}
	}

	#purchase-btn {
		width: 100%;
		padding: 15px;
		font-size: 1.2em;
		font-weight: bold;
		margin-bottom: 15px;
	}

	#error-message {
		color: #d9534f;
		background-color: #f2dede;
		border: 1px solid #ebccd1;
		padding: 10px;
		border-radius: var(--border-radius);
		margin-bottom: 15px;
	}

	.notice {
		font-size: 0.9em;
		color: #777;
		text-align: center;
	}
</style>