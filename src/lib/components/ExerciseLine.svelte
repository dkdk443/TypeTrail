<script lang="ts">
  import type { LineChip } from '../gameState.svelte';

  let { chips }: { chips: LineChip[] } = $props();
</script>

<span class="line mono">
  {#each chips as c}
    {#if c.kind === 'code'}
      <span class="tk-{c.tk}">{c.text}</span>
    {:else if c.kind === 'filled'}
      <span class="filled {c.state}">{c.text}</span>
    {:else}
      <span class="slot {c.state}">　</span>
    {/if}
  {/each}
</span>

<style>
  .line {
    white-space: pre;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .filled {
    font-weight: 700;
    padding: 2px 6px;
    margin: 0 1px;
    border-radius: 6px;
    color: var(--chipFg);
    background: var(--chipBg);
  }
  .filled.locked {
    color: var(--okFg);
    background: var(--okBg);
  }
  .filled.bad {
    color: var(--badFg);
    background: var(--badBg);
    animation: ttShake 0.32s ease;
  }
  .slot {
    margin: 0 1px;
    padding: 2px 6px;
    border-radius: 6px;
    color: transparent;
  }
  .slot.idle {
    background: var(--slot);
  }
  /* The slot the next tap fills shows a hard-blinking text caret. */
  .slot.cur-first {
    position: relative;
    border: 1px dashed var(--ac);
  }
  .slot.cur-first::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 3px;
    bottom: 3px;
    width: 2px;
    border-radius: 1px;
    background: var(--ac);
    animation: caretBlink 1s step-end infinite;
  }
  @keyframes caretBlink {
    50% { opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .slot.cur-first::after {
      animation: none;
    }
  }
  .slot.cur-rest {
    border: 1px dashed var(--slotBd);
  }
</style>
