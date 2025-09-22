<script lang="ts">
  import { user } from "$lib/stores/authStore";
  import { goto } from "$app/navigation";
  import HeaderSection from "$lib/components/layout/HeaderSection/index.svelte";
  import CardSection from "$lib/components/common/CardSection/index.svelte";
  import { HomePageIdCollector } from "$lib/constants/id";

  let analyzeIsLoading = false;
  let errorMessage = "";
  let urlToAnalyze = "";
  let selectedDeficiency = "";

  async function handleAnalyze() {
    if (!$user) {
      alert("분석을 실행하려면 먼저 로그인해주세요.");
      return;
    }
    analyzeIsLoading = true;
    errorMessage = "";
    try {
      const idToken = await $user.getIdToken();
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          url: urlToAnalyze,
          visionDeficiency: selectedDeficiency || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "분석 중 알 수 없는 오류가 발생했습니다."
        );
      }
      goto(`/report?id=${data.reportId}`);
    } catch (error) {
      errorMessage = (error as Error).message;
    } finally {
      analyzeIsLoading = false;
    }
  }
</script>

<div class="container">
  <HeaderSection />
  <CardSection title="웹 접근성 분석">
    <form
      id={HomePageIdCollector.HOME_FORM_SUBMIT}
      on:submit|preventDefault={handleAnalyze}
    >
      <input
        type="url"
        id={HomePageIdCollector.HOME_INPUT_URL}
        placeholder="분석할 웹사이트 URL을 입력하세요."
        class="input_url"
        required
        bind:value={urlToAnalyze}
      />
    </form>
  </CardSection>

  <header style="margin-top: 50px;">
    <h1>A11yAlly</h1>
    <p>당신의 웹 접근성 동맹, A11yAlly와 함께 시작하세요!</p>
    {#if $user}
      <div id="auth-container">
        <a href="/history"><button>내 분석 기록</button></a>
      </div>
    {/if}
  </header>

  <main>
    <form
      id={HomePageIdCollector.HOME_FORM_SUBMIT}
      on:submit|preventDefault={handleAnalyze}
    >
      <input
        type="url"
        id={HomePageIdCollector.HOME_INPUT_URL}
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
      <button type="submit" disabled={analyzeIsLoading}>
        {#if analyzeIsLoading}
          분석 중...
        {:else}
          분석 시작
        {/if}
      </button>
    </form>

    {#if analyzeIsLoading}
      <div id="loading-indicator">
        <div class="spinner"></div>
        <p>AI가 열심히 분석 중입니다... 잠시만 기다려주세요.</p>
      </div>
    {/if}

    {#if errorMessage}
      <p style="color: red;"><strong>오류:</strong> {errorMessage}</p>
    {/if}
    <div style="height: 200vh;"></div>
  </main>
</div>

<style lang="scss">
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

  .input_url {
    width: 100%;
    height: 24px;
    line-height: 24px;

    &::placeholder {
      color: rgba(var(--color-font-placeholder), 1);
    }
  }
</style>
