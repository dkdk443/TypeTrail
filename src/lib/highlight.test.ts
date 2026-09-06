import { describe, expect, it } from 'vitest';
import { rich, tok } from './highlight';

describe('tok', () => {
  it('classifies keywords', () => {
    expect(tok('let')).toEqual([{ text: 'let', kind: 'kw' }]);
    expect(tok('return')).toEqual([{ text: 'return', kind: 'kw' }]);
    expect(tok('keyof')).toEqual([{ text: 'keyof', kind: 'kw' }]);
  });

  it('classifies string and template literals', () => {
    expect(tok('"hello"')).toEqual([{ text: '"hello"', kind: 'str' }]);
    expect(tok('`world`')).toEqual([{ text: '`world`', kind: 'str' }]);
  });

  it('classifies bare numbers', () => {
    expect(tok('42')).toEqual([{ text: '42', kind: 'num' }]);
  });

  it('classifies line comments', () => {
    expect(tok('// note')).toEqual([{ text: '// note', kind: 'pn' }]);
  });

  it('classifies plain identifiers as fg, not keywords', () => {
    expect(tok('userName')).toEqual([{ text: 'userName', kind: 'fg' }]);
  });

  it('classifies a whitespace-free punctuation run as pn', () => {
    expect(tok('===')).toEqual([{ text: '===', kind: 'pn' }]);
  });

  it('round-trips: concatenated chip text reconstructs the input', () => {
    const samples = [
      'let userName: string = "ada";',
      'function up(n: number): number {',
      'if (typeof v === "string") {',
      'const s = first(tags); // any…',
      'type Status = "idle" | "loading" | "done";',
    ];
    for (const s of samples) {
      expect(tok(s).map((c) => c.text).join('')).toBe(s);
    }
  });
});

describe('rich', () => {
  it('returns a single plain segment when there is no backtick span', () => {
    expect(rich('no code here')).toEqual([{ text: 'no code here', code: false }]);
  });

  it('splits inline `code` spans out as code segments', () => {
    expect(rich('plain `code` more')).toEqual([
      { text: 'plain ', code: false },
      { text: 'code', code: true },
      { text: ' more', code: false },
    ]);
  });

  it('handles a leading code span with no preceding text', () => {
    expect(rich('`start` end')).toEqual([
      { text: 'start', code: true },
      { text: ' end', code: false },
    ]);
  });

  it('handles multiple code spans', () => {
    expect(rich('use `a` or `b`')).toEqual([
      { text: 'use ', code: false },
      { text: 'a', code: true },
      { text: ' or ', code: false },
      { text: 'b', code: true },
    ]);
  });
});
