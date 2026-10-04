export type TokenKind = 'kw' | 'ty' | 'prop' | 'str' | 'num' | 'pn' | 'fg';

export interface CodeChip {
  text: string;
  kind: TokenKind;
}

export interface RichSeg {
  text: string;
  code: boolean;
}

const KW = /^(let|const|function|interface|return|type|typeof|new|class|extends|implements|export|import|if|else|switch|case|private|public|protected|readonly|as|keyof|abstract|super|static|async|await)$/;

/** Built-in type names; any PascalCase identifier is also treated as a type (or class). */
const PRIMITIVE = /^(string|number|boolean|any|unknown|never|void|null|undefined|object|symbol|bigint)$/;
/** Modifiers that can directly precede a property name (`readonly id: number`). */
const MODIFIER = /^(readonly|public|private|protected|static)$/;

export interface TokContext {
  /** Code that precedes `text` on the same line (e.g. an exercise line's filled tokens). */
  before?: string;
  /** Code that follows `text` on the same line (e.g. an exercise line's answer tokens). */
  after?: string;
}

/**
 * Tokenizes a line of TS-ish code into colorable chips: strings, numbers, comments,
 * keywords, types, property names, punctuation. `ctx` supplies the rest of the line
 * when `text` is only a fragment, so e.g. `  id` before a `:` slot still reads as a property.
 */
export function tok(text: string, ctx: TokContext = {}): CodeChip[] {
  const out: CodeChip[] = [];
  text.split(/(`[^`]*`|"[^"]*"|\/\/.*$|\b\d+\b)/).filter((s) => s !== '').forEach((p) => {
    if (p.indexOf('//') === 0) { out.push({ text: p, kind: 'pn' }); return; }
    if (/^["`]/.test(p)) { out.push({ text: p, kind: 'str' }); return; }
    if (/^\d+$/.test(p)) { out.push({ text: p, kind: 'num' }); return; }
    p.split(/(\b\w+\b)/).filter((s) => s !== '').forEach((w) => {
      out.push({ text: w, kind: KW.test(w) ? 'kw' : /^[^\w\s]+$/.test(w) ? 'pn' : 'fg' });
    });
  });

  const before = ctx.before ?? '';
  const after = ctx.after ?? '';
  let offset = 0;
  for (const c of out) {
    const start = offset;
    offset += c.text.length;
    if (c.kind !== 'fg' || !/^\w+$/.test(c.text)) continue;
    if (PRIMITIVE.test(c.text) || /^[A-Z]/.test(c.text)) {
      c.kind = 'ty';
      continue;
    }
    const prev = (before + text.slice(0, start)).trimEnd();
    const next = (text.slice(offset) + after).trimStart();
    const prevChar = prev.slice(-1);
    const prevWord = prev.match(/(\w+)$/)?.[1] ?? '';
    const declared =
      (prevChar === '' || '{;,'.includes(prevChar) || MODIFIER.test(prevWord)) &&
      /^\??:(?!:)/.test(next);
    if (declared || prevChar === '.') c.kind = 'prop';
  }
  return out;
}

/** Splits prose on `backtick` spans into plain-text vs. inline-code segments. */
export function rich(text: string): RichSeg[] {
  const out: RichSeg[] = [];
  text.split(/`([^`]+)`/).forEach((seg, i) => {
    if (seg === '') return;
    out.push({ text: seg, code: i % 2 === 1 });
  });
  return out;
}
