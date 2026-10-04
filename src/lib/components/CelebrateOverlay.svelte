<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '../gameState.svelte';
  import { THEMES } from '../theme';

  const XP = 120;
  // Matches the CSS timeline below: the badge pops at ~0.9s, the XP chip at ~1.45s.
  const XP_DELAY_MS = 1350;
  const XP_RUN_MS = 800;

  const overlayBg = $derived(THEMES[game.theme].overlay);
  const nextCi = $derived(game.ci + 1);
  const isCourseDone = $derived(nextCi >= game.chapters.length);
  const title = $derived(isCourseDone ? 'コース修了！' : 'クリア！');
  const body = $derived(
    isCourseDone
      ? `${game.chapters.length}つのレッスンを全部やりきりました。次は自分のコードに型をつけにいきましょう。`
      : `${game.ch.title} をクリアしました。この調子でつぎへ。`
  );
  const btnLabel = $derived(isCourseDone ? '学習マップへ' : 'つぎのレッスンへ →');

  // Eight short bars shooting outward from the badge, alternating accent colors.
  const SPARKS = Array.from({ length: 8 }, (_, i) => ({
    angle: i * 45 + 22.5,
    width: i % 2 ? 14 : 22,
    color: i % 2 ? 'var(--ac2)' : 'var(--ac)',
  }));

  // Ease-out count-up of the XP chip, started once the chip has popped in.
  let xp = $state(0);
  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      xp = XP;
      return;
    }
    let raf = 0;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / XP_RUN_MS);
        xp = Math.round(XP * (1 - Math.pow(1 - k, 3)));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, XP_DELAY_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  });
</script>

<div class="overlay" style="background:{overlayBg}">
  <div class="badge-wrap">
    {#each SPARKS as s}
      <div class="spark-arm" style="transform:rotate({s.angle}deg)">
        <div class="spark" style="width:{s.width}px;background:{s.color}"></div>
      </div>
    {/each}
    <svg class="ring" width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
      <circle class="ring-track" cx="70" cy="70" r="62" />
      <circle class="ring-draw" cx="70" cy="70" r="62" />
    </svg>
    <div class="check">
      <svg width="50" height="50" viewBox="0 0 46 46" aria-hidden="true">
        <polyline class="check-mark" points="10,24 20,34 37,13" />
      </svg>
    </div>
  </div>

  <div class="copy">
    <div class="title">{title}</div>
    <div class="body">{body}</div>
  </div>

  <div class="xp mono">+{xp} XP</div>

  <div class="actions">
    <button class="next" onclick={() => game.celebrateNext()}>{btnLabel}</button>
    <button class="stay" onclick={() => game.stayCelebrating()}>コードを見なおす</button>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 40px 24px;
    text-align: center;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    opacity: 0;
    animation: ccFadeIn 0.25s ease forwards;
  }

  .badge-wrap {
    position: relative;
    width: 140px;
    height: 140px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .spark-arm {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 0;
    height: 0;
  }
  .spark {
    position: absolute;
    left: 0;
    top: -4px;
    height: 8px;
    border-radius: 4px;
    opacity: 0;
    animation: ccShoot 0.6s cubic-bezier(0.1, 0.7, 0.3, 1) 1s forwards;
  }
  .ring {
    position: absolute;
    inset: 0;
    transform: rotate(-90deg);
  }
  .ring circle {
    fill: none;
    stroke-width: 8;
  }
  .ring-track {
    stroke: var(--bd);
  }
  .ring-draw {
    stroke: var(--ac);
    stroke-linecap: round;
    stroke-dasharray: 390;
    stroke-dashoffset: 390;
    animation: ccDraw 0.8s cubic-bezier(0.6, 0, 0.3, 1) 0.15s forwards;
  }
  .check {
    width: 104px;
    height: 104px;
    border-radius: 50%;
    background: var(--ac);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    animation: ccPop 0.45s cubic-bezier(0.3, 1.5, 0.5, 1) 0.9s forwards;
  }
  .check-mark {
    fill: none;
    stroke: var(--acFg);
    stroke-width: 5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 44;
    stroke-dashoffset: 44;
    animation: ccDraw 0.3s ease 1.15s forwards;
  }

  .copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    opacity: 0;
    animation: ccFadeUp 0.45s ease 1.25s forwards;
  }
  .title {
    font-size: clamp(34px, 6vw, 48px);
    font-weight: 900;
    line-height: 1.2;
  }
  .body {
    max-width: 30em;
    font-size: 15px;
    line-height: 1.8;
    color: var(--mu);
    text-wrap: pretty;
  }

  .xp {
    padding: 6px 16px;
    border-radius: 999px;
    background: var(--ac);
    color: var(--acFg);
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    opacity: 0;
    animation: ccPop 0.45s ease 1.45s forwards;
  }

  .actions {
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    opacity: 0;
    animation: ccFadeUp 0.4s ease 1.7s forwards;
  }
  .next {
    width: 100%;
    height: 54px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 900;
    color: var(--acFg);
    background: var(--ac);
    transition: filter 0.15s ease;
  }
  .next:hover {
    filter: brightness(0.9);
  }
  .stay {
    padding: 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    color: var(--mu);
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .stay:hover {
    color: var(--fg);
  }

  @keyframes ccFadeIn {
    to { opacity: 1; }
  }
  @keyframes ccFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes ccPop {
    0% { opacity: 0; transform: scale(0.3); }
    60% { opacity: 1; transform: scale(1.15); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes ccDraw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes ccShoot {
    0% { opacity: 0; transform: translateX(30px) scale(0.4); }
    20% { opacity: 1; }
    100% { opacity: 0; transform: translateX(120px) scale(1); }
  }

  /* Skip the choreography: show the finished state immediately. */
  @media (prefers-reduced-motion: reduce) {
    .overlay, .check, .copy, .xp, .actions {
      animation: none;
      opacity: 1;
    }
    .ring-draw, .check-mark {
      animation: none;
      stroke-dashoffset: 0;
    }
    .spark {
      display: none;
    }
  }
</style>
