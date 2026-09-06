# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TypeTrail: a single-page, client-only TypeScript-learning app. Users tap tokens from a palette to build TypeScript code line-by-line, chapter by chapter. There is no backend, no router, and no test suite.

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

`src/lib/gameState.svelte.ts` exports a single singleton, `game` (a `GameState` instance using Svelte 5 runes: `$state`/`$derived` class fields). It is the entire source of truth — current chapter/slide (`ci`/`sl`), the tokens built so far per exercise line (`built`), whether the current attempt is right/wrong (`status`), completed chapters (`done`), and the celebration overlay flag. All components import `game` directly and mutate it via its methods (`tap`, `backspace`, `reveal`, `openChapter`, `nextSlide`, etc.) — there is no prop-drilling or event bus.

`App.svelte` renders **two independent component trees against the same `game` state**, chosen by a live `matchMedia('(min-width: 1040px)')` check (not a manual toggle — it tracks the real viewport):
- Below 1040px: the mobile flow — `MapScreen` / `SlideScreen` / `ExerciseScreen`, switched by `game.screen` (`'map' | 'slide' | 'ex'`). Chapters unlock progressively (must clear chapter *i-1* to open chapter *i*).
- At/above 1040px: `DesktopLayout.svelte` — a single combined view (chapter sidebar + slide text + code exercise, all visible at once, no screen transitions). Chapters are freely selectable here (no progressive lock — see `railChapters` vs `mapChapters`). It also binds number-key (1–9) and Backspace shortcuts to the palette while mounted.

Both trees always fill the real viewport edge-to-edge (`100dvh`, no outer margin/radius/shadow) — see `App.svelte`'s `.page`/`.frame` styles.

### The tap-to-build exercise mechanic

An exercise (`ExerciseSpec` in `src/lib/types.ts`) is a list of `LineSpec { pre, t, post }`: static `pre`/`post` text plus a sequence `t` of tokens the user must tap in order. `GameState`:
- `cur()` finds the first not-yet-`isLocked` line that has any tokens to fill (lines with `t: []` are always "locked", i.e. pure decoration).
- `tap(token)` appends to `built[i]` for the current line; once its length matches `t.length` it's checked for exact match → `status` becomes `'ok'` (locks the line, calls `finish()`) or `'ng'` (shake/red state until `backspace()`).
- `finish()` marks the chapter `done` and triggers `celebrating` once every fillable line is locked.
- `lineChips(i)` turns a line into renderable chips (`LineChip`: `code` / `filled` / `slot`) consumed by `ExerciseLine.svelte`.
- `paletteTokens()` is the shared, deduped, shortest-first token list (correct answers + `ex.pool` decoys) — used identically by `ExerciseScreen` and `DesktopLayout`.

### Lesson content

`src/lib/data.ts` exports `DATA: Chapter[]` — the only place lesson content lives. Each chapter has 2 slide "steps" (prose + optional code sample + note) and one exercise. **Content is deliberately authored to track サバイバルTypeScript (typescriptbook.jp)'s actual chapter order and terminology** (値・型・変数 → オブジェクト指向 → 型の再利用 → ジェネリクス) — when adding/editing chapters, keep that alignment and use the `L(pre, tokens, post, unionAt?)` helper for exercise lines. When adding a chapter's exercise, make sure `ex.pool` decoys don't collide with any of that exercise's own correct `t` tokens (they'd just be redundant, deduped away) — `data.test.ts` asserts this, and that every chapter is actually solvable, across all of `DATA` automatically, so a new chapter is covered for free.

A line whose correct tokens end in a real union type (`A | B | C`) should pass `unionAt` = the index in `t` where that `value, '|', value, '|', value...` run starts — real unions have no canonical member order, so `GameState` accepts any permutation of the members there (see `accepted()`/`matches()` in `gameState.svelte.ts`) instead of the usual strict positional match. Everything before `unionAt` (e.g. a leading `:`) still has to be in place.

`GameState` (the class, not just the `game` singleton) is exported specifically so tests can instantiate isolated instances (`new GameState()`) instead of sharing app-wide state.

### Syntax highlighting & theming

`src/lib/highlight.ts` has two pure functions shared across mobile/desktop: `tok(text)` (keyword/string/number/punctuation tokenizer, used for slide code blocks via `CodeTokens.svelte` and for the `pre`/`post` parts of exercise lines) and `rich(text)` (splits prose on `` `backtick` `` spans for inline-code styling, used by `RichText.svelte`). Keyword list lives in the `KW` regex at the top of that file.

`src/lib/theme.ts` defines `THEMES`: six named palettes, each a flat map of CSS custom properties (`oklch(...)` colors). `themeVarsStyle(key)` serializes one theme to an inline `style` string, applied once on `App.svelte`'s root `.page` div — everything downstream just uses `var(--ac)`, `var(--card)`, etc. There is currently no in-app theme switcher UI (removed); `game.theme` defaults to `'TSブルー'`.
