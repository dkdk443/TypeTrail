# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TypeTrail: a single-page, client-only TypeScript-learning app, with a second bundled track (JSTrail) for plain-JavaScript review. Users tap tokens from a palette to build code line-by-line, chapter by chapter. There is no backend — routing is a thin client-side History API layer (see "Trails & routing" below), and there is a Vitest unit-test suite (see Commands).

## Commands

```bash
npm run dev      # start Vite dev server (HMR)
npm run build    # type-check-free production build to dist/
npm run preview  # serve the dist/ build locally
npm run check    # svelte-check (tsconfig.app.json) + tsc -p tsconfig.node.json
npm test         # vitest run — all *.test.ts under src/
npx vitest       # same, in watch mode
```

There is no lint script. Tests are Vitest unit tests only (no component/E2E tests) — `*.test.ts` files live next to the module they cover. Run both `npm test` and `npm run check` after any change.

Deploy with `npx vercel --prod` (already linked to a Vercel project via `.vercel/`).

## Architecture

### State: one reactive class, two UIs

`src/lib/gameState.svelte.ts` exports a single singleton, `game` (a `GameState` instance using Svelte 5 runes: `$state`/`$derived` class fields). It is the entire source of truth — current trail (`trail`), chapter/step (`ci`/`sl`) *within that trail*, the tokens built so far per exercise line (`built`), whether the current attempt is right/wrong (`status`), completed chapters per trail (`done: Record<TrailKey, Record<number, boolean>>`), and the celebration overlay flag. `chapters`, `ch`, `step`, and `ex` are all `$derived` in a chain (`chapters` ← `trail`; `ch` ← `chapters`/`ci`; `step` ← `ch`/`sl`; `ex` ← `step`), so switching `trail`/`ci`/`sl` re-points every downstream read automatically. All components import `game` directly and mutate it via its methods (`tap`, `backspace`, `reveal`, `openChapter`, `setTrail`, `nextStep`, etc.) — there is no prop-drilling or event bus.

`App.svelte` renders **two independent component trees against the same `game` state**, chosen by a live `matchMedia('(min-width: 1040px)')` check (not a manual toggle — it tracks the real viewport):
- Below 1040px: the mobile flow — `MapScreen` / `SlideScreen` / `ExerciseScreen`, switched by `game.screen` (`'map' | 'slide' | 'ex'`). Chapters unlock progressively (must clear chapter *i-1* to open chapter *i*).
- At/above 1040px: `DesktopLayout.svelte` — a single combined view (chapter sidebar + slide text + code exercise, all visible at once, no screen transitions). Chapters are freely selectable here (no progressive lock — see `railChapters` vs `mapChapters`). It also binds number-key (1–9) and Backspace shortcuts to the palette while mounted.

Both trees always fill the real viewport edge-to-edge (`100dvh`, no outer margin/radius/shadow) — see `App.svelte`'s `.page`/`.frame` styles.

### Steps, and the tap-to-build exercise mechanic

A chapter is a sequence of **steps** (`Chapter.steps: StepSpec[]`, in `src/lib/types.ts`) — each step bundles its own prose slide (`kicker`/`heading`/`body`/`code`/`note`) *and* its own small exercise (`ex: ExerciseSpec`). There is no chapter-wide exercise anymore: `game.sl` indexes the current step, and `game.step`/`game.ex` are `$derived` from it, so every exercise-mechanic method below (`cur`, `tap`, `isLocked`, ...) operates on whichever step is current without knowing about steps at all — they only ever read `this.ex`.

An exercise (`ExerciseSpec`) is a list of `LineSpec { pre, t, post }`: static `pre`/`post` text plus a sequence `t` of tokens the user must tap in order. `GameState`:
- `cur()` finds the first not-yet-`isLocked` line that has any tokens to fill (lines with `t: []` are always "locked", i.e. pure decoration).
- `tap(token)` appends to `built[i]` for the current line; once its length matches `t.length` it's checked for exact match → `status` becomes `'ok'` (locks the line, calls `finish()`) or `'ng'` (shake/red state until `backspace()`).
- `finish()`, once every fillable line in the *current step* is locked, checks `isLastStep()`: on the chapter's last step it marks the chapter `done` and triggers `celebrating` (the existing full-screen `CelebrateOverlay`); otherwise it does nothing further — `cur() === undefined` with more steps left is what `ExerciseScreen`/`DesktopLayout` key off of to show an inline "次のステップへ" button (calling `nextStep()`, which advances `sl` and resets `built`/`status`/`hint`, landing back on the slide for the new step). Going from a step's slide to its own exercise is just `toEx()` — there's no longer a "browse several slides, then one exercise" phase; every step's slide leads straight into that step's problem.
- `lineChips(i)` turns a line into renderable chips (`LineChip`: `code` / `filled` / `slot`) consumed by `ExerciseLine.svelte`.
- `paletteTokens()` is the shared, deduped, shortest-first token list (correct answers + `ex.pool` decoys, i.e. the *current step's* answers/pool) — used identically by `ExerciseScreen` and `DesktopLayout`.

### Trails & routing

`src/lib/trails.ts` defines `TRAILS: Record<TrailKey, TrailDef>` (`TrailKey = 'ts' | 'js'`), the registry tying each trail to its chapter list and its identity theme: `ts` → `data.ts`'s `DATA` (TypeTrail, TypeScript) + `'TSブルー'`, `js` → `jsData.ts`'s `JS_DATA` (JSTrail, plain-JS review: array methods, async/await) + `'JSイエロー'`. `game.setTrail(key)` switches `trail`, snaps `theme` to that trail's theme, and returns to the map; `game.openChapter(ci, trail?)` can switch trail and open a chapter in one call (used by routing). Progress (`done`) is keyed per trail, so clearing a JSTrail chapter never marks a same-numbered TypeTrail chapter done. `MapScreen`/`DesktopLayout` render a small switcher (over `TRAIL_KEYS`) to jump between trails.

`src/lib/router.ts` has pure, DOM-free functions — `urlFor(trail, screen, ci)` / `parseUrl(path)` / `isUnlocked(ci, done)` — mapping game state to/from a URL path: `/` and `/ch/{1-based n}[/ex]` for TypeTrail, `/js` and `/js/ch/{n}[/ex]` for JSTrail. `App.svelte` is the only place that touches `window.location`/`history`: it resolves the initial URL synchronously (module-scope, before first render) via `applyRoute()`, listens for `popstate`, and has a `$effect` that pushes a new history entry whenever `game.trail`/`screen`/`ci` change from in-app navigation (a change driven by `applyRoute()` itself already matches the current URL, so that effect no-ops for it — no separate suppression flag needed). `isUnlocked()` mirrors the mobile progressive-unlock rule, so a deep link to a not-yet-reachable chapter falls back to that trail's map instead of bypassing the lock. `vercel.json` rewrites all paths to `/index.html` so a hard reload on a deep link doesn't 404 in production.

`src/lib/persistence.ts` (`loadDone`/`saveDone`) persists `game.done` to `localStorage` (key `typetrail:done`) — the only state that survives a reload; everything else (`ci`, `sl`, `built`, ...) is re-derived from the URL instead. Both functions take an optional storage param (defaulting to the real `localStorage`) purely so tests can inject a fake one — `gameState.svelte.ts` itself stays storage-free. `App.svelte` restores `game.done` from storage *before* calling `applyRoute()` (the lock check needs the real `done` to resolve a deep link correctly) and has a `$effect` that saves `game.done` on every change.

### Lesson content

`src/lib/data.ts` exports `DATA: Chapter[]` (TypeTrail) and the `L(pre, tokens, post, unionAt?)` helper used to build exercise lines; `src/lib/jsData.ts` exports `JS_DATA: Chapter[]` (JSTrail) using the same `L` helper imported from `data.ts`. Each chapter has 2-3 steps (`StepSpec`, see above), each with its own prose (heading/body/optional code sample/note) *and* its own small exercise — there's no chapter-wide exercise. **TypeTrail's content is deliberately authored to track サバイバルTypeScript (typescriptbook.jp)'s actual chapter order and terminology** (値・型・変数 → オブジェクト指向 → 型の再利用 → ジェネリクス) — when adding/editing its chapters, keep that alignment. JSTrail's exercises intentionally carry no TypeScript type annotations — it's a plain-JS review track feeding into TypeTrail, not a TS lesson. When adding any step's exercise, make sure its `ex.pool` decoys don't collide with that *same step's* correct `t` tokens (they'd just be redundant, deduped away) — `data.test.ts` asserts this per step (looping over every trail in `TRAILS`, then every step of every chapter), and that every chapter in every trail is actually solvable step-by-step (tap a step's answers → `nextStep()` → repeat → last step marks the chapter done), so a new chapter or step in either trail is covered for free. Step kickers must read `"STEP 1"`, `"STEP 2"`, ... in order with no gaps — also asserted.

A line whose correct tokens end in a real union type (`A | B | C`) should pass `unionAt` = the index in `t` where that `value, '|', value, '|', value...` run starts — real unions have no canonical member order, so `GameState` accepts any permutation of the members there (see `accepted()`/`matches()` in `gameState.svelte.ts`) instead of the usual strict positional match. Everything before `unionAt` (e.g. a leading `:`) still has to be in place.

`GameState` (the class, not just the `game` singleton) is exported specifically so tests can instantiate isolated instances (`new GameState()`) instead of sharing app-wide state.

### Syntax highlighting & theming

`src/lib/highlight.ts` has two pure functions shared across mobile/desktop: `tok(text)` (keyword/string/number/punctuation tokenizer, used for slide code blocks via `CodeTokens.svelte` and for the `pre`/`post` parts of exercise lines) and `rich(text)` (splits prose on `` `backtick` `` spans for inline-code styling, used by `RichText.svelte`). Keyword list lives in the `KW` regex at the top of that file.

`src/lib/theme.ts` defines `THEMES`: seven named palettes, each a flat map of CSS custom properties (`oklch(...)` colors). `themeVarsStyle(key)` serializes one theme to an inline `style` string, applied once on `App.svelte`'s root `.page` div — everything downstream just uses `var(--ac)`, `var(--card)`, etc. There is no standalone theme-picker UI; the only way `game.theme` changes is indirectly, via `game.setTrail()`/`openChapter(ci, trail)` snapping it to that trail's theme (`'TSブルー'` for TypeTrail, `'JSイエロー'` for JSTrail) — see "Trails & routing" above.
