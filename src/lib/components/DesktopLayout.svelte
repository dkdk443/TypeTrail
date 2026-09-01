<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { DATA } from '../data';
  import { game } from '../gameState.svelte';
  import RichText from './RichText.svelte';
  import CodeTokens from './CodeTokens.svelte';
  import ExerciseLine from './ExerciseLine.svelte';
  import CelebrateOverlay from './CelebrateOverlay.svelte';

  const doneCount = $derived(Object.keys(game.done).length);
  const pct = $derived(Math.round((doneCount / DATA.length) * 100));
  const barPct = $derived(Math.max(pct, 3));

  const chapters = $derived(
    DATA.map((c, i) => {
      const isDone = !!game.done[i];
      const active = i === game.ci;
      const state = isDone ? 'クリア済み' : active ? '学習中' : '未着手';
      return { c, i, isDone, active, state };
    })
  );

  const slides = $derived(game.ch.slides);
  const sd = $derived(slides[game.sl] || slides[0]);
  const lastSlide = $derived(game.sl === slides.length - 1);

  const ex = $derived(game.ex);
  const cur = $derived(game.cur());
  const allDone = $derived(cur === undefined);
  const palette = $derived(game.paletteTokens());

  const feedbackText = $derived(
    game.status === 'ng'
      ? 'おしい！ ⌫ で消してやり直そう'
      : allDone
        ? 'ぜんぶ揃いました'
        : game.status === 'ok'
          ? 'いいね、その調子'
          : ''
  );

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      game.backspace();
      return;
    }
    const n = parseInt(e.key, 10);
    if (!n) return;
    const t = palette[n - 1];
    if (t) game.tap(t);
  }

  onMount(() => window.addEventListener('keydown', onKeydown));
  onDestroy(() => window.removeEventListener('keydown', onKeydown));
</script>

<div class="frame">
  <div class="top">
    <div class="brand">
      <div class="badge mono">TT</div>
      <div class="name">TypeTrail</div>
      <div class="pill">JS → TS</div>
    </div>
    <div class="progress">
      <div class="progress-label">学習の進み</div>
      <div class="bar"><div class="fill" style="width:{barPct}%"></div></div>
      <div class="pct mono">{pct}%</div>
    </div>
    <div class="streak">
      <div class="dot"></div>
      <div>3日れんぞく</div>
    </div>
  </div>

  <div class="grid">
    <div class="sidebar">
      <div class="sidebar-label">コース内容</div>
      <div class="rail">
        {#each chapters as { c, i, isDone, active, state }}
          <button class="rail-item" class:active onclick={() => game.openChapter(i)}>
            <div class="rail-badge" class:done={isDone}>{c.num}</div>
            <div class="rail-body">
              <div class="rail-title">{c.title}</div>
              <div class="rail-state" class:done={isDone} class:active>{state}</div>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <div class="slide-pane">
      <div class="slide-top">
        <div class="kicker mono">{sd.kicker}</div>
        <div class="spacer"></div>
        <div class="dots">
          {#each slides as _, i}
            <div class="dot" class:on={i === game.sl}></div>
          {/each}
        </div>
      </div>
      <h2>{sd.heading}</h2>
      <div class="paras">
        {#each sd.body as p}
          <p><RichText text={p} /></p>
        {/each}
      </div>
      {#if sd.code}
        <div class="code">
          {#each sd.code as line}
            <div class="row"><CodeTokens text={line} /></div>
          {/each}
        </div>
      {/if}
      <div class="note">
        <div class="note-text"><RichText text={sd.note} /></div>
      </div>
      <div class="slide-grow"></div>
      <div class="slide-actions">
        {#if game.sl > 0}
          <button class="prev" onclick={() => game.prevSlide()}>前へ</button>
        {/if}
        <button class="next" disabled={lastSlide} onclick={() => game.advanceSlide()}>
          {lastSlide ? '解説はここまで' : 'つぎの解説へ'}
        </button>
        <div class="spacer"></div>
        <button class="hint-toggle" onclick={() => game.toggleHint()}>{game.hint ? 'ヒントを閉じる' : 'ヒント'}</button>
      </div>
      {#if game.hint}
        <div class="hint-panel">
          <div class="hint-label">ヒント</div>
          <div class="hint-text">{ex.hint}</div>
        </div>
      {/if}
    </div>

    <div class="code-pane">
      <div class="code-top">
        <div class="file mono">{ex.file}</div>
        <div class="spacer"></div>
        <div class="feedback" class:bad={game.status === 'ng'}>{feedbackText}</div>
      </div>

      <div class="goal">
        <div class="goal-dot"></div>
        <div class="goal-text">{ex.goal}</div>
      </div>

      <div class="code-body">
        <div class="code-lines">
          {#each ex.lines as _, i}
            <div class="code-row" class:current={cur === i}>
              <div class="lineno mono">{i + 1}</div>
              <ExerciseLine chips={game.lineChips(i)} />
            </div>
          {/each}
        </div>
        {#if allDone}
          <div class="output">
            <div class="output-label">じっこうけっか</div>
            <div class="output-lines">
              {#each ex.out as line}
                <div class="output-line mono">{line}</div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="palette-panel">
        <div class="palette-top">
          <div class="palette-label">パレット</div>
          <div class="palette-hint">クリック、または数字キーで選択</div>
        </div>
        <div class="palette">
          {#each palette as t, i}
            <button onclick={() => game.tap(t)}>
              {#if i < 9}<span class="key">{i + 1}</span>{/if}
              <span class="mono">{t}</span>
            </button>
          {/each}
        </div>
        <div class="actions">
          <button class="ghost" onclick={() => game.backspace()}>⌫ もどす</button>
          <div class="spacer"></div>
          <button class="reveal" onclick={() => game.reveal()}>答えを見る</button>
        </div>
      </div>
    </div>
  </div>

  {#if game.celebrating}
    <CelebrateOverlay />
  {/if}
</div>

<style>
  .frame {
    width: 100%;
    max-width: 1320px;
    height: 840px;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    background: var(--sf);
    box-shadow:
      0 40px 80px -24px oklch(0.05 0.05 266 / 0.45),
      0 0 0 1px var(--bd);
    display: flex;
    flex-direction: column;
    color: var(--fg);
  }

  .top {
    flex: 0 0 auto;
    height: 62px;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 24px;
    border-bottom: 1px solid var(--bd);
    background: var(--sf);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .badge {
    width: 26px;
    height: 26px;
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
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 0.03em;
  }
  .pill {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 99px;
    background: var(--card2);
    color: var(--mu);
  }
  .progress {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 340px;
    margin: 0 auto;
  }
  .progress-label {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--mu);
    white-space: nowrap;
  }
  .bar {
    flex: 1;
    height: 7px;
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
    width: 38px;
    text-align: right;
    color: var(--ac2);
  }
  .streak {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--bd);
    border-radius: 99px;
    padding: 6px 13px;
    font-size: 11.5px;
    font-weight: 700;
  }
  .streak .dot {
    width: 6px;
    height: 6px;
    border-radius: 99px;
    background: var(--ac2);
  }

  .grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr) minmax(0, 1.05fr);
  }

  .sidebar {
    border-right: 1px solid var(--bd);
    background: var(--card);
    overflow-y: auto;
    padding: 20px 14px;
  }
  .sidebar-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--mu);
    padding: 0 8px 12px;
  }
  .rail {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .rail-item {
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    text-align: left;
    padding: 11px;
    border-radius: 12px;
    cursor: pointer;
    color: inherit;
    background: transparent;
    border: 1px solid transparent;
  }
  .rail-item.active {
    background: var(--card2);
    border-color: var(--bd);
  }
  .rail-badge {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    background: var(--card2);
    color: var(--ac);
  }
  .rail-badge.done {
    background: var(--ac2);
    color: var(--ac2Fg);
  }
  .rail-body {
    flex: 1;
    min-width: 0;
  }
  .rail-title {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
  }
  .rail-state {
    margin-top: 3px;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--mu);
  }
  .rail-state.active { color: var(--ac); }
  .rail-state.done { color: var(--ac2); }

  .slide-pane {
    border-right: 1px solid var(--bd);
    overflow-y: auto;
    padding: 28px 30px 34px;
    display: flex;
    flex-direction: column;
  }
  .slide-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .kicker {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--ac);
  }
  .dots {
    display: flex;
    gap: 5px;
  }
  .dots .dot {
    width: 6px;
    height: 6px;
    border-radius: 99px;
    transition: width 0.25s ease;
    background: var(--card2);
  }
  .dots .dot.on {
    width: 18px;
    background: var(--ac);
  }
  h2 {
    margin: 14px 0 0;
    font-size: 26px;
    font-weight: 900;
    line-height: 1.45;
    text-wrap: pretty;
  }
  .paras {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .paras p {
    margin: 0;
    font-size: 14.5px;
    line-height: 2.05;
    color: var(--fg);
    text-wrap: pretty;
  }
  .code {
    margin-top: 22px;
    background: var(--code);
    border: 1px solid var(--codeBd);
    border-radius: 14px;
    padding: 18px;
    overflow-x: auto;
  }
  .code .row {
    display: flex;
    align-items: center;
    min-height: 25px;
    font-size: 12.5px;
  }
  .note {
    margin-top: 22px;
    display: flex;
    gap: 11px;
    align-items: flex-start;
    background: var(--card2);
    border-left: 3px solid var(--ac2);
    border-radius: 0 12px 12px 0;
    padding: 15px 16px;
  }
  .note-text {
    font-size: 12.5px;
    line-height: 1.95;
    color: var(--fg);
  }
  .slide-grow {
    flex: 1;
    min-height: 24px;
  }
  .slide-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 24px;
  }
  .prev,
  .next {
    min-height: 44px;
    padding: 0 18px;
    border-radius: 12px;
    border: 1px solid var(--bd);
    background: var(--card);
    color: var(--fg);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }
  .next {
    border: none;
    background: var(--ac);
    color: var(--acFg);
    padding: 0 22px;
  }
  .next:disabled {
    cursor: default;
    opacity: 0.45;
  }
  .hint-toggle {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 12px;
    border: 1px solid var(--bd);
    background: transparent;
    color: var(--mu);
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }
  .hint-panel {
    margin-top: 14px;
    border-radius: 14px;
    background: var(--card2);
    border-left: 3px solid var(--ac);
    padding: 14px 16px;
    animation: ttRise 0.25s ease both;
  }
  .hint-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--ac);
  }
  .hint-text {
    margin-top: 7px;
    font-size: 12.5px;
    line-height: 1.9;
    color: var(--fg);
  }

  .code-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--code);
  }
  .code-top {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 18px;
    height: 44px;
    border-bottom: 1px solid var(--codeBd);
  }
  .file {
    font-size: 11.5px;
    color: var(--cFg);
    background: var(--codeRow);
    padding: 7px 14px;
    border-radius: 8px;
  }
  .feedback {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--ac2);
  }
  .feedback.bad {
    color: var(--bad);
  }
  .goal {
    flex: 0 0 auto;
    margin: 14px 18px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--codeRow);
    border-radius: 12px;
    padding: 11px 14px;
  }
  .goal-dot {
    width: 7px;
    height: 7px;
    border-radius: 99px;
    background: var(--ac);
    flex: 0 0 auto;
  }
  .goal-text {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--cFg);
  }
  .code-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 18px 14px 20px;
  }
  .code-lines {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .code-row {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 27px;
    padding: 1px 5px;
    border-radius: 8px;
    font-size: 12.5px;
  }
  .code-row.current {
    background: var(--codeRow);
  }
  .lineno {
    width: 16px;
    flex: 0 0 auto;
    text-align: right;
    font-size: 11px;
    color: var(--cPn);
    user-select: none;
  }
  .output {
    margin-top: 18px;
    border-radius: 14px;
    background: var(--okBg);
    border: 1px solid var(--okBd);
    padding: 15px 16px;
    animation: ttRise 0.3s ease both;
  }
  .output-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--okFg);
  }
  .output-lines {
    margin-top: 9px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .output-line {
    font-size: 12px;
    line-height: 1.7;
    color: var(--okFg);
  }

  .palette-panel {
    flex: 0 0 auto;
    border-top: 1px solid var(--codeBd);
    background: var(--codeRow);
    padding: 14px 18px 18px;
  }
  .palette-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .palette-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--cPn);
  }
  .palette-hint {
    font-size: 11px;
    color: var(--cPn);
  }
  .palette {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .palette button {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 500;
    min-height: 38px;
    padding: 0 12px;
    border-radius: 10px;
    cursor: pointer;
    color: var(--cFg);
    background: var(--code);
    border: 1px solid var(--codeBd);
    transition: transform 0.1s ease, border-color 0.1s ease;
  }
  .palette button:hover {
    border-color: var(--ac);
  }
  .palette button:active {
    transform: translateY(1px);
  }
  .palette .key {
    font-size: 9.5px;
    font-weight: 700;
    color: var(--cPn);
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 13px;
  }
  .ghost {
    min-height: 40px;
    padding: 0 16px;
    border-radius: 10px;
    border: 1px solid var(--codeBd);
    background: var(--code);
    color: var(--cFg);
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }
  .reveal {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--cPn);
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }
  .spacer {
    flex: 1;
  }
</style>
