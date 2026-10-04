<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { game } from '../gameState.svelte';
  import { TRAILS, TRAIL_KEYS } from '../trails';
  import RichText from './RichText.svelte';
  import CodeTokens from './CodeTokens.svelte';
  import ExerciseLine from './ExerciseLine.svelte';
  import CelebrateOverlay from './CelebrateOverlay.svelte';

  const trail = $derived(TRAILS[game.trail]);
  const done = $derived(game.done[game.trail]);
  const doneCount = $derived(Object.keys(done).length);
  const pct = $derived(Math.round((doneCount / game.chapters.length) * 100));
  const barPct = $derived(Math.max(pct, 3));

  const chapters = $derived(
    game.chapters.map((c, i) => {
      const isDone = !!done[i];
      const active = i === game.ci;
      const state = isDone ? 'クリア済み' : active ? '学習中' : '未着手';
      return { c, i, isDone, active, state };
    })
  );

  const steps = $derived(game.ch.steps);
  const sd = $derived(game.step);

  const ex = $derived(game.ex);
  const cur = $derived(game.cur());

  let codeBody: HTMLDivElement | undefined = $state();
  $effect(() => {
    cur; // track: re-run whenever the current line changes
    codeBody?.querySelector('.current')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  const allDone = $derived(cur === undefined);
  const readyForNextStep = $derived(allDone && !game.isLastStep());
  const palette = $derived(game.paletteTokens());

  const fillIdx = $derived(game.buildIdx());
  const slotTotal = $derived(fillIdx.reduce((n, i) => n + ex.lines[i].t.length, 0));
  const slotFilled = $derived(
    fillIdx.reduce((n, i) => n + Math.min((game.built[i] || []).length, ex.lines[i].t.length), 0)
  );
  const fillPct = $derived(slotTotal ? (slotFilled / slotTotal) * 100 : 0);

  // ex.out[0] is always the "✓ ..." verdict line; the rest are result lines.
  const passTitle = $derived(ex.out[0]?.replace(/^✓\s*/, '') ?? '');
  const passLines = $derived(ex.out.slice(1));

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (readyForNextStep) {
        e.preventDefault();
        game.nextStep();
      }
      return;
    }
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
    <button class="brand" onclick={() => game.toTop()} title="トップページへ">
      <div class="badge mono">{trail.badge}</div>
      <div class="name">{trail.label}</div>
    </button>
    <div class="switcher">
      {#each TRAIL_KEYS as key}
        <button class:on={game.trail === key} onclick={() => game.setTrail(key)}>{TRAILS[key].label}</button>
      {/each}
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
          {#each steps as _, i}
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
        <div class="code-meta">
          <div class="file mono">{ex.file}</div>
          <div class="fill-count mono">{slotFilled} / {slotTotal} 埋めた</div>
        </div>
        <div class="goal-text">{ex.goal}</div>
        <div class="fill-bar"><div class="fill-bar-in" style="width:{fillPct}%"></div></div>
      </div>

      <div class="code-body" bind:this={codeBody}>
        <div class="code-lines">
          {#each ex.lines as _, i}
            <div class="code-row" class:current={cur === i}>
              <div class="lineno mono">{cur === i ? '▸' : i + 1}</div>
              <ExerciseLine chips={game.lineChips(i)} />
            </div>
          {/each}
        </div>
      </div>

      {#if game.status === 'ng'}
        <div class="wrong">型がちがうようです。「もどす」で直してみよう。</div>
      {/if}

      {#if allDone}
        <div class="pass">
          <div class="pass-head">
            <div class="pass-mark">✓</div>
            <div class="pass-body">
              <div class="pass-title">{passTitle}</div>
              {#each passLines as line}
                <div class="pass-out mono">{line}</div>
              {/each}
            </div>
          </div>
          {#if readyForNextStep}
            <button class="next-step" onclick={() => game.nextStep()}>
              次のステップへ <span class="enter mono">Enter</span>
            </button>
          {/if}
        </div>
      {:else}
        <div class="palette-panel">
          <div class="palette-top">
            <div class="palette-label">パレット</div>
            <div class="palette-hint">クリック または 数字キー</div>
          </div>
          <div class="palette">
            {#each palette as t, i}
              <button onclick={() => game.tap(t)}>
                {#if i < 9}<span class="key mono">{i + 1}</span>{/if}
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
      {/if}
    </div>
  </div>

  {#if game.celebrating}
    <CelebrateOverlay />
  {/if}
</div>

<style>
  .frame {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    background: var(--sf);
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
    border: none;
    background: none;
    padding: 0;
    color: inherit;
    cursor: pointer;
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
  .switcher {
    display: flex;
    gap: 3px;
    border: 1px solid var(--bd);
    border-radius: 99px;
    padding: 3px;
    background: var(--card2);
  }
  .switcher button {
    border: none;
    background: transparent;
    border-radius: 99px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    color: var(--mu);
    cursor: pointer;
  }
  .switcher button.on {
    background: var(--ac);
    color: var(--acFg);
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
    flex-direction: column;
    gap: 10px;
    padding: 18px 24px;
    border-bottom: 1px solid var(--codeBd);
  }
  .code-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .file {
    font-size: 13px;
    font-weight: 500;
    color: var(--cPn);
  }
  .fill-count {
    font-size: 12px;
    font-weight: 500;
    color: var(--cPn);
  }
  .goal-text {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.5;
    color: var(--cFg);
    text-wrap: pretty;
  }
  .fill-bar {
    height: 4px;
    border-radius: 2px;
    background: var(--codeBd);
    overflow: hidden;
  }
  .fill-bar-in {
    height: 100%;
    background: var(--ac2);
    transition: width 0.3s ease;
  }
  .code-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 24px 18px;
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
    min-height: 34px;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 15px;
  }
  .code-row.current {
    background: var(--codeRow);
    box-shadow: inset 2px 0 0 var(--ac);
  }
  .lineno {
    width: 18px;
    flex: 0 0 auto;
    text-align: right;
    font-size: 13px;
    color: var(--cPn);
    user-select: none;
  }
  .code-row.current .lineno {
    color: var(--ac);
    font-weight: 700;
    animation: ttNudge 1s ease-in-out infinite;
  }
  @keyframes ttNudge {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(2px); }
  }
  .wrong {
    flex: 0 0 auto;
    margin: 0 24px 16px;
    padding: 12px 14px;
    border-radius: 8px;
    background: var(--badBg);
    color: var(--badFg);
    font-size: 14px;
    animation: ttRise 0.2s ease both;
  }
  .pass {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px 24px 22px;
    background: var(--okBg);
    border-top: 2px solid var(--okBd);
    animation: ttRise 0.3s ease both;
  }
  .pass-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pass-mark {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--ac2);
    color: var(--ac2Fg);
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pass-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .pass-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--okFg);
  }
  .pass-out {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.6;
    color: var(--okFg);
    opacity: 0.85;
  }
  .next-step {
    min-height: 52px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 900;
    color: var(--ac2Fg);
    background: var(--ac2);
    transition: filter 0.15s ease;
  }
  .next-step:hover {
    filter: brightness(1.12);
  }
  .enter {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: color-mix(in oklch, var(--ac2Fg) 15%, transparent);
  }

  .palette-panel {
    flex: 0 0 auto;
    border-top: 1px solid var(--codeBd);
    background: var(--codeRow);
    padding: 16px 24px 20px;
  }
  .palette-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .palette-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--cFg);
  }
  .palette-hint {
    font-size: 12px;
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
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    min-height: 44px;
    padding: 0 14px 0 8px;
    border-radius: 8px;
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
    min-width: 20px;
    height: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--cPn);
    background: var(--codeRow);
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
    padding: 0 4px;
    border: none;
    background: transparent;
    color: var(--cPn);
    font-size: 13px;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 4px;
    cursor: pointer;
  }
  .reveal:hover {
    color: var(--cFg);
  }
  .spacer {
    flex: 1;
  }
</style>
