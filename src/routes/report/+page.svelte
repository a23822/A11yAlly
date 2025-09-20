<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
    import { goto } from '$app/navigation';
	import DOMPurify from 'dompurify';
	import { marked } from 'marked';

	// `+page.server.ts`의 load 함수가 return한 데이터가 'data'라는 이름의 prop으로 내려옵니다.
	export let data: PageData;

	// data 객체에서 report 정보를 바로 사용할 수 있도록 변수에 할당합니다.
	const { report } = data;
	const { title, url, issues_json } = report;
	const {
		simulatedDeficiency,
		aiAnalysis,
		axeAiAnalysis,
		accessibilityViolations,
		isTruncated
	} = issues_json;

	// 렌더링될 HTML을 담을 변수를 준비합니다.
	let safeAiAnalysis = '';
	let safeAxeAiAnalysis = '';

	// onMount는 코드가 브라우저에서만 실행되도록 보장합니다.
	onMount(async () => {
		// 1. marked로 Markdown을 HTML로 변환합니다.
		const rawHtmlFromAi = await marked.parse(aiAnalysis);
		const rawHtmlFromAxe = await marked.parse(axeAiAnalysis);

		// 2. DOMPurify로 변환된 HTML을 소독합니다.
		safeAiAnalysis = DOMPurify.sanitize(rawHtmlFromAi);
		safeAxeAiAnalysis = DOMPurify.sanitize(rawHtmlFromAxe);
	});
</script>

<div class="container">
	<header>
		<h1>분석 리포트</h1>
		<p><a href="/"> &laquo; 홈으로 돌아가기</a></p>
	</header>

	<main id="report-content">
		<article>
			<h2>분석 대상: {title}</h2>
			<p>
				<strong>URL:</strong>
				<a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
			</p>
		</article>

		<article>
			<h2>AI 시각적 분석 ({simulatedDeficiency})</h2>
			<!-- eslint-disable-next-line -->
			<div>{@html safeAiAnalysis.replace(/\n/g, '<br>')}</div>
		</article>

		<article>
			<h2>Axe-core 기반 AI 분석</h2>
			<!-- eslint-disable-next-line -->
			<div>{@html safeAxeAiAnalysis.replace(/\n/g, '<br>')}</div>
		</article>

		<article>
			<h2>상세 위반 사항</h2>
			{#if accessibilityViolations && accessibilityViolations.length > 0}
				{#each accessibilityViolations as violation (violation.id)}
					<div class="violation-card">
						<h3>[{violation.impact}] {violation.help}</h3>
						<p>{violation.description}</p>
						<p>
							<strong>도움말 URL:</strong>
							<a href={violation.helpUrl} target="_blank" rel="noopener noreferrer">
								{violation.helpUrl}
							</a>
						</p>
					</div>
				{/each}
			{:else}
				<p>발견된 접근성 위반 사항이 없습니다! 🎉</p>
			{/if}

			{#if isTruncated}
				<div class="upgrade-cta">
					<h3>전체 리포트를 보려면 업그레이드하세요!</h3>
					<p>
						상위 3개의 이슈만 표시되었습니다. Pro Plan으로 업그레이드하고 모든 접근성 문제점을
						확인하세요.
					</p>
					<button on:click={() => goto('/paywall')}>Pro Plan으로 업그레이드</button>
				</div>
			{/if}
		</article>
	</main>
</div>

<style lang="scss">
	// 기존 public/report/_index.scss 파일의 내용을 가져옵니다.
	#report-content article {
		background-color: #f9f9f9;
		padding: 20px;
		margin-bottom: 20px;
		border-left: 5px solid var(--primary-color);
		border-radius: var(--border-radius);
	}

	.violation-card {
		background-color: var(--card-bg-color);
		border: 1px solid #e0e0e0;
		border-radius: var(--border-radius);
		padding: 15px;
		margin-top: 15px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.violation-card h3 {
		margin-top: 0;
		font-size: 1.1em;
		color: #d9534f;
	}

	.upgrade-cta {
		background-color: #fffbe6;
		border: 1px solid #ffe58f;
		border-radius: var(--border-radius);
		padding: 20px;
		margin-top: 25px;
		text-align: center;

		h3 {
			margin-top: 0;
			color: #faad14;
		}

		button {
			background-color: #faad14;
			border-color: #faad14;

			&:hover {
				background-color: #d48806;
			}
		}
	}
</style>