<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from './lib/gameState.svelte';
  import { themeVarsStyle } from './lib/theme';
  import MapScreen from './lib/components/MapScreen.svelte';
  import SlideScreen from './lib/components/SlideScreen.svelte';
  import ExerciseScreen from './lib/components/ExerciseScreen.svelte';
  import CelebrateOverlay from './lib/components/CelebrateOverlay.svelte';
  import DesktopLayout from './lib/components/DesktopLayout.svelte';

  const DESKTOP_QUERY = '(min-width: 1040px)';
  let isDesktop = $state(false);

  onMount(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    isDesktop = mq.matches;
    const onChange = (e: MediaQueryListEvent) => (isDesktop = e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  });

  const themeStyle = $derived(themeVarsStyle(game.theme));
</script>

<div class="page" style={themeStyle}>
  {#if isDesktop}
    <DesktopLayout />
  {:else}
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
  {/if}
</div>

<style>
  .page {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    color: var(--fg);
    overflow: hidden;
  }

  /* The app always fills the actual device/window viewport edge-to-edge,
     instead of floating a fixed-size mockup card with margin around it. */
  .frame {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    background: var(--sf);
    display: flex;
    flex-direction: column;
  }
</style>
