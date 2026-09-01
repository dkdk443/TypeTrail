<script lang="ts">
  import { rich } from '../highlight';

  let { text }: { text: string } = $props();
  const segs = $derived(rich(text));
</script>

{#each segs as seg}
  {#if seg.code}
    <span class="mono code-pill">{seg.text}</span>
  {:else}
    {seg.text}
  {/if}
{/each}

<style>
  .code-pill {
    font-size: 0.9em;
    font-weight: 500;
    padding: 2px 6px;
    margin: 0 2px;
    border-radius: 6px;
    background: var(--card2);
    color: var(--ac);
  }
</style>
