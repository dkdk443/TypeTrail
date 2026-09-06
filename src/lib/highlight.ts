export type TokenKind = 'kw' | 'str' | 'num' | 'pn' | 'fg';

export interface CodeChip {
  text: string;
  kind: TokenKind;
}

export interface RichSeg {
  text: string;
  code: boolean;
}

const KW = /^(let|const|function|interface|return|type|typeof|new|class|extends|implements|export|import|if|else|switch|case|private|public|protected|readonly|as|keyof|abstract|super|static)$/;

/** Tokenizes a line of TS-ish code into colorable chips: strings, numbers, comments, keywords, punctuation. */
export function tok(text: string): CodeChip[] {
  const out: CodeChip[] = [];
  text.split(/(`[^`]*`|"[^"]*"|\/\/.*$|\b\d+\b)/).filter((s) => s !== '').forEach((p) => {
    if (p.indexOf('//') === 0) { out.push({ text: p, kind: 'pn' }); return; }
    if (/^["`]/.test(p)) { out.push({ text: p, kind: 'str' }); return; }
    if (/^\d+$/.test(p)) { out.push({ text: p, kind: 'num' }); return; }
    p.split(/(\b\w+\b)/).filter((s) => s !== '').forEach((w) => {
      out.push({ text: w, kind: KW.test(w) ? 'kw' : /^[^\w\s]+$/.test(w) ? 'pn' : 'fg' });
    });
  });
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
