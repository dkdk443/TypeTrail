import { describe, expect, it } from 'vitest';
import { GameState } from './gameState.svelte';
import { TRAILS, TRAIL_KEYS } from './trails';

for (const key of TRAIL_KEYS) {
  const { label, chapters } = TRAILS[key];

  describe(`${label}: structural invariants`, () => {
    it('chapter numbers are sequential, zero-padded, matching their index', () => {
      chapters.forEach((c, i) => {
        expect(c.num).toBe(String(i + 1).padStart(2, '0'));
      });
    });

    it('every chapter has at least one step, each with non-empty heading/body/note', () => {
      for (const c of chapters) {
        expect(c.steps.length).toBeGreaterThan(0);
        for (const s of c.steps) {
          expect(s.heading.trim()).not.toBe('');
          expect(s.body.length).toBeGreaterThan(0);
          for (const p of s.body) expect(p.trim()).not.toBe('');
          expect(s.note.trim()).not.toBe('');
        }
      }
    });

    it('step kickers are "STEP 1", "STEP 2", ... in order, with no gaps', () => {
      for (const c of chapters) {
        c.steps.forEach((s, i) => {
          expect(s.kicker, c.title).toBe(`STEP ${i + 1}`);
        });
      }
    });

    it('every step\'s exercise has a goal, a hint, and at least one output line', () => {
      for (const c of chapters) {
        for (const s of c.steps) {
          expect(s.ex.goal.trim(), c.title).not.toBe('');
          expect(s.ex.hint.trim(), c.title).not.toBe('');
          expect(s.ex.out.length, c.title).toBeGreaterThan(0);
        }
      }
    });

    it('every step\'s exercise has at least one fillable line', () => {
      for (const c of chapters) {
        for (const s of c.steps) {
          const fillable = s.ex.lines.filter((l) => l.t.length > 0);
          expect(fillable.length, `${c.title} ${s.kicker}`).toBeGreaterThan(0);
        }
      }
    });

    it('pool decoys never duplicate that step\'s own correct tokens', () => {
      for (const c of chapters) {
        for (const s of c.steps) {
          const required = new Set<string>();
          s.ex.lines.forEach((l) => l.t.forEach((t) => required.add(t)));
          const overlap = s.ex.pool.filter((p) => required.has(p));
          expect(overlap, `${c.title} ${s.kicker}`).toEqual([]);
        }
      }
    });

    it('unionAt marks a well-formed "value, |, value, |, value..." suffix', () => {
      for (const c of chapters) {
        for (const s of c.steps) {
          for (const l of s.ex.lines) {
            if (l.unionAt === undefined) continue;
            const suffix = l.t.slice(l.unionAt);
            expect(suffix.length % 2, `${c.title} ${s.kicker}: ${l.t.join(' ')}`).toBe(1);
            suffix.forEach((tok, k) => {
              if (k % 2 === 1) expect(tok, `${c.title} ${s.kicker}: ${l.t.join(' ')}`).toBe('|');
            });
          }
        }
      }
    });
  });

  describe(`${label}: every chapter is actually solvable, step by step`, () => {
    chapters.forEach((chapter, ci) => {
      it(`${chapter.num} ${chapter.title}: solving each step's exercise advances to the next, then finishes the chapter`, () => {
        const g = new GameState();
        g.openChapter(ci, key);

        chapter.steps.forEach((step, si) => {
          expect(g.sl).toBe(si);
          expect(g.screen).toBe('slide');
          g.toEx();

          for (const line of step.ex.lines) {
            for (const t of line.t) g.tap(t);
          }

          expect(g.cur(), `${chapter.title} ${step.kicker}`).toBeUndefined();
          expect(g.status).toBe('ok');
          for (let i = 0; i < step.ex.lines.length; i++) {
            if (step.ex.lines[i].t.length) expect(g.isLocked(i)).toBe(true);
          }

          const isLast = si === chapter.steps.length - 1;
          if (isLast) {
            expect(g.done[key][ci]).toBe(true);
            expect(g.celebrating).toBe(true);
          } else {
            expect(g.celebrating).toBe(false);
            g.nextStep();
          }
        });
      });

      it(`${chapter.num} ${chapter.title}: every required token is available in each step's palette`, () => {
        const g = new GameState();
        g.openChapter(ci, key);
        chapter.steps.forEach((step, si) => {
          g.sl = si;
          const palette = new Set(g.paletteTokens());
          for (const line of step.ex.lines) {
            for (const t of line.t) expect(palette.has(t), `${chapter.title} ${step.kicker}: ${t}`).toBe(true);
          }
        });
      });
    });
  });
}
