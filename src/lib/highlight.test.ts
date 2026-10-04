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

  const kindOf = (chips: ReturnType<typeof tok>, word: string) => chips.find((c) => c.text === word)?.kind;

  it('classifies primitive type names and PascalCase names as ty', () => {
    const chips = tok('let n: number = new User(id) as Status;');
    expect(kindOf(chips, 'number')).toBe('ty');
    expect(kindOf(chips, 'User')).toBe('ty');
    expect(kindOf(chips, 'Status')).toBe('ty');
    expect(kindOf(chips, 'n')).toBe('fg');
    expect(kindOf(chips, 'id')).toBe('fg');
  });

  it('classifies declared property names (incl. optional and readonly) as prop', () => {
    expect(kindOf(tok('  id: number;'), 'id')).toBe('prop');
    expect(kindOf(tok('  nickname?: string;'), 'nickname')).toBe('prop');
    expect(kindOf(tok('  readonly id: string;'), 'id')).toBe('prop');
    const obj = tok('dist({x:3,y:4})');
    expect(kindOf(obj, 'x')).toBe('prop');
    expect(kindOf(obj, 'y')).toBe('prop');
  });

  it('classifies member access after a dot as prop', () => {
    const chips = tok('el.style.color');
    expect(kindOf(chips, 'el')).toBe('fg');
    expect(kindOf(chips, 'style')).toBe('prop');
    expect(kindOf(chips, 'color')).toBe('prop');
  });

  it('does not treat annotated variables or parameters as properties', () => {
    expect(kindOf(tok('let name: string'), 'name')).toBe('fg');
    expect(kindOf(tok('function f(s: Status)'), 's')).toBe('fg');
  });

  it('uses the surrounding fragment context to classify a split line', () => {
    expect(kindOf(tok('  id', { after: ':' }), 'id')).toBe('prop');
    expect(kindOf(tok('  id'), 'id')).toBe('fg');
    expect(kindOf(tok('b : c', { before: 'a ?' }), 'b')).toBe('fg');
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
