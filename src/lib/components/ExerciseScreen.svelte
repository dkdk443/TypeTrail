<script lang="ts">
  import { game } from '../gameState.svelte';
  import ExerciseLine from './ExerciseLine.svelte';

  const ex = $derived(game.ex);
  const cur = $derived(game.cur());
  const allDone = $derived(cur === undefined);
  const readyForNextStep = $derived(allDone && !game.isLastStep());
  // Last step solved, chapter cleared, overlay dismissed ("コードを見なおす").
  const reviewing = $derived(
    allDone && game.isLastStep() && !!game.done[game.trail][game.ci] && !game.celebrating
  );
  const nextChapter = $derived(game.chapters[game.ci + 1]);

  // ex.out[0] is always the "✓ ..." verdict line; the rest are result lines.
  const passTitle = $derived(ex.out[0]?.replace(/^✓\s*/, '') ?? '');
  const passLines = $derived(ex.out.slice(1));

  let body: HTMLDivElement | undefined = $state();
  $effect(() => {
    cur; // track: re-run whenever the current line changes
    body?.querySelector('.current')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  const beforeIdx = $derived(ex.lines.map((_, i) => i).filter((i) => cur === undefined || i < cur));
  const afterIdx = $derived(ex.lines.map((_, i) => i).filter((i) => cur !== undefined && i > cur));

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
</script>

<div class="wrap">
  <div class="top">
    <button class="back" onclick={() => game.toMap()}>‹</button>
    <div class="title-wrap">
      <div class="kicker">つくる</div>
      <div class="title">{game.ch.title}</div>
    </div>
    <div class="tabs">
      <button class:on={game.variant === 'A'} onclick={() => game.setVariant('A')}>エディタ</button>
      <button class:on={game.variant === 'B'} onclick={() => game.setVariant('B')}>1行集中</button>
    </div>
  </div>

  <div class="goal">
    <div class="goal-dot"></div>
    <div class="goal-body">
      <div class="goal-text">{ex.goal}</div>
      <ul class="todo">
        {#each ex.todo as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="body" bind:this={body}>
    {#if game.variant === 'A'}
      <div class="editor">
        <div class="editor-head">
          <div class="dot"></div>
          <div class="file mono">{ex.file}</div>
        </div>
        <div class="editor-lines">
          {#each ex.lines as _, i}
            <div class="code-row" class:current={cur === i}>
              <div class="lineno mono">{cur === i ? '▸' : i + 1}</div>
              <ExerciseLine chips={game.lineChips(i)} />
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="focus-mode">
        {#each beforeIdx as i}
          <div class="mini" class:dim={!game.isLocked(i) && ex.lines[i].t.length > 0}>
            <ExerciseLine chips={game.lineChips(i)} />
          </div>
        {/each}
        {#if cur !== undefined}
          <div class="focus-card">
            <div class="focus-label">いまつくる行</div>
            <div class="focus-line"><ExerciseLine chips={game.lineChips(cur)} /></div>
          </div>
        {/if}
        {#each afterIdx as i}
          <div class="mini" class:dim={!game.isLocked(i) && ex.lines[i].t.length > 0}>
            <ExerciseLine chips={game.lineChips(i)} />
          </div>
        {/each}
      </div>
    {/if}

    {#if game.hint}
      <div class="hint-panel">
        <div class="hint-label">ヒント</div>
        <div class="hint-text">{ex.hint}</div>
      </div>
    {/if}
  </div>

  {#if reviewing}
    <div class="band review">
      <div class="band-head">
        <div class="band-mark review-mark">✓</div>
        <div class="band-body">
          <div class="band-title">この章はクリア済み</div>
          <div class="band-sub">
            {nextChapter ? `つぎ：${nextChapter.num} ${nextChapter.title}` : 'すべてのチャプターをクリアしました'}
          </div>
        </div>
      </div>
      {#if nextChapter}
        <button class="band-go review-go" onclick={() => game.celebrateNext()}>つぎのレッスンへ →</button>
      {:else}
        <button class="band-go review-go" onclick={() => game.toTop()}>トップページへ</button>
      {/if}
      <div class="band-links">
        {#if game.sl > 0}
          <button onclick={() => game.prevStep()}>‹ 前のステップ</button>
        {:else}
          <span></span>
        {/if}
        <button class="replay" onclick={() => game.replayCelebration()}>結果をもう一度</button>
      </div>
    </div>
  {:else if allDone}
    <div class="band pass">
      <div class="band-head">
        <div class="band-mark">✓</div>
        <div class="band-body">
          <div class="band-title">{passTitle}</div>
          {#each passLines as line}
            <div class="band-out mono">{line}</div>
          {/each}
        </div>
      </div>
      {#if readyForNextStep}
        <button class="band-go" onclick={() => game.nextStep()}>次のステップへ</button>
      {/if}
    </div>
  {:else}
    <div class="footer">
      <div class="footer-top">
        <div class="palette-label">パレット</div>
        <div class="feedback" class:bad={game.status === 'ng'}>{feedbackText}</div>
      </div>
      <div class="palette">
        {#each palette as t}
          <button class="mono" onclick={() => game.tap(t)}>{t}</button>
        {/each}
      </div>
      <div class="actions">
        <button class="ghost" onclick={() => game.backspace()}>⌫</button>
        <button class="ghost wide" onclick={() => game.toggleHint()}>{game.hint ? 'ヒントを閉じる' : 'ヒント'}</button>
        <div class="spacer"></div>
        <button class="reveal" onclick={() => game.reveal()}>答えを見る</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .top {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 32px 16px 12px;
  }
  .back {
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    border-radius: 13px;
    border: 1px solid var(--bd);
    background: var(--card);
    font-size: 18px;
    cursor: pointer;
    color: var(--fg);
    line-height: 1;
  }
  .title-wrap {
    flex: 1;
    min-width: 0;
  }
  .kicker {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--ac2);
  }
  .title {
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }
  .tabs {
    display: flex;
    background: var(--card);
    border: 1px solid var(--bd);
    border-radius: 11px;
    padding: 3px;
    gap: 3px;
    flex: 0 0 auto;
  }
  .tabs button {
    min-height: 34px;
    padding: 0 12px;
    border-radius: 9px;
    border: none;
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 700;
    background: transparent;
    color: var(--mu);
  }
  .tabs button.on {
    background: var(--ac);
    color: var(--acFg);
  }
  .goal {
    margin: 0 16px 10px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: var(--card);
    border: 1px solid var(--bd);
    border-radius: 14px;
    padding: 11px 14px;
  }
  .goal-dot {
    width: 7px;
    height: 7px;
    border-radius: 99px;
    background: var(--ac);
    flex: 0 0 auto;
    margin-top: 7px;
  }
  .goal-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  /* ex.todo: the plain-language requirements, so the blanks make sense without the slide. */
  .todo {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .todo li {
    position: relative;
    padding-left: 13px;
    font-size: 11.5px;
    line-height: 1.6;
    color: var(--mu);
  }
  .todo li::before {
    content: '';
    position: absolute;
    left: 1px;
    top: 0.65em;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    border: 1px solid var(--ac);
  }
  .goal-text {
    font-size: 12.5px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--fg);
  }
  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 4px 16px 14px;
  }
  .editor {
    background: var(--code);
    border: 1px solid var(--codeBd);
    border-radius: 20px;
    overflow: hidden;
    animation: ttPop 0.22s ease both;
  }
  .editor-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 15px;
    border-bottom: 1px solid var(--codeBd);
  }
  .editor-head .dot {
    width: 7px;
    height: 7px;
    border-radius: 99px;
    background: var(--ac);
  }
  .editor-head .file {
    font-size: 11px;
    color: var(--cPn);
  }
  .editor-lines {
    padding: 14px 10px 18px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-x: auto;
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
    box-shadow: inset 2px 0 0 var(--ac);
  }
  .lineno {
    width: 14px;
    flex: 0 0 auto;
    text-align: right;
    font-size: 10.5px;
    color: var(--cPn);
    user-select: none;
  }
  .code-row.current .lineno {
    color: var(--ac);
    font-weight: 700;
  }
  .focus-mode {
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: ttPop 0.22s ease both;
  }
  .mini {
    display: flex;
    align-items: center;
    padding: 9px 13px;
    border-radius: 12px;
    background: var(--code);
    border: 1px solid var(--codeBd);
    font-size: 12px;
    opacity: 1;
  }
  .mini.dim {
    opacity: 0.62;
  }
  .focus-card {
    padding: 16px 16px 18px;
    border-radius: 18px;
    background: var(--code);
    border: 1px solid var(--ac);
  }
  .focus-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--ac2);
  }
  .focus-line {
    margin-top: 12px;
    min-height: 32px;
    font-size: 15px;
  }
  .hint-panel {
    margin-top: 12px;
    border-radius: 16px;
    background: var(--card2);
    border-left: 3px solid var(--ac);
    padding: 14px 15px;
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
  /* Post-solve band that replaces the palette — mirrors DesktopLayout's .pass / .review. */
  .band {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px 16px 24px;
    animation: ttRise 0.3s ease both;
  }
  .band.pass {
    background: var(--okBg);
    border-top: 2px solid var(--okBd);
  }
  .band.review {
    background: color-mix(in oklch, var(--ac) 22%, var(--code));
    border-top: 2px solid var(--ac);
  }
  .band-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .band-mark {
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
  .band-mark.review-mark {
    background: var(--ac);
    color: var(--acFg);
  }
  .band-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .band-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--okFg);
  }
  .band.review .band-title {
    color: var(--cFg);
  }
  .band-out {
    font-size: 12.5px;
    font-weight: 500;
    line-height: 1.6;
    color: var(--okFg);
    opacity: 0.85;
    overflow-wrap: anywhere;
  }
  .band-sub {
    font-size: 12.5px;
    color: var(--cKw);
  }
  .band-go {
    min-height: 52px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 900;
    color: var(--ac2Fg);
    background: var(--ac2);
  }
  .band-go.review-go {
    color: var(--acFg);
    background: var(--ac);
  }
  .band-links {
    display: flex;
    justify-content: space-between;
  }
  .band-links button {
    padding: 4px 0;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    color: var(--cFg);
    opacity: 0.8;
  }
  .band-links .replay {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .footer {
    flex: 0 0 auto;
    border-top: 1px solid var(--bd);
    background: var(--card2);
    padding: 13px 16px 22px;
  }
  .footer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .palette-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--mu);
  }
  .feedback {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--ac2);
  }
  .feedback.bad {
    color: var(--bad);
  }
  .palette {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .palette button {
    font-size: 14px;
    font-weight: 500;
    min-height: 44px;
    padding: 0 15px;
    border-radius: 12px;
    cursor: pointer;
    color: var(--fg);
    background: var(--sf);
    border: 1px solid var(--bd);
    transition: transform 0.1s ease;
  }
  .palette button:active {
    transform: translateY(1px);
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
  }
  .ghost {
    min-width: 56px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid var(--bd);
    background: var(--sf);
    color: var(--fg);
    font-size: 16px;
    cursor: pointer;
  }
  .ghost.wide {
    min-width: 0;
    padding: 0 15px;
    background: transparent;
    font-size: 12.5px;
    font-weight: 700;
  }
  .ghost:active {
    transform: translateY(1px);
  }
  .spacer {
    flex: 1;
  }
  .reveal {
    height: 44px;
    padding: 0 15px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: var(--mu);
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }
</style>
