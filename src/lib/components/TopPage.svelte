<script lang="ts">
  import { game } from '../gameState.svelte';
  import { TRAILS } from '../trails';
  import { isUnlocked } from '../router';

  /** Desktop lets any chapter be opened directly; mobile keeps the progressive lock. */
  let { freeChapters = false }: { freeChapters?: boolean } = $props();

  const chapters = TRAILS.ts.chapters;
  const first = chapters[0];
  const last = chapters[chapters.length - 1];

  const STEPS = [
    { n: '01 読む', t: '短い説明を読む', d: '1ステップの説明は数行だけ。いま覚えることを一つに絞ります。' },
    { n: '02 はめる', t: '空欄に型をはめる', d: 'パレットから型を選んでコードを埋めます。数字キーでも選べます。' },
    { n: '03 通す', t: 'その場で型チェック', d: '埋めた瞬間に結果がわかります。まちがえたら、もどしてやり直し。' },
  ];

  // Self-contained try-it demo: `let userName ___ ___ = "ada";`
  const ANS = [':', 'string'];
  const CHOICES = [':', 'any', 'number', 'string', 'boolean'];
  let picks = $state<string[]>([]);
  const demoDone = $derived(picks.length === ANS.length && picks.every((v, i) => v === ANS[i]));
  const demoPct = $derived((picks.length / ANS.length) * 100);
  const pick = (t: string) => {
    if (picks.length < ANS.length) picks = [...picks, t];
  };
  const undo = () => (picks = picks.slice(0, -1));

  function openTsChapter(ci: number) {
    if (freeChapters || isUnlocked(ci, game.done.ts)) game.openChapter(ci, 'ts');
    else game.setTrail('ts');
  }

  let root: HTMLDivElement | undefined = $state();
  const scrollTo = (id: string) => root?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' });
</script>

<div class="top-page" bind:this={root}>
  <header>
    <div class="brand">
      <div class="badge mono">TT</div>
      <span>TypeTrail</span>
    </div>
    <nav>
      <button class="nav-link" onclick={() => scrollTo('course')}>コース</button>
      <button class="nav-link" onclick={() => scrollTo('how')}>しくみ</button>
      <button class="nav-start" onclick={() => game.setTrail('ts')}>はじめる</button>
    </nav>
  </header>

  <section class="hero">
    <div class="hero-copy">
      <div class="eyebrow mono">TypeScript を、手を動かして</div>
      <h1><span class="accent">型</span>を<br />つけにいこう</h1>
      <p class="lead">
        TypeTrail は、JavaScript を書ける人のための TypeScript 入門です。コードの空欄に型をはめて、その場で型チェックを通す。読むより先に手が覚えます。
      </p>
      <div class="ctas">
        <button class="cta-primary" onclick={() => game.openChapter(0, 'ts')}>
          {first.num} から歩きはじめる <span class="mono">→</span>
        </button>
        <button class="cta-secondary" onclick={() => game.setTrail('js')}>JS から復習する（JSTrail）</button>
      </div>
      <div class="note">登録なしで、ブラウザだけで始められます。</div>
    </div>

    <div class="demo">
      <div class="demo-head">
        <div class="demo-meta mono">
          <span>annotate.ts</span>
          <span>さわってみて</span>
        </div>
        <div class="demo-goal">変数に型注釈をつけよう</div>
        <div class="demo-bar"><div class="demo-bar-in" style="width:{demoPct}%"></div></div>
      </div>
      <div class="demo-code mono">
        <span class="demo-lineno">1</span>
        <div class="demo-line">
          <span class="tk-kw">let</span><span>userName</span>
          {#each ANS as answer, i}
            {@const v = picks[i]}
            <span
              class="demo-slot"
              class:wide={i > 0}
              class:active={!v && i === picks.length}
              class:ok={v && v === answer}
              class:bad={v && v !== answer}>{v ?? ''}</span>
          {/each}
          <span class="tk-pn">=</span><span class="tk-str">"ada"</span><span class="tk-pn">;</span>
        </div>
      </div>
      {#if demoDone}
        <div class="demo-pass">
          <div class="demo-pass-msg">
            <div class="demo-mark">✓</div>
            <div>型チェックを通過しました</div>
          </div>
          <button class="demo-again" onclick={() => (picks = [])}>もう一度</button>
        </div>
      {:else}
        <div class="demo-palette">
          <div class="demo-palette-top">
            <span class="demo-palette-label">パレット</span>
            <button class="demo-undo" onclick={undo}>⌫ もどす</button>
          </div>
          <div class="demo-chips">
            {#each CHOICES as t, i}
              <button class="demo-chip mono" onclick={() => pick(t)}>
                <span class="demo-key">{i + 1}</span>{t}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </section>

  <section id="how" class="how">
    <div class="inner">
      <h2>1ステップは、読む・はめる・通す</h2>
      <div class="steps">
        {#each STEPS as s}
          <div class="step">
            <div class="step-n mono">{s.n}</div>
            <div class="step-t">{s.t}</div>
            <div class="step-d">{s.d}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section id="course" class="course">
    <div class="inner">
      <div class="course-head">
        <h2>{chapters.length} のチャプターで歩くルート</h2>
        <span>{first.title}から、{last.title}まで</span>
      </div>
      <div class="chapters">
        {#each chapters as c, i}
          <button class="chapter" onclick={() => openTsChapter(i)}>
            <span class="chapter-n mono">{c.num}</span>
            <span class="chapter-t">{c.title}</span>
            {#if game.done.ts[i]}<span class="chapter-done">クリア済み</span>{/if}
          </button>
        {/each}
      </div>
    </div>
  </section>

  <section class="closing">
    <div class="inner closing-inner">
      <div class="closing-copy">
        <div class="closing-code mono">
          <span class="tk-kw">let</span> you<span class="closing-type">: Developer</span> = <span class="tk-str">"ready"</span>;
        </div>
        <div class="closing-title">さあ、型をつけにいこう</div>
      </div>
      <button class="cta-closing" onclick={() => game.openChapter(0, 'ts')}>
        {first.num} {first.title}へ <span class="mono">→</span>
      </button>
    </div>
  </section>

  <footer>
    <span class="footer-brand">TypeTrail</span>
    <div class="footer-links">
      <button onclick={() => scrollTo('course')}>コース</button>
      <button onclick={() => game.setTrail('js')}>JSTrail</button>
    </div>
  </footer>
</div>

<style>
  .top-page {
    --gutter: clamp(16px, 4vw, 48px);
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: var(--card);
    color: var(--fg);
  }
  button {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  .inner {
    max-width: 1240px;
    margin: 0 auto;
  }
  h2 {
    margin: 0;
    font-size: clamp(26px, 3.4vw, 36px);
    font-weight: 900;
    line-height: 1.4;
  }

  header {
    position: sticky;
    top: 0;
    z-index: 1;
    height: 68px;
    padding: 0 var(--gutter);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--sf);
    border-bottom: 1px solid var(--bd);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 19px;
    font-weight: 900;
  }
  .badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--ac);
    color: var(--acFg);
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  nav {
    display: flex;
    align-items: center;
    gap: clamp(12px, 2vw, 20px);
  }
  .nav-link {
    font-size: 14px;
    font-weight: 700;
    color: var(--mu);
  }
  .nav-link:hover {
    color: var(--ac);
  }
  .nav-start {
    height: 38px;
    padding: 0 16px;
    border-radius: 999px;
    background: var(--fg);
    color: var(--sf);
    font-size: 14px;
    font-weight: 700;
    transition: background 0.15s ease;
  }
  .nav-start:hover {
    background: var(--ac);
    color: var(--acFg);
  }

  .hero {
    max-width: calc(1240px + 2 * var(--gutter));
    margin: 0 auto;
    padding: clamp(40px, 8vw, 96px) var(--gutter);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr));
    gap: clamp(32px, 5vw, 64px);
    align-items: center;
  }
  .hero-copy {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .eyebrow {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--ac);
  }
  h1 {
    margin: 0;
    font-size: clamp(44px, 7vw, 80px);
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  .accent {
    color: var(--ac);
  }
  .lead {
    margin: 0;
    max-width: 30em;
    font-size: 17px;
    line-height: 1.9;
    color: var(--mu);
    text-wrap: pretty;
  }
  .ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  .cta-primary {
    height: 54px;
    padding: 0 28px;
    border-radius: 12px;
    background: var(--ac);
    color: var(--acFg);
    font-size: 16px;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: filter 0.15s ease;
  }
  .cta-primary:hover {
    filter: brightness(0.9);
  }
  .cta-secondary {
    height: 54px;
    padding: 0 22px;
    border-radius: 12px;
    border: 1px solid var(--bd);
    background: var(--sf);
    font-size: 15px;
    font-weight: 700;
    transition: border-color 0.15s ease;
  }
  .cta-secondary:hover {
    border-color: var(--ac);
  }
  .note {
    font-size: 13px;
    color: var(--mu);
  }

  .demo {
    min-height: 420px;
    min-width: 0;
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--code);
    color: var(--cFg);
    box-shadow: 0 24px 60px oklch(0.2 0.03 258 / 0.22);
  }
  .demo-head {
    padding: 16px 22px;
    border-bottom: 1px solid var(--codeBd);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .demo-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 500;
    color: var(--cPn);
  }
  .demo-goal {
    font-size: 16px;
    font-weight: 700;
  }
  .demo-bar {
    height: 4px;
    border-radius: 2px;
    background: var(--codeBd);
    overflow: hidden;
  }
  .demo-bar-in {
    height: 100%;
    background: var(--ac2);
    transition: width 0.3s ease;
  }
  .demo-code {
    flex: 1;
    padding: 26px 22px;
    display: flex;
    gap: 14px;
    font-size: clamp(14px, 3.8vw, 17px);
    font-weight: 500;
  }
  .demo-lineno {
    color: var(--cPn);
  }
  .demo-line {
    align-self: flex-start;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }
  .demo-slot {
    min-width: 22px;
    height: 26px;
    padding: 0 5px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1.5px dashed var(--slotBd);
  }
  .demo-slot.wide {
    min-width: 64px;
  }
  .demo-slot.active {
    border-color: var(--cKw);
    background: var(--codeRow);
  }
  .demo-slot.ok {
    border: 1.5px solid transparent;
    background: var(--okBg);
    color: var(--okFg);
  }
  .demo-slot.bad {
    border: 1.5px solid transparent;
    background: var(--badBg);
    color: var(--badFg);
    animation: ttShake 0.32s ease;
  }
  .demo-pass {
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    background: var(--okBg);
    border-top: 2px solid var(--okBd);
    animation: ttRise 0.3s ease both;
  }
  .demo-pass-msg {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    font-weight: 700;
    color: var(--okFg);
  }
  .demo-mark {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--ac2);
    color: var(--ac2Fg);
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .demo-again {
    height: 40px;
    padding: 0 16px;
    border-radius: 8px;
    background: var(--ac2);
    color: var(--ac2Fg);
    font-size: 14px;
    font-weight: 900;
  }
  .demo-palette {
    padding: 16px 22px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--codeRow);
    border-top: 1px solid var(--codeBd);
  }
  .demo-palette-top {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }
  .demo-palette-label {
    font-weight: 700;
  }
  .demo-undo {
    font-size: 12px;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .demo-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .demo-chip {
    height: 42px;
    padding: 0 13px 0 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    background: var(--code);
    border: 1px solid var(--codeBd);
    transition: border-color 0.1s ease;
  }
  .demo-chip:hover {
    border-color: var(--cKw);
  }
  .demo-key {
    min-width: 20px;
    height: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--cPn);
    background: var(--codeRow);
  }

  .how {
    padding: clamp(56px, 7vw, 88px) var(--gutter);
    background: var(--sf);
    border-top: 1px solid var(--bd);
    border-bottom: 1px solid var(--bd);
  }
  .how .inner {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    gap: 20px;
  }
  .step {
    padding: 28px;
    border-radius: 14px;
    background: var(--card);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .step-n {
    font-size: 13px;
    font-weight: 700;
    color: var(--ac);
  }
  .step-t {
    font-size: 20px;
    font-weight: 900;
  }
  .step-d {
    font-size: 15px;
    line-height: 1.85;
    color: var(--mu);
    text-wrap: pretty;
  }

  .course {
    padding: clamp(56px, 7vw, 88px) var(--gutter);
  }
  .course .inner {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .course-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 12px;
  }
  .course-head span {
    font-size: 14px;
    color: var(--mu);
  }
  .chapters {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    gap: 1px;
    background: var(--sf);
    border: 1px solid var(--bd);
    border-radius: 14px;
    overflow: hidden;
  }
  /* Each cell's 1px outline fills the 1px gap shared with its neighbours (outlines
     paint above every background), and the container clips the outer edge, so a
     partly-filled last row stays clean instead of showing a gray filler cell. */
  .chapter {
    outline: 1px solid var(--bd);
    padding: 20px 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
    background: var(--sf);
    transition: background 0.15s ease;
  }
  .chapter:hover {
    background: var(--card2);
  }
  .chapter-n {
    min-width: 24px;
    font-size: 15px;
    font-weight: 700;
    color: var(--ac);
  }
  .chapter-t {
    flex: 1;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
  }
  .chapter-done {
    font-size: 11px;
    font-weight: 700;
    color: var(--ac2);
    white-space: nowrap;
  }

  .closing {
    padding: clamp(56px, 8vw, 96px) var(--gutter);
    background: var(--code);
  }
  .closing-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 28px;
  }
  .closing-copy {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .closing-code {
    font-size: 15px;
    font-weight: 500;
    color: var(--cPn);
  }
  .closing-type {
    color: var(--ac2);
  }
  .closing-title {
    font-size: clamp(30px, 4vw, 44px);
    font-weight: 900;
    color: var(--cFg);
  }
  .cta-closing {
    height: 56px;
    padding: 0 30px;
    border-radius: 12px;
    background: var(--ac2);
    color: var(--ac2Fg);
    font-size: 16px;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: filter 0.15s ease;
  }
  .cta-closing:hover {
    filter: brightness(1.12);
  }

  footer {
    padding: 24px var(--gutter);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 13px;
    color: var(--mu);
  }
  .footer-brand {
    font-weight: 700;
  }
  .footer-links {
    display: flex;
    gap: 20px;
  }
  .footer-links button:hover {
    color: var(--ac);
  }
</style>
