import { describe, expect, it } from 'vitest';
import { DATA } from './data';
import { GameState } from './gameState.svelte';

describe('DATA: structural invariants', () => {
  it('chapter numbers are sequential, zero-padded, matching their index', () => {
    DATA.forEach((c, i) => {
      expect(c.num).toBe(String(i + 1).padStart(2, '0'));
    });
  });

  it('every chapter has slides with non-empty heading/body/note', () => {
    for (const c of DATA) {
      expect(c.slides.length).toBeGreaterThan(0);
      for (const s of c.slides) {
        expect(s.heading.trim()).not.toBe('');
        expect(s.body.length).toBeGreaterThan(0);
        for (const p of s.body) expect(p.trim()).not.toBe('');
        expect(s.note.trim()).not.toBe('');
      }
    }
  });

  it('every exercise has a goal, a hint, and at least one output line', () => {
    for (const c of DATA) {
      expect(c.ex.goal.trim()).not.toBe('');
      expect(c.ex.hint.trim()).not.toBe('');
      expect(c.ex.out.length).toBeGreaterThan(0);
    }
  });

  it('every exercise has at least one fillable line', () => {
    for (const c of DATA) {
      const fillable = c.ex.lines.filter((l) => l.t.length > 0);
      expect(fillable.length, c.title).toBeGreaterThan(0);
    }
  });

  it('pool decoys never duplicate one of that exercise\'s own correct tokens', () => {
    for (const c of DATA) {
      const required = new Set<string>();
      c.ex.lines.forEach((l) => l.t.forEach((t) => required.add(t)));
      const overlap = c.ex.pool.filter((p) => required.has(p));
      expect(overlap, c.title).toEqual([]);
    }
  });

  it('unionAt marks a well-formed "value, |, value, |, value..." suffix', () => {
    for (const c of DATA) {
      for (const l of c.ex.lines) {
        if (l.unionAt === undefined) continue;
        const suffix = l.t.slice(l.unionAt);
        expect(suffix.length % 2, `${c.title}: ${l.t.join(' ')}`).toBe(1);
        suffix.forEach((tok, k) => {
          if (k % 2 === 1) expect(tok, `${c.title}: ${l.t.join(' ')}`).toBe('|');
        });
      }
    }
  });
});

describe('DATA: every chapter is actually solvable', () => {
  for (const chapter of DATA) {
    it(`${chapter.num} ${chapter.title}: tapping the correct tokens in order solves it`, () => {
      const g = new GameState();
      g.openChapter(DATA.indexOf(chapter));

      for (const line of chapter.ex.lines) {
        for (const t of line.t) g.tap(t);
      }

      expect(g.cur()).toBeUndefined();
      expect(g.status).toBe('ok');
      expect(g.done[DATA.indexOf(chapter)]).toBe(true);
      expect(g.celebrating).toBe(true);
      for (let i = 0; i < chapter.ex.lines.length; i++) {
        if (chapter.ex.lines[i].t.length) expect(g.isLocked(i)).toBe(true);
      }
    });

    it(`${chapter.num} ${chapter.title}: every required token is available in the palette`, () => {
      const g = new GameState();
      g.ci = DATA.indexOf(chapter);
      const palette = new Set(g.paletteTokens());
      for (const line of chapter.ex.lines) {
        for (const t of line.t) expect(palette.has(t), t).toBe(true);
      }
    });
  }
});
