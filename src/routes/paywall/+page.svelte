<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import type { Paddle } from '@paddle/paddle-js';
	import { PUBLIC_PADDLE_CLIENT_TOKEN, PUBLIC_PADDLE_PRO_PLAN_PRICE_ID } from '$env/static/public';

	let paddle: Paddle | undefined;
	let isButtonDisabled = true;
	let purchaseBtnText = '결제 시스템 초기화 중...';
	let errorMessage = '';

	// Paddle.js를 동적으로 로드합니다.
	onMount(async () => {
		try {
			const paddleJs = await import('@paddle/paddle-js');
			// 'initializePaddle' 함수를 사용하여 Paddle 인스턴스를 생성합니다.
			paddle = await paddleJs.initializePaddle({
				environment: 'sandbox', // 테스트 환경
				token: PUBLIC_PADDLE_CLIENT_TOKEN
			});
			isButtonDisabled = false;
			purchaseBtnText = 'Pro 플랜으로 업그레이드';
		} catch (error) {
			console.error('Paddle 초기화 실패:', error);
			errorMessage = '결제 시스템을 불러오는 데 실패했습니다.';
		}
	});

	// 사용자가 로그인했는지 확인
	user.subscribe((currentUser) => {
		if (currentUser === null) {
			if (typeof window !== 'undefined') goto('/');
		}
	});

	async function handlePurchase() {
		if (!paddle || !$user || !$user.email) {
			errorMessage = '사용자 정보가 올바르지 않습니다. 다시 로그인해주세요.';
			return;
		}

		console.log($user.email)

		isButtonDisabled = true;
		purchaseBtnText = '결제창 여는 중...';
		errorMessage = '';

		paddle.Checkout.open({
			items: [
				{
					priceId: PUBLIC_PADDLE_PRO_PLAN_PRICE_ID, // ◀◀◀ Paddle 대시보드의 Price ID
					quantity: 1
				}
			],
			
			customer: {
				email: $user.email
			}
		});

		// 결제가 성공했는지 여부는 서버 웹훅으로 처리하므로, 여기서는 버튼 상태만 되돌립니다.
		setTimeout(() => {
			isButtonDisabled = false;
			purchaseBtnText = 'Pro 플랜으로 업그레이드';
		}, 3000);
	}
</script>

<button id="purchase-btn" on:click={handlePurchase} disabled={isButtonDisabled}>
	{purchaseBtnText}
</button>