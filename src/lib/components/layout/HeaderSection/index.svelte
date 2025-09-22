<script lang="ts">
  import { user } from "$lib/stores/authStore";
  import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
  } from "firebase/auth";
  import Section from "$lib/components/common/CardSection/index.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  let userProfile: { nickname: string; email: string } | null = null;
  let authLoading = true;
  let isSticky = false;
  let scrollSentinel: HTMLDivElement;
  let y = 0;

  let headerInnerStyle = "";
  let headerScrollProgress = 0;
  $: {
    const progress = Math.min(y / 86, 1);
    headerScrollProgress = progress;
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log("header start sticky");
        isSticky = !entry.isIntersecting;
      },
      { threshold: [0] }
    );

    // 감시자 요소 관찰 시작
    if (scrollSentinel) {
      observer.observe(scrollSentinel);
    }

    // 컴포넌트가 파괴될 때 관찰 중지
    return () => {
      if (scrollSentinel) {
        observer.unobserve(scrollSentinel);
      }
    };
  });

  $: if (browser) {
    if ($user === undefined) {
      authLoading = true;
    } else if ($user) {
      // async 즉시 실행 함수로 감싸서 await를 사용합니다.
      (async () => {
        authLoading = true;
        // 1. 세션 동기화가 끝날 때까지 기다립니다.
        await syncSession($user);

        // 2. 세션이 생성된 후에 사용자 정보를 요청합니다.
        try {
          const response = await fetch("/api/user");
          if (response.ok) {
            const data = await response.json();
            if (data && !data.error) userProfile = data;
          } else {
            console.error("Failed to fetch user profile:", response.statusText);
            userProfile = null; // 실패 시 프로필 초기화
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          authLoading = false;
        }
      })();
    } else {
      // 로그아웃 처리
      userProfile = null;
      authLoading = false;
      if (document.cookie.includes("session=")) {
        syncSession(null);
      }
    }
  }

  async function syncSession(user: import("firebase/auth").User | null) {
    if (user) {
      const idToken = await user.getIdToken();
      await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    } else {
      await fetch("/api/session/logout", { method: "POST" });
    }
  }

  async function handleLogin() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
        }),
      });
    } catch (error) {
      console.error("로그인 오류:", error);
    }
  }

  async function handleLogout() {
    const auth = getAuth();
    await signOut(auth);
  }
</script>

<svelte:window bind:scrollY={y} />
<div role="presentation" bind:this={scrollSentinel} class="sentinel"></div>
<header
  class="header"
  class:is_sticky={isSticky}
  style:--header-scroll-progress={headerScrollProgress}
>
  <Section innerClassName="header_inner" innerStyle={headerInnerStyle}>
    {#if authLoading}
      <div class="header_wrap">
        <div class="skeleton skeleton_thumb"></div>
        <div class="skeleton skeleton_desc"></div>
      </div>
    {:else if $user && userProfile}
      <div class="header_wrap">
        <div class="thumb_area">
          {#if $user.photoURL}
            <img
              width="24"
              height="24"
              src={$user.photoURL}
              alt=""
              class="thumb"
            />
          {/if}
        </div>
        <div class="desc_area">{userProfile?.nickname}</div>
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded="false"
          class="btn_menu"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="8" width="36" height="3" rx="1.5" fill="#2C3E50" />
            <rect x="2" y="16" width="30" height="3" rx="1.5" fill="#34495E" />
            <rect x="2" y="24" width="34" height="3" rx="1.5" fill="#2C3E50" />
            <rect x="2" y="32" width="28" height="3" rx="1.5" fill="#34495E" />
          </svg>
        </button>
        <!-- <button type="button" class="btn_logout" on:click={handleLogout}>
          <span class="blind">로그아웃</span>
          <svg
            viewBox="0 0 32 32"
            width="80"
            height="80"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="8"
              y="8"
              width="8"
              height="16"
              fill="none"
              stroke="white"
              stroke-width="2.5"
              rx="3"
            />
            <circle cx="12" cy="16" r="1.2" fill="white" />
            <path
              d="M19 12L24 16L19 20"
              fill="none"
              stroke="white"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="16"
              y1="16"
              x2="24"
              y2="16"
              stroke="white"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </button> -->
      </div>
    {:else}
      <div class="login_method_wrap">
        <h2 class="login_text">로그인</h2>
        <button type="button" class="btn_login" on:click={handleLogin}>
          <span class="thumb_area">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              class="thumb"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </span>
          <span class="desc_area">구글</span>
        </button>
      </div>
    {/if}
  </Section>
</header>

<style lang="scss">
  /* 스켈레톤 UI 스타일 */
  .skeleton {
    height: var(--layout-height-inner-header);
    background-color: #e0e0e0;
    border-radius: 4px;
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .skeleton_thumb {
    width: var(--layout-height-inner-header);
    height: var(--layout-height-inner-header);
    border-radius: 50%;
  }
  .skeleton_desc {
    margin-right: auto;
    width: 25%;
    height: var(--layout-height-inner-header);
    border-radius: 4px;
  }
  @keyframes pulse {
    50% {
      opacity: 0.5;
    }
  }

  .sentinel {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 1px;
    background: transparent;
    pointer-events: none;
  }

  .header {
    position: relative;
    margin-bottom: var(--layout-gap-section);
    height: calc(
      var(--layout-height-header) + 2 * var(--layout-padding-outer-card-section)
    );

    &:before {
      content: "";
      position: fixed;
      top: calc(
        calc(
            var(--layout-height-header) +
              var(--layout-padding-outer-card-section)
          ) - var(--layout-padding-outer-card-section) *
          var(--header-scroll-progress)
      );
      left: 0;
      right: 0;
      height: var(--layout-height-inner-header);
      background: linear-gradient(
        0deg,
        rgba(var(--color-bg-card), 0) 0%,
        rgba(var(--color-bg-card), 1) 100%
      );
      opacity: var(--header-scroll-progress);
      pointer-events: none;
    }

    :global .header_inner {
      position: fixed;
      top: calc(
        var(--layout-padding-outer-card-section) *
          (1 - var(--header-scroll-progress))
      );
      right: calc(
        var(--layout-padding-outer-card-section) *
          (1 - var(--header-scroll-progress))
      );
      left: calc(
        var(--layout-padding-outer-card-section) *
          (1 - var(--header-scroll-progress))
      );
      border-radius: calc(8px * (1 - var(--header-scroll-progress)));
      z-index: 8000;
    }

    &.is_sticky {
      :global .header_inner {
        &:before {
          opacity: calc(1 - var(--header-scroll-progress));
        }
      }
    }
  }

  .header_wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    height: var(--layout-height-inner-header);
    line-height: var(--layout-height-inner-header);
    .thumb_area {
      flex-shrink: 0;
      position: relative;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      &:before {
        content: "";
        position: absolute;
        inset: 0;
        border: 1px solid var(--color-border-inset);
        border-radius: inherit;
      }
    }
    .desc_area {
      overflow: hidden;
      flex: 1;
      font-size: 1.4rem;
      font-weight: 600;
    }
    .btn_logout {
      flex-shrink: 0;
      background-color: blue;
      > svg {
        width: 24px;
        height: 24px;
      }
    }
  }

  .login_method_wrap {
    display: flex;
    gap: 0 16px;
    line-height: var(--layout-height-inner-header);
  }

  .login_text {
    font-size: 1.8rem;
    font-weight: 600;
  }

  .btn_login {
    display: flex;
    align-items: center;
    gap: 0 6px;
    padding: 0 8px;
    border: 2px solid rgba(var(--color-border-default), 1);
    border-radius: var(--layout-height-inner-header);
    .thumb_area {
      flex: 0 0 auto;
      width: 18px;
      height: 18px;
    }
    .desc_area {
      flex: 0 1 auto;
      font-size: 1.6rem;
      font-weight: 600;
    }
  }

  .btn_menu {
    padding: 5px;
  }
</style>
