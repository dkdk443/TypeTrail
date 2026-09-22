<script lang="ts">
  import { game } from '../gameState.svelte';
  import RichText from './RichText.svelte';
  import CodeTokens from './CodeTokens.svelte';

  const steps = $derived(game.ch.steps);
  const sd = $derived(game.step);
  const lastStep = $derived(game.isLastStep());
</script>

<div class="wrap">
  <div class="top">
    <button class="back" onclick={() => game.toMap()}>‹</button>
    <div class="title-wrap">
      <div class="kicker">まなぶ</div>
      <div class="title">{game.ch.title}</div>
    </div>
    <div class="dots">
      {#each steps as _, i}
        <div class="dot" class:on={i === game.sl}></div>
      {/each}
    </div>
  </div>

  <div class="body">
    <div class="card">
      <div class="skicker mono">{sd.kicker}</div>
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
    </div>
  </div>

  <div class="footer">
    <button class="next" class:last={lastStep} onclick={() => game.toEx()}>といてみる</button>
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
    gap: 12px;
    padding: 32px 18px 14px;
  }
  .back {
    width: 38px;
    height: 38px;
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
    color: var(--ac);
  }
  .title {
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
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
  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 18px 16px;
  }
  .card {
    background: var(--card);
    border: 1px solid var(--bd);
    border-radius: 24px;
    padding: 26px 22px 28px;
    animation: ttRise 0.28s ease both;
  }
  .skicker {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: var(--ac);
  }
  h2 {
    margin: 12px 0 0;
    font-size: 23px;
    font-weight: 900;
    line-height: 1.5;
    text-wrap: pretty;
  }
  .paras {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 13px;
  }
  .paras p {
    margin: 0;
    font-size: 14px;
    line-height: 2.05;
    color: var(--fg);
    text-wrap: pretty;
  }
  .code {
    margin-top: 20px;
    background: var(--code);
    border: 1px solid var(--codeBd);
    border-radius: 16px;
    padding: 16px 15px;
    overflow-x: auto;
  }
  .code .row {
    display: flex;
    align-items: center;
    min-height: 24px;
    font-size: 12.5px;
  }
  .note {
    margin-top: 20px;
    display: flex;
    gap: 11px;
    align-items: flex-start;
    background: var(--card2);
    border-left: 3px solid var(--ac2);
    border-radius: 0 14px 14px 0;
    padding: 14px 15px;
  }
  .note-text {
    font-size: 12.5px;
    line-height: 1.95;
    color: var(--fg);
  }
  .footer {
    flex: 0 0 auto;
    padding: 10px 18px 28px;
    display: flex;
    gap: 10px;
  }
  .next {
    flex: 1;
    min-height: 54px;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    font-size: 15px;
    font-weight: 700;
    color: var(--acFg);
    background: var(--ac);
  }
  .next.last {
    color: var(--ac2Fg);
    background: var(--ac2);
  }
</style>
