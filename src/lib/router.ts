import { TRAILS, type TrailKey } from './trails';
import type { Screen } from './gameState.svelte';

export interface Route {
  trail: TrailKey;
  ci: number | null;
  screen: Screen;
}

const TRAIL_PREFIX: Record<TrailKey, string> = { ts: '', js: '/js' };

/** Serializes the current trail/chapter/screen into a shareable, reloadable URL path. */
export function urlFor(trail: TrailKey, screen: Screen, ci: number): string {
  const prefix = TRAIL_PREFIX[trail];
  if (screen === 'map') return prefix || '/';
  const base = `${prefix}/ch/${ci + 1}`;
  return screen === 'ex' ? `${base}/ex` : base;
}

/** Parses a URL path back into a trail/chapter/screen. Unrecognized or out-of-range paths fall back to that trail's map. */
export function parseUrl(path: string): Route {
  const m = path.match(/^(\/js)?\/ch\/(\d+)(\/ex)?\/?$/);
  if (m) {
    const trail: TrailKey = m[1] ? 'js' : 'ts';
    const ci = Number(m[2]) - 1;
    if (ci >= 0 && ci < TRAILS[trail].chapters.length) {
      return { trail, ci, screen: m[3] ? 'ex' : 'slide' };
    }
    return { trail, ci: null, screen: 'map' };
  }
  const trail: TrailKey = path === '/js' || path === '/js/' ? 'js' : 'ts';
  return { trail, ci: null, screen: 'map' };
}

/** Mirrors MapScreen's progressive-unlock rule: chapter 0 is always open; later chapters need the previous one cleared. */
export function isUnlocked(ci: number, done: Record<number, boolean>): boolean {
  return ci === 0 || !!done[ci - 1] || !!done[ci];
}
