<script lang="ts">
  import { game } from '../gameState.svelte';
  import ExerciseLine from './ExerciseLine.svelte';

  const ex = $derived(game.ex);
  const cur = $derived(game.cur());
  const allDone = $derived(cur === undefined);

  const beforeIdx = $derived(ex.lines.map((_, i) => i).filter((i) => cur === undefined || i < cur));
  const afterIdx = $derived(ex.lines.map((_, i) => i).filter((i) => cur !== undefined && i > cur));

  const palette = $derived.by(() => {
    const tokens: string[] = [];
    ex.lines.forEach((l) => l.t.forEach((t) => tokens.push(t)));
    ex.pool.forEach((t) => tokens.push(t));
    const uniq = Array.from(new Set(tokens));
    uniq.sort((a, b) => a.length - b.length || a.localeCompare(b));
    return uniq;
  });

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
    <div class="goal-text">{ex.goal}</div>
  </div>

  <div class="body">
    {#if game.variant === 'A'}
      <div class="editor">
        <div class="editor-head">
          <div class="dot"></div>
          <div class="file mono">{ex.file}</div>
        </div>
        <div class="editor-lines">
          {#each ex.lines as _, i}
            <div class="code-row" class:current={cur === i}>
              <div class="lineno mono">{i + 1}</div>
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

    {#if game.hint}
      <div class="hint-panel">
        <div class="hint-label">ヒント</div>
        <div class="hint-text">{ex.hint}</div>
      </div>
    {/if}
  </div>

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
    align-items: center;
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
  }
  .lineno {
    width: 14px;
    flex: 0 0 auto;
    text-align: right;
    font-size: 10.5px;
    color: var(--cPn);
    user-select: none;
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
  .output {
    margin-top: 12px;
    border-radius: 18px;
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
