<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeApp, getApps, getApp } from 'firebase/app';
	import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_STORAGE_BUCKET, PUBLIC_FIREBASE_MESSAGING_SENDER_ID, PUBLIC_FIREBASE_APP_ID } from '$env/static/public';

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
</style>

<div class="container">
	<header>
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