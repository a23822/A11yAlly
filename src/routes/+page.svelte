<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeApp, getApps, getApp } from 'firebase/app';
	import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_STORAGE_BUCKET, PUBLIC_FIREBASE_MESSAGING_SENDER_ID, PUBLIC_FIREBASE_APP_ID } from '$env/static/public';
	import Section from '$lib/components/common/CardSection/index.svelte';

	let currentUser: User | null = null;
	let isLoading = false;
	let errorMessage = '';
	let urlToAnalyze = '';
	let selectedDeficiency = '';

	const firebaseConfig = {
		apiKey: PUBLIC_FIREBASE_API_KEY,
		authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		appId: PUBLIC_FIREBASE_APP_ID
	};

	onMount(() => {
		const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
		const auth = getAuth(app);

		onAuthStateChanged(auth, async (user) => {
			currentUser = user;

			if (user) {
				// ▼▼▼ 로그인 시: ID 토큰을 서버로 보내 쿠키를 생성합니다. ▼▼▼
				const idToken = await user.getIdToken();
				await fetch('/api/session/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ idToken })
				});

				// 사용자 DB 정보 저장은 그대로 유지
				await fetch('/api/user', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ uid: user.uid, email: user.email })
				});
			} else {
				// ▼▼▼ 로그아웃 시: 서버에 알려 쿠키를 삭제합니다. ▼▼▼
				await fetch('/api/session/logout', { method: 'POST' });
			}
		});
	});

	async function handleLogin() {
		const auth = getAuth();
		const provider = new GoogleAuthProvider();
		try {
			await signInWithPopup(auth, provider);
		} catch (error) {
			console.error('로그인 오류:', error);
			errorMessage = '로그인 중 오류가 발생했습니다.';
		}
	}

	async function handleLogout() {
		const auth = getAuth();
		await signOut(auth);
	}

	async function handleAnalyze() {
		if (!currentUser) {
			alert('분석을 실행하려면 먼저 로그인해주세요.');
			return;
		}
		isLoading = true;
		errorMessage = '';
		try {
			const idToken = await currentUser.getIdToken();
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${idToken}`
				},
				body: JSON.stringify({
					url: urlToAnalyze,
					visionDeficiency: selectedDeficiency || undefined
				})
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || '분석 중 알 수 없는 오류가 발생했습니다.');
			}
			goto(`/report?id=${data.reportId}`);
		} catch (error) {
			errorMessage = (error as Error).message;
		} finally {
			isLoading = false;
		}
	}
</script>

<style lang="scss">
    #auth-container {
    margin-bottom: 20px;
    }

#analyze-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

#url-input,
#vision-deficiency-select {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.btn_login {
	display: flex;
	.thumb_area {
		flex: 0 0 auto;
		width: 24px;
		height: 24px;
	}
	.desc_area {
		flex: 0 1 auto;
		font-size: 1.3rem;
		line-height: 24px;;
	}
}
</style>

<div class="container">
	<Section class="auth_section" title={!currentUser && "로그인"}>
			{#if currentUser}
					<div class="auth_wrap">

				<div class="thumb_area">

				</div>
				<div class="desc_area">

				</div>
				</div>
			{:else}
			<div class="login_method_wrap">
				<button type="button" class="btn_login" on:click={handleLogin}>
					<span class="thumb_area">
						<svg class="icon_google" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
							<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
					</span>
					<span class="desc_area">
						구글
					</span>
				</button>
				</div>
			{/if}
	</Section>
	<header style="margin-top: 50px;">
		<h1>A11yAlly</h1>
		<p>당신의 웹 접근성 동맹, A11yAlly와 함께 시작하세요!</p>
		<div id="auth-container">
			{#if currentUser}
				<div id="user-info">
					<p><span>{currentUser.email}</span>님 환영합니다!</p>
					<a href="/history"><button>내 분석 기록</button></a>
					<button on:click={handleLogout}>로그아웃</button>
				</div>
			{:else}
				<button on:click={handleLogin}>Google 로그인</button>
			{/if}
		</div>
	</header>

	<main>
		<form id="analyze-form" on:submit|preventDefault={handleAnalyze}>
			<input
				type="url"
				id="url-input"
				placeholder="분석할 웹사이트 URL을 입력하세요"
				required
				bind:value={urlToAnalyze}
			/>
			<select id="vision-deficiency-select" bind:value={selectedDeficiency}>
				<option value="">일반 시야</option>
				<option value="protanopia">적색맹</option>
				<option value="deuteranopia">녹색맹</option>
				<option value="tritanopia">청색맹</option>
				<option value="achromatopsia">완전 색맹</option>
			</select>
			<button type="submit" disabled={isLoading}>
				{#if isLoading}
					분석 중...
				{:else}
					분석 시작
				{/if}
			</button>
		</form>

		{#if isLoading}
			<div id="loading-indicator">
				<div class="spinner"></div>
				<p>AI가 열심히 분석 중입니다... 잠시만 기다려주세요.</p>
			</div>
		{/if}

		{#if errorMessage}
			<p style="color: red;"><strong>오류:</strong> {errorMessage}</p>
		{/if}
	</main>
</div>