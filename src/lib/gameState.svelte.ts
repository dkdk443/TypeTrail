import { DATA } from './data';
import type { ExerciseSpec } from './types';
import { tok, type TokenKind } from './highlight';
import type { ThemeKey } from './theme';

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    return permutations(rest).map((p) => [item, ...p]);
  });
}

export type Screen = 'map' | 'slide' | 'ex';
export type Status = 'idle' | 'ok' | 'ng';
export type Variant = 'A' | 'B';

export type LineChip =
  | { kind: 'code'; text: string; tk: TokenKind }
  | { kind: 'filled'; text: string; state: 'normal' | 'locked' | 'bad' }
  | { kind: 'slot'; state: 'cur-first' | 'cur-rest' | 'idle' };

export class GameState {
  screen = $state<Screen>('map');
  ci = $state(0);
  sl = $state(0);
  variant = $state<Variant>('A');
  built = $state<string[][]>([]);
  status = $state<Status>('idle');
  hint = $state(false);
  done = $state<Record<number, boolean>>({});
  celebrating = $state(false);
  theme = $state<ThemeKey>('TSブルー');

  ch = $derived(DATA[this.ci]);
  ex = $derived(this.ch.ex);

  buildIdx(ex: ExerciseSpec = this.ex): number[] {
    return ex.lines.map((l, i) => (l.t.length ? i : -1)).filter((i) => i >= 0);
  }

  /**
   * Full token sequences accepted as correct for a line. Ordinarily just
   * `[t]`, but a union (`unionAt` set) has no canonical member order in
   * real TypeScript, so every permutation of its members is also accepted.
   */
  private accepted(t: string[], unionAt?: number): string[][] {
    if (unionAt === undefined) return [t];
    const prefix = t.slice(0, unionAt);
    const values = t.slice(unionAt).filter((_, k) => k % 2 === 0);
    return permutations(values).map((p) => [
      ...prefix,
      ...p.flatMap((v, k) => (k === 0 ? [v] : ['|', v])),
    ]);
  }

  private matches(b: string[], t: string[], unionAt?: number): boolean {
    if (b.length !== t.length) return false;
    return this.accepted(t, unionAt).some((seq) => b.every((x, k) => x === seq[k]));
  }

  isLocked(i: number, ex: ExerciseSpec = this.ex): boolean {
    const b = this.built[i] || [];
    const line = ex.lines[i];
    return this.matches(b, line.t, line.unionAt);
  }

  cur(ex: ExerciseSpec = this.ex): number | undefined {
    return this.buildIdx(ex).find((i) => !this.isLocked(i, ex));
  }

  openChapter(ci: number) {
    this.screen = 'slide';
    this.ci = ci;
    this.sl = 0;
    this.built = [];
    this.status = 'idle';
    this.hint = false;
    this.celebrating = false;
  }

  toMap() {
    this.screen = 'map';
    this.celebrating = false;
  }

  toEx() {
    this.screen = 'ex';
    this.built = [];
    this.status = 'idle';
    this.hint = false;
  }

  prevSlide() {
    if (this.sl > 0) this.sl -= 1;
  }

  nextSlide() {
    if (this.sl === this.ch.slides.length - 1) this.toEx();
    else this.sl += 1;
  }

  /** Advances the slide step without leaving to the exercise screen (desktop: slide + exercise are shown together). */
  advanceSlide() {
    if (this.sl < this.ch.slides.length - 1) this.sl += 1;
  }

  setVariant(v: Variant) {
    this.variant = v;
  }

  toggleHint() {
    this.hint = !this.hint;
  }

  private finish() {
    if (this.cur() !== undefined) return;
    this.done = { ...this.done, [this.ci]: true };
    this.celebrating = true;
  }

  tap(token: string) {
    const i = this.cur();
    if (i === undefined) return;
    const built = this.built.slice();
    const arr = (built[i] || []).slice();
    arr.push(token);
    built[i] = arr;
    const line = this.ex.lines[i];
    if (arr.length < line.t.length) {
      this.built = built;
      this.status = 'idle';
      return;
    }
    const ok = this.matches(arr, line.t, line.unionAt);
    this.built = built;
    if (!ok) {
      this.status = 'ng';
      return;
    }
    this.status = 'ok';
    this.finish();
  }

  backspace() {
    const i = this.cur();
    if (i === undefined) return;
    const built = this.built.slice();
    built[i] = (built[i] || []).slice(0, -1);
    this.built = built;
    this.status = 'idle';
  }

  reveal() {
    const i = this.cur();
    if (i === undefined) return;
    const built = this.built.slice();
    built[i] = this.ex.lines[i].t.slice();
    this.built = built;
    this.status = 'ok';
    this.finish();
  }

  stayCelebrating() {
    this.celebrating = false;
  }

  celebrateNext() {
    const nextCi = this.ci + 1;
    if (nextCi >= DATA.length) this.toMap();
    else this.openChapter(nextCi);
  }

  lineChips(i: number, ex: ExerciseSpec = this.ex): LineChip[] {
    const line = ex.lines[i];
    const chips: LineChip[] = [];
    if (line.pre) tok(line.pre).forEach((c) => chips.push({ kind: 'code', text: c.text, tk: c.kind }));

    const built = this.built[i] || [];
    const isCur = this.cur(ex) === i;
    const locked = this.isLocked(i, ex);
    const bad = this.status === 'ng' && isCur;

    built.forEach((b) => {
      chips.push({ kind: 'filled', text: b, state: bad ? 'bad' : locked ? 'locked' : 'normal' });
    });

    if (isCur) {
      const remain = line.t.length - built.length;
      for (let k = 0; k < remain; k++) chips.push({ kind: 'slot', state: k === 0 ? 'cur-first' : 'cur-rest' });
    } else if (!locked && line.t.length) {
      for (let k = 0; k < line.t.length; k++) chips.push({ kind: 'slot', state: 'idle' });
    }

    if (line.post) tok(line.post).forEach((c) => chips.push({ kind: 'code', text: c.text, tk: c.kind }));
    return chips;
  }

  /** All fillable tokens for the current exercise: correct answers plus decoys, deduped, shortest/alphabetical first. */
  paletteTokens(ex: ExerciseSpec = this.ex): string[] {
    const tokens: string[] = [];
    ex.lines.forEach((l) => l.t.forEach((t) => tokens.push(t)));
    ex.pool.forEach((t) => tokens.push(t));
    const uniq = Array.from(new Set(tokens));
    uniq.sort((a, b) => a.length - b.length || a.localeCompare(b));
    return uniq;
  }
}

export const game = new GameState();
