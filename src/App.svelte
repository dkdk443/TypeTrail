<script lang="ts">
  import { game } from './lib/gameState.svelte';
  import { themeVarsStyle } from './lib/theme';
  import ThemeChips from './lib/components/ThemeChips.svelte';
  import MapScreen from './lib/components/MapScreen.svelte';
  import SlideScreen from './lib/components/SlideScreen.svelte';
  import ExerciseScreen from './lib/components/ExerciseScreen.svelte';
  import CelebrateOverlay from './lib/components/CelebrateOverlay.svelte';

  const themeStyle = $derived(themeVarsStyle(game.theme));
</script>

<div class="page" style={themeStyle}>
  <ThemeChips />

  <div class="frame">
    {#if game.screen === 'map'}
      <MapScreen />
    {:else if game.screen === 'slide'}
      <SlideScreen />
    {:else}
      <ExerciseScreen />
    {/if}

    {#if game.celebrating}
      <CelebrateOverlay />
    {/if}
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 22px 16px 44px;
    background: var(--bg);
    color: var(--fg);
  }

  .frame {
    width: 100%;
    max-width: 430px;
    min-height: calc(100vh - 110px);
    border-radius: 0;
    overflow: hidden;
    position: relative;
    background: var(--sf);
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 481px) {
    .frame {
      height: 920px;
      min-height: 0;
      border-radius: 36px;
      box-shadow:
        0 40px 80px -24px oklch(0.05 0.05 266 / 0.45),
        0 0 0 1px var(--bd);
    }
  }
</style>
