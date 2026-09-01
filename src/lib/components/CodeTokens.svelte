<script lang="ts">
  import { tok } from '../highlight';

  let { text }: { text: string } = $props();
  const chips = $derived(tok(text));
</script>

<span class="mono">
  {#each chips as c}<span class="tk-{c.kind}">{c.text}</span>{/each}
</span>

<style>
  span.mono {
    white-space: pre;
    font-size: inherit;
  }
</style>
