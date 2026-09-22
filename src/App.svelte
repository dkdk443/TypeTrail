<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from './lib/gameState.svelte';
  import { themeVarsStyle } from './lib/theme';
  import { isUnlocked, parseUrl, urlFor } from './lib/router';
  import MapScreen from './lib/components/MapScreen.svelte';
  import SlideScreen from './lib/components/SlideScreen.svelte';
  import ExerciseScreen from './lib/components/ExerciseScreen.svelte';
  import CelebrateOverlay from './lib/components/CelebrateOverlay.svelte';
  import DesktopLayout from './lib/components/DesktopLayout.svelte';

  const DESKTOP_QUERY = '(min-width: 1040px)';
  let isDesktop = $state(false);

  function applyRoute(path: string) {
    const route = parseUrl(path);
    if (route.ci !== null && isUnlocked(route.ci, game.done[route.trail])) {
      game.openChapter(route.ci, route.trail);
      if (route.screen === 'ex') game.toEx();
    } else {
      game.setTrail(route.trail);
    }
  }

  // Resolve the URL the app was loaded with before the first render, so a
  // deep link (or a reload) lands on the right trail/chapter instead of the map.
  applyRoute(location.pathname);
  const canonical = urlFor(game.trail, game.screen, game.ci);
  if (location.pathname !== canonical) history.replaceState(null, '', canonical);

  onMount(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    isDesktop = mq.matches;
    const onChange = (e: MediaQueryListEvent) => (isDesktop = e.matches);
    mq.addEventListener('change', onChange);

    const onPopState = () => applyRoute(location.pathname);
    window.addEventListener('popstate', onPopState);

    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('popstate', onPopState);
    };
  });

  // Any in-app navigation (map -> chapter, slide -> exercise, next chapter, back
  // to map, ...) changes game.screen/game.ci, which pushes a matching URL here.
  // A transition that originated from applyRoute() above already matches the
  // current URL, so this is a no-op for popstate-driven changes.
  $effect(() => {
    const url = urlFor(game.trail, game.screen, game.ci);
    if (location.pathname !== url) history.pushState(null, '', url);
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
