<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container">
	<header>
		<h1>분석 히스토리</h1>
		<p><a href="/"> &laquo; 홈으로 돌아가기</a></p>
	</header>

	<main id="history-content">
		{#if data.isPro}
			{#if data.reports.length === 0}
				<p>아직 분석한 기록이 없습니다. 홈페이지에서 분석을 시작해보세요!</p>
			{:else}
				{#each data.reports as report}
					<div class="report-list-item">
						<div class="report-info">
							<a href="/report?id={report.id}">{report.title}</a>
							<div class="report-meta">
								<span>{new Date(report.timestamp).toLocaleString()}</span>
								|
								<span>{report.url}</span>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		{:else}
			<div class="upgrade-cta">
				<h3>분석 히스토리 기능은 Pro Plan 사용자 전용입니다.</h3>
				<p>Pro Plan으로 업그레이드하고 모든 분석 기록을 확인하고 관리하세요.</p>
				<a href="/paywall"><button>Pro Plan으로 업그레이드</button></a>
			</div>
		{/if}
	</main>
</div>

<style lang="scss">
	.report-list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border: 1px solid #e0e0e0;
		border-radius: var(--border-radius);
		margin-bottom: 10px;
		transition: box-shadow 0.2s;

		&:hover {
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		}

		.report-info {
			flex-grow: 1;
			a {
				color: var(--primary-color);
				text-decoration: none;
				font-weight: bold;
				&:hover {
					text-decoration: underline;
				}
			}
			.report-meta {
				font-size: 0.9em;
				color: #777;
			}
		}
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
			margin-top: 10px;

			&:hover {
				background-color: #d48806;
			}
		}
	}
</style>