import { describe, expect, it } from 'vitest';
import { DATA } from './data';
import { GameState, type LineChip } from './gameState.svelte';

function isKind<K extends LineChip['kind']>(kind: K) {
  return (c: LineChip): c is Extract<LineChip, { kind: K }> => c.kind === kind;
}

// These tests exercise chapter 0 ("型注釈と型推論") directly, since its
// exact tokens are known and stable. Cross-chapter content invariants
// (pool/answer collisions, "can every chapter actually be solved") live
// in data.test.ts instead, so this file stays decoupled from lesson
// content edits as much as possible.
const ex0 = DATA[0].ex;

describe('GameState: initial state', () => {
  it('starts on the map with nothing done', () => {
    const g = new GameState();
    expect(g.screen).toBe('map');
    expect(g.ci).toBe(0);
    expect(g.done).toEqual({});
    expect(g.celebrating).toBe(false);
  });

  it('ch/ex getters track the current chapter index', () => {
    const g = new GameState();
    g.ci = 2;
    expect(g.ch).toBe(DATA[2]);
    expect(g.ex).toBe(DATA[2].ex);
  });
});

describe('GameState: navigation', () => {
  it('openChapter resets per-chapter state and switches to the slide screen', () => {
    const g = new GameState();
    g.hint = true;
    g.status = 'ng';
    g.openChapter(3);
    expect(g.screen).toBe('slide');
    expect(g.ci).toBe(3);
    expect(g.sl).toBe(0);
    expect(g.built).toEqual([]);
    expect(g.status).toBe('idle');
    expect(g.hint).toBe(false);
    expect(g.celebrating).toBe(false);
  });

  it('nextSlide advances through slide steps, then falls through to the exercise screen', () => {
    const g = new GameState();
    g.openChapter(0);
    expect(DATA[0].slides.length).toBe(2);
    g.nextSlide();
    expect(g.sl).toBe(1);
    expect(g.screen).toBe('slide');
    g.nextSlide();
    expect(g.screen).toBe('ex');
  });

  it('advanceSlide moves forward but stops at the last slide (desktop: no screen change)', () => {
    const g = new GameState();
    g.openChapter(0);
    g.advanceSlide();
    expect(g.sl).toBe(1);
    g.advanceSlide();
    expect(g.sl).toBe(1);
    expect(g.screen).toBe('slide');
  });

  it('prevSlide never goes below 0', () => {
    const g = new GameState();
    g.prevSlide();
    expect(g.sl).toBe(0);
  });

  it('toMap closes the celebration overlay too', () => {
    const g = new GameState();
    g.celebrating = true;
    g.toMap();
    expect(g.screen).toBe('map');
    expect(g.celebrating).toBe(false);
  });

  it('celebrateNext opens the next chapter, or returns to the map after the last one', () => {
    const g = new GameState();
    g.ci = 0;
    g.celebrateNext();
    expect(g.ci).toBe(1);
    expect(g.screen).toBe('slide');

    const last = new GameState();
    last.ci = DATA.length - 1;
    last.celebrateNext();
    expect(last.screen).toBe('map');
  });
});

describe('GameState: buildIdx / isLocked / cur', () => {
  it('buildIdx only returns lines that have fillable tokens', () => {
    const g = new GameState();
    const fillable = ex0.lines
      .map((l, i) => (l.t.length ? i : -1))
      .filter((i) => i >= 0);
    expect(g.buildIdx(ex0)).toEqual(fillable);
  });

  it('cur() returns the first not-yet-solved fillable line', () => {
    const g = new GameState();
    expect(g.cur(ex0)).toBe(0);
  });
});

describe('GameState: tap / backspace / reveal / finish', () => {
  it('tap() stays idle until the line is fully built', () => {
    const g = new GameState();
    g.tap(':');
    expect(g.status).toBe('idle');
    expect(g.built[0]).toEqual([':']);
    expect(g.isLocked(0)).toBe(false);
  });

  it('tap() locks the line and advances cur() on a correct sequence', () => {
    const g = new GameState();
    g.tap(':');
    g.tap('string');
    expect(g.status).toBe('ok');
    expect(g.isLocked(0)).toBe(true);
    expect(g.cur()).toBe(1);
  });

  it('tap() flags ng on a wrong final token, without discarding the built tokens', () => {
    const g = new GameState();
    g.tap(':'); // correct so far
    g.tap('boolean'); // wrong: line wants ':', 'string'
    expect(g.status).toBe('ng');
    expect(g.built[0]).toEqual([':', 'boolean']);
    expect(g.isLocked(0)).toBe(false);
    expect(g.cur()).toBe(0); // still stuck on the same line
  });

  it('backspace() undoes the last tap and clears ng status', () => {
    const g = new GameState();
    g.tap(':');
    g.tap('boolean');
    g.backspace();
    expect(g.built[0]).toEqual([':']);
    expect(g.status).toBe('idle');
  });

  it('backspace() is a no-op once the whole exercise is solved', () => {
    const g = new GameState();
    for (const line of ex0.lines) for (const t of line.t) g.tap(t);
    expect(g.cur()).toBeUndefined();
    g.backspace();
    expect(g.built[0]).toEqual([':', 'string']);
  });

  it('reveal() fills the current line with the correct answer and locks it', () => {
    const g = new GameState();
    g.reveal();
    expect(g.built[0]).toEqual(ex0.lines[0].t);
    expect(g.status).toBe('ok');
    expect(g.isLocked(0)).toBe(true);
  });

  it('finishing the last fillable line marks the chapter done and celebrates', () => {
    const g = new GameState();
    g.ci = 0;
    for (const line of ex0.lines) for (const t of line.t) g.tap(t);
    expect(g.cur()).toBeUndefined();
    expect(g.done[0]).toBe(true);
    expect(g.celebrating).toBe(true);
  });

  it('does not finish early: the chapter is not done until every fillable line is solved', () => {
    const g = new GameState();
    g.tap(':');
    g.tap('string'); // only the first fillable line is solved
    expect(g.done[0]).toBeUndefined();
    expect(g.celebrating).toBe(false);
  });
});

describe('GameState: lineChips', () => {
  it('an untouched current line renders its pre/post code plus empty slots', () => {
    const g = new GameState();
    const chips = g.lineChips(0);
    const slots = chips.filter(isKind('slot'));
    expect(slots.map((s) => s.state)).toEqual(['cur-first', 'cur-rest']);
    const code = chips.filter(isKind('code')).map((c) => c.text).join('');
    expect(code).toBe(ex0.lines[0].pre + ex0.lines[0].post);
  });

  it('a wrong-but-full attempt renders filled chips in the bad state', () => {
    const g = new GameState();
    g.tap(':');
    g.tap('boolean');
    const filled = g.lineChips(0).filter(isKind('filled'));
    expect(filled.map((c) => c.text)).toEqual([':', 'boolean']);
    expect(filled.every((c) => c.state === 'bad')).toBe(true);
  });

  it('a locked line renders filled chips in the locked state with no slots', () => {
    const g = new GameState();
    g.tap(':');
    g.tap('string');
    const chips = g.lineChips(0);
    expect(chips.some(isKind('slot'))).toBe(false);
    const filled = chips.filter(isKind('filled'));
    expect(filled.map((c) => c.text)).toEqual([':', 'string']);
    expect(filled.every((c) => c.state === 'locked')).toBe(true);
  });
});

describe('GameState: union lines accept any member order', () => {
  // Chapter 1 (index 1, プリミティブ型とリテラル型), line 0:
  // type Status = "idle" | "loading" | "done"; — real unions have no
  // canonical member order, so a differently-ordered-but-valid answer
  // must still be accepted.
  const statusLine = () => {
    const g = new GameState();
    g.openChapter(1);
    return g;
  };

  it('accepts the members tapped in a different (but valid) order', () => {
    const g = statusLine();
    for (const t of ['"done"', '|', '"loading"', '|', '"idle"']) g.tap(t);
    expect(g.status).toBe('ok');
    expect(g.isLocked(0)).toBe(true);
  });

  it('still rejects a genuinely wrong member', () => {
    const g = statusLine();
    for (const t of ['"idle"', '|', '"loading"', '|', 'boolean']) g.tap(t);
    expect(g.status).toBe('ng');
    expect(g.isLocked(0)).toBe(false);
  });

  it('still requires the fixed prefix before the union (":" here) in place', () => {
    // Chapter 4 (index 4, ユニオン型と型ガード), line 0: function show(v: string | number) {
    const g = new GameState();
    g.openChapter(4);
    for (const t of ['string', ':', '|', 'number']) g.tap(t);
    expect(g.status).toBe('ng');
  });
});

describe('GameState: non-union lines still require exact order', () => {
  it('rejects correct tokens tapped out of order', () => {
    const g = new GameState();
    g.tap('string');
    g.tap(':');
    expect(g.status).toBe('ng');
    expect(g.built[0]).toEqual(['string', ':']);
  });
});

describe('GameState: paletteTokens', () => {
  it('dedupes answer + decoy tokens and sorts shortest/alphabetical first', () => {
    const g = new GameState();
    expect(g.paletteTokens(ex0)).toEqual([':', '=>', 'any', 'void', 'number', 'string', 'boolean', 'string[]']);
  });
});
