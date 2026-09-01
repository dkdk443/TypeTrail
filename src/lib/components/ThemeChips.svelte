<script lang="ts">
  import { THEMES, THEME_KEYS } from '../theme';
  import { game } from '../gameState.svelte';
</script>

<div class="chips">
  {#each THEME_KEYS as k}
    <button class:on={k === game.theme} onclick={() => (game.theme = k)}>
      <span class="dot" style="background:{THEMES[k].swatch}"></span>
      <span>{k}</span>
    </button>
  {/each}
</div>

<style>
  .chips {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 18px;
    padding: 6px;
    border-radius: 99px;
    background: var(--card);
    border: 1px solid var(--bd);
    flex-wrap: wrap;
    justify-content: center;
    max-width: 430px;
  }
  button {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border-radius: 99px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    transition: background 0.15s ease;
    background: transparent;
    color: var(--mu);
  }
  button.on {
    background: var(--card2);
    color: var(--fg);
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 99px;
    display: inline-block;
  }
</style>
