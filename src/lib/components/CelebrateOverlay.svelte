<script lang="ts">
  import { DATA } from '../data';
  import { game } from '../gameState.svelte';
  import { THEMES } from '../theme';

  const overlayBg = $derived(THEMES[game.theme].overlay);
  const nextCi = $derived(game.ci + 1);
  const isCourseDone = $derived(nextCi >= DATA.length);
  const title = $derived(isCourseDone ? 'コース修了！' : 'クリア！');
  const body = $derived(
    isCourseDone
      ? '5つのレッスンを全部やりきりました。次は自分のコードに型をつけにいきましょう。'
      : `${game.ch.title} をクリアしました。この調子でつぎへ。`
  );
  const btnLabel = $derived(isCourseDone ? '学習マップへ' : 'つぎのレッスンへ');
</script>

<div class="overlay" style="background:{overlayBg}">
  <div class="rings">
    <div class="ring ring2"></div>
    <div class="ring ring1"></div>
    <div class="check">✓</div>
  </div>
  <div class="title">{title}</div>
  <div class="body">{body}</div>
  <div class="xp">
    <div class="xp-text mono">+120 XP</div>
  </div>
  <button class="next" onclick={() => game.celebrateNext()}>{btnLabel}</button>
  <button class="stay" onclick={() => game.stayCelebrating()}>コードを見なおす</button>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    backdrop-filter: blur(6px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    z-index: 5;
    animation: ttPop 0.25s ease both;
    text-align: center;
  }
  .rings {
    position: relative;
    width: 118px;
    height: 118px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ring {
    position: absolute;
    inset: 0;
    border-radius: 99px;
    border: 2px solid var(--ac2);
    animation: ttRing 1.4s ease-out infinite;
  }
  .ring1 {
    border-color: var(--ac);
    animation-delay: 0.45s;
  }
  .check {
    width: 96px;
    height: 96px;
    border-radius: 99px;
    background: var(--ac2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    color: var(--ac2Fg);
    animation: ttBurst 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) both;
  }
  .title {
    margin-top: 26px;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: 0.01em;
  }
  .body {
    margin-top: 10px;
    font-size: 13.5px;
    line-height: 1.9;
    color: var(--mu);
    text-wrap: pretty;
  }
  .xp {
    margin-top: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--okBd);
    background: var(--okBg);
    border-radius: 99px;
    padding: 8px 16px;
  }
  .xp-text {
    font-size: 13px;
    font-weight: 700;
    color: var(--okFg);
  }
  .next {
    margin-top: 26px;
    min-width: 230px;
    min-height: 54px;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    font-size: 15px;
    font-weight: 700;
    color: var(--ac2Fg);
    background: var(--ac2);
  }
  .stay {
    margin-top: 6px;
    background: transparent;
    border: none;
    color: var(--mu);
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
    padding: 10px;
  }
</style>
