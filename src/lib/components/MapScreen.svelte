<script lang="ts">
  import { game } from "../gameState.svelte";
  import { TRAILS, TRAIL_KEYS } from "../trails";

  const trail = $derived(TRAILS[game.trail]);
  const totalCh = $derived(game.chapters.length);
  const done = $derived(game.done[game.trail]);
  const doneCount = $derived(Object.keys(done).length);
  const pct = $derived(Math.round((doneCount / totalCh) * 100));
  const barPct = $derived(Math.max(pct, 3));

  const chapters = $derived(
    game.chapters.map((c, i) => {
      const isDone = !!done[i];
      const active = i === 0 || !!done[i - 1] || isDone;
      const state = isDone
        ? "クリア済み"
        : active
          ? "はじめる"
          : "この前をクリアすると開きます";
      return { c, i, isDone, active, state };
    }),
  );
</script>

<div class="wrap">
  <div class="top">
    <div class="brand">
      <div class="badge mono">{trail.badge}</div>
      <div class="name">{trail.label}</div>
    </div>
    <div class="switcher">
      {#each TRAIL_KEYS as key}
        <button class:on={game.trail === key} onclick={() => game.setTrail(key)}
          >{TRAILS[key].label}</button
        >
      {/each}
    </div>
  </div>

  {#if game.trail === "ts"}
    <h1>型をつけにいこう</h1>
    <p class="sub">
      むずかしい記法は全部パレットにあります。指でタップして、1行ずつ組み立てるだけ。
    </p>
  {:else}
    <h1>型のまえに、<br />JS を体にしみこませよう</h1>
    <p class="sub">
      配列メソッドや非同期処理など、TypeScript の土台になる JS
      の書き方をおさらいします。
    </p>
  {/if}

  <div class="progress">
    <div class="bar"><div class="fill" style="width:{barPct}%"></div></div>
    <div class="pct mono">{pct}%</div>
  </div>

  <div class="list">
    {#each chapters as { c, i, isDone, active, state }}
      <button
        class="chapter"
        class:done={isDone}
        class:active
        disabled={!active}
        onclick={() => game.openChapter(i)}
      >
        <div class="num mono" class:done={isDone}>{c.num}</div>
        <div class="body">
          <div class="title">{c.title}</div>
          <div class="sub2">{c.sub}</div>
          <div class="state" class:done={isDone} class:active>{state}</div>
        </div>
        <div class="chev">›</div>
      </button>
    {/each}
  </div>
</div>

<style>
  .wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .top {
    padding: 36px 22px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .badge {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    background: var(--ac);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--acFg);
  }
  .name {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .switcher {
    display: flex;
    gap: 3px;
    border: 1px solid var(--bd);
    border-radius: 99px;
    padding: 3px;
    background: var(--card);
  }
  .switcher button {
    border: none;
    background: transparent;
    border-radius: 99px;
    padding: 6px 12px;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--mu);
    cursor: pointer;
  }
  .switcher button.on {
    background: var(--ac);
    color: var(--acFg);
  }
  h1 {
    margin: 20px 22px 0;
    font-size: 28px;
    font-weight: 900;
    line-height: 1.35;
    letter-spacing: 0.01em;
  }
  .sub {
    margin: 10px 22px 0;
    font-size: 13px;
    line-height: 1.85;
    color: var(--mu);
  }
  .progress {
    margin: 18px 22px 0;
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .bar {
    flex: 1;
    height: 8px;
    border-radius: 99px;
    background: var(--card2);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.5s ease;
    background: linear-gradient(90deg, var(--ac), var(--ac2));
  }
  .pct {
    font-size: 12px;
    font-weight: 700;
    color: var(--ac2);
  }
  .list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px 18px 32px;
    display: flex;
    flex-direction: column;
    gap: 11px;
  }
  .chapter {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    text-align: left;
    padding: 16px 15px;
    border-radius: 20px;
    cursor: pointer;
    color: inherit;
    background: var(--card);
    border: 1px solid var(--card2);
    opacity: 0.55;
  }
  .chapter.active {
    border-color: var(--bd);
    opacity: 1;
  }
  .chapter.done {
    border-color: var(--okBd);
    opacity: 1;
  }
  .chapter:disabled {
    cursor: default;
  }
  .num {
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    background: var(--card2);
    color: var(--ac);
  }
  .num.done {
    background: var(--ac2);
    color: var(--ac2Fg);
  }
  .body {
    flex: 1;
    min-width: 0;
    text-align: left;
  }
  .title {
    font-size: 15.5px;
    font-weight: 700;
    line-height: 1.4;
  }
  .sub2 {
    font-size: 11.5px;
    color: var(--mu);
    margin-top: 4px;
    line-height: 1.6;
  }
  .state {
    margin-top: 9px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--mu);
  }
  .state.active {
    color: var(--ac);
  }
  .state.done {
    color: var(--ac2);
  }
  .chev {
    font-size: 19px;
    color: var(--mu);
    line-height: 1;
  }
</style>
