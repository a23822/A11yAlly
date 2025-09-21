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
    const progress = Math.min(y / 80, 1);

    // const top = 12 * (1 - progress);
    // const side = 12 * (1 - progress);
    // const borderRadius = 8 * (1 - progress);
    headerScrollProgress = progress;

    // headerInnerStyle = `top: ${top}px; left: ${side}px; right: ${side}px; border-radius: ${borderRadius}px;`;
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
      authLoading = true;
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) userProfile = data;
        })
        .finally(() => {
          authLoading = false;
        });
      syncSession($user);
    } else {
      userProfile = null;
      authLoading = false;
      syncSession(null);
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
  <Section
    innerClassName="header_inner"
    innerStyle={headerInnerStyle}
    title={!authLoading && !$user && "로그인"}
  >
    {#if authLoading}
      <div class="header_wrap">
        <div class="skeleton skeleton-p"></div>
        <div class="skeleton skeleton-btn"></div>
        <div class="skeleton skeleton-btn"></div>
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
        <button type="button" class="btn_logout" on:click={handleLogout}>
          <span class="blind">로그아웃</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <!-- 그라데이션 정의 -->
              <linearGradient
                id="exitGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" style="stop-color:#6c757d" />
                <stop offset="100%" style="stop-color:#495057" />
              </linearGradient>

              <!-- 호버 효과용 그라데이션 -->
              <linearGradient
                id="exitHoverGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" style="stop-color:#dc3545" />
                <stop offset="100%" style="stop-color:#c82333" />
              </linearGradient>
            </defs>

            <!-- 문 프레임 -->
            <path
              d="M4 3 
           L4 21 
           L10 21 
           L10 19 
           L6 19 
           L6 5 
           L10 5 
           L10 3 
           Z"
              fill="url(#exitGradient)"
              stroke="none"
            />

            <!-- 문 손잡이 -->
            <circle cx="8" cy="12" r="0.8" fill="url(#exitGradient)" />

            <!-- 나가는 화살표 -->
            <path
              d="M14 7 
           L14 11 
           L11 11 
           L11 13 
           L14 13 
           L14 17 
           L20 12 
           Z"
              fill="url(#exitGradient)"
            />

            <!-- 화살표 테두리 (더 선명하게) -->
            <path
              d="M14 7 
           L14 11 
           L11 11 
           L11 13 
           L14 13 
           L14 17 
           L20 12 
           Z"
              fill="none"
              stroke="url(#exitGradient)"
              stroke-width="0.5"
            />
          </svg>
        </button>
      </div>
    {:else}
      <div class="login_method_wrap">
        <button type="button" class="btn_login" on:click={handleLogin}>
          <span class="thumb_area">
            <svg
              class="icon_google"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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
    background-color: #e0e0e0;
    border-radius: 4px;
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .skeleton-p {
    height: 24px;
    width: 250px;
    margin-bottom: 10px;
  }
  .skeleton-btn {
    height: 40px;
    width: 100px;
    display: inline-block;
    margin-right: 10px;
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
    margin-bottom: 24px;
    height: 80px;

    &:before {
      content: "";
      position: fixed;
      top: calc(68px - 12px * var(--header-scroll-progress));
      left: 0;
      right: 0;
      height: 24px;
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
      top: calc(12px * (1 - var(--header-scroll-progress)));
      right: calc(12px * (1 - var(--header-scroll-progress)));
      left: calc(12px * (1 - var(--header-scroll-progress)));
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
      font-size: 1.4rem;
      line-height: 24px;
      font-weight: 600;
    }
    .btn_logout {
      flex-shrink: 0;
    }
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
      line-height: 24px;
    }
  }
</style>
