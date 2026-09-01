export type ThemeKey =
  | 'TSブルー'
  | 'TSダーク'
  | 'ネオン'
  | 'サンライズ'
  | 'ターミナル'
  | 'ペーパー';

export interface ThemeVars {
  bg: string; sf: string; card: string; card2: string;
  bd: string; fg: string; mu: string;
  ac: string; acFg: string; ac2: string; ac2Fg: string;
  code: string; codeBd: string; codeRow: string;
  cFg: string; cKw: string; cStr: string; cNum: string; cPn: string;
  chipBg: string; chipFg: string; slot: string; slotBd: string;
  okBg: string; okBd: string; okFg: string;
  badBg: string; badFg: string; bad: string;
}

export interface ThemeDef {
  swatch: string;
  overlay: string;
  v: ThemeVars;
}

export const THEMES: Record<ThemeKey, ThemeDef> = {
  'TSブルー': { swatch: 'oklch(0.55 0.15 254)', overlay: 'oklch(0.97 0.008 250 / 0.95)', v: {
    bg: 'oklch(0.91 0.018 250)', sf: 'oklch(0.995 0.004 250)', card: 'oklch(0.975 0.008 250)', card2: 'oklch(0.945 0.016 250)',
    bd: 'oklch(0.885 0.018 250)', fg: 'oklch(0.24 0.025 258)', mu: 'oklch(0.5 0.028 254)',
    ac: 'oklch(0.55 0.15 254)', acFg: 'oklch(0.99 0.006 250)', ac2: 'oklch(0.68 0.13 218)', ac2Fg: 'oklch(0.18 0.05 250)',
    code: 'oklch(0.24 0.035 258)', codeBd: 'oklch(0.34 0.045 256)', codeRow: 'oklch(0.3 0.05 256)',
    cFg: 'oklch(0.9 0.012 250)', cKw: 'oklch(0.78 0.12 236)', cStr: 'oklch(0.84 0.11 158)', cNum: 'oklch(0.83 0.1 90)', cPn: 'oklch(0.65 0.025 252)',
    chipBg: 'oklch(0.45 0.13 255)', chipFg: 'oklch(0.98 0.01 250)', slot: 'oklch(0.3 0.035 256)', slotBd: 'oklch(0.45 0.045 254)',
    okBg: 'oklch(0.38 0.1 200)', okBd: 'oklch(0.55 0.12 210)', okFg: 'oklch(0.92 0.09 200)',
    badBg: 'oklch(0.48 0.15 25)', badFg: 'oklch(0.98 0.03 30)', bad: 'oklch(0.55 0.18 27)' } },

  'TSダーク': { swatch: 'oklch(0.68 0.14 250)', overlay: 'oklch(0.19 0.03 258 / 0.95)', v: {
    bg: 'oklch(0.16 0.025 258)', sf: 'oklch(0.205 0.028 258)', card: 'oklch(0.24 0.032 258)', card2: 'oklch(0.28 0.038 256)',
    bd: 'oklch(0.34 0.04 256)', fg: 'oklch(0.93 0.012 250)', mu: 'oklch(0.7 0.022 252)',
    ac: 'oklch(0.68 0.14 250)', acFg: 'oklch(0.16 0.04 255)', ac2: 'oklch(0.78 0.12 216)', ac2Fg: 'oklch(0.17 0.04 230)',
    code: 'oklch(0.14 0.022 258)', codeBd: 'oklch(0.3 0.035 256)', codeRow: 'oklch(0.23 0.035 256)',
    cFg: 'oklch(0.88 0.012 250)', cKw: 'oklch(0.75 0.13 250)', cStr: 'oklch(0.83 0.11 158)', cNum: 'oklch(0.83 0.1 90)', cPn: 'oklch(0.62 0.025 252)',
    chipBg: 'oklch(0.38 0.1 254)', chipFg: 'oklch(0.97 0.01 250)', slot: 'oklch(0.24 0.03 258)', slotBd: 'oklch(0.4 0.04 254)',
    okBg: 'oklch(0.3 0.08 210)', okBd: 'oklch(0.48 0.11 212)', okFg: 'oklch(0.86 0.11 208)',
    badBg: 'oklch(0.42 0.14 22)', badFg: 'oklch(0.96 0.04 28)', bad: 'oklch(0.72 0.16 28)' } },

  'ネオン': { swatch: 'oklch(0.78 0.15 200)', overlay: 'oklch(0.16 0.035 266 / 0.94)', v: {
    bg: 'oklch(0.13 0.03 266)', sf: 'oklch(0.175 0.035 266)', card: 'oklch(0.21 0.04 266)', card2: 'oklch(0.245 0.045 266)',
    bd: 'oklch(0.32 0.05 266)', fg: 'oklch(0.93 0.015 250)', mu: 'oklch(0.7 0.025 258)',
    ac: 'oklch(0.78 0.15 200)', acFg: 'oklch(0.18 0.04 250)', ac2: 'oklch(0.85 0.19 125)', ac2Fg: 'oklch(0.2 0.05 140)',
    code: 'oklch(0.145 0.03 266)', codeBd: 'oklch(0.28 0.045 266)', codeRow: 'oklch(0.22 0.045 262)',
    cFg: 'oklch(0.86 0.015 250)', cKw: 'oklch(0.78 0.15 200)', cStr: 'oklch(0.85 0.19 125)', cNum: 'oklch(0.8 0.13 320)', cPn: 'oklch(0.6 0.03 260)',
    chipBg: 'oklch(0.35 0.06 250)', chipFg: 'oklch(0.96 0.01 250)', slot: 'oklch(0.26 0.04 266)', slotBd: 'oklch(0.4 0.04 262)',
    okBg: 'oklch(0.28 0.08 145)', okBd: 'oklch(0.45 0.13 140)', okFg: 'oklch(0.88 0.17 128)',
    badBg: 'oklch(0.42 0.14 22)', badFg: 'oklch(0.95 0.05 20)', bad: 'oklch(0.75 0.16 25)' } },

  'サンライズ': { swatch: 'oklch(0.66 0.17 38)', overlay: 'oklch(0.96 0.02 75 / 0.95)', v: {
    bg: 'oklch(0.92 0.025 72)', sf: 'oklch(0.985 0.008 82)', card: 'oklch(0.965 0.014 78)', card2: 'oklch(0.94 0.022 76)',
    bd: 'oklch(0.88 0.024 74)', fg: 'oklch(0.29 0.02 55)', mu: 'oklch(0.52 0.025 58)',
    ac: 'oklch(0.66 0.17 38)', acFg: 'oklch(0.99 0.01 70)', ac2: 'oklch(0.58 0.13 178)', ac2Fg: 'oklch(0.99 0.01 180)',
    code: 'oklch(0.25 0.025 58)', codeBd: 'oklch(0.34 0.03 58)', codeRow: 'oklch(0.31 0.035 55)',
    cFg: 'oklch(0.9 0.012 70)', cKw: 'oklch(0.82 0.13 45)', cStr: 'oklch(0.85 0.13 145)', cNum: 'oklch(0.86 0.11 88)', cPn: 'oklch(0.65 0.02 65)',
    chipBg: 'oklch(0.44 0.11 40)', chipFg: 'oklch(0.98 0.02 70)', slot: 'oklch(0.32 0.03 58)', slotBd: 'oklch(0.45 0.04 58)',
    okBg: 'oklch(0.94 0.045 175)', okBd: 'oklch(0.78 0.09 175)', okFg: 'oklch(0.42 0.1 178)',
    badBg: 'oklch(0.5 0.15 25)', badFg: 'oklch(0.98 0.03 30)', bad: 'oklch(0.55 0.18 27)' } },

  'ターミナル': { swatch: 'oklch(0.8 0.18 142)', overlay: 'oklch(0.17 0.015 150 / 0.95)', v: {
    bg: 'oklch(0.145 0.012 150)', sf: 'oklch(0.185 0.015 150)', card: 'oklch(0.215 0.018 150)', card2: 'oklch(0.25 0.022 150)',
    bd: 'oklch(0.32 0.025 150)', fg: 'oklch(0.91 0.03 145)', mu: 'oklch(0.66 0.035 145)',
    ac: 'oklch(0.8 0.18 142)', acFg: 'oklch(0.17 0.03 150)', ac2: 'oklch(0.88 0.13 108)', ac2Fg: 'oklch(0.19 0.04 130)',
    code: 'oklch(0.125 0.012 150)', codeBd: 'oklch(0.27 0.022 150)', codeRow: 'oklch(0.2 0.02 148)',
    cFg: 'oklch(0.86 0.05 145)', cKw: 'oklch(0.84 0.16 142)', cStr: 'oklch(0.9 0.1 108)', cNum: 'oklch(0.8 0.07 168)', cPn: 'oklch(0.6 0.04 145)',
    chipBg: 'oklch(0.32 0.07 145)', chipFg: 'oklch(0.95 0.04 140)', slot: 'oklch(0.23 0.02 150)', slotBd: 'oklch(0.38 0.03 148)',
    okBg: 'oklch(0.27 0.07 140)', okBd: 'oklch(0.45 0.12 140)', okFg: 'oklch(0.88 0.16 135)',
    badBg: 'oklch(0.4 0.13 40)', badFg: 'oklch(0.95 0.06 60)', bad: 'oklch(0.78 0.14 60)' } },

  'ペーパー': { swatch: 'oklch(0.52 0.16 268)', overlay: 'oklch(0.97 0.006 260 / 0.95)', v: {
    bg: 'oklch(0.915 0.008 258)', sf: 'oklch(0.995 0.003 260)', card: 'oklch(0.975 0.005 258)', card2: 'oklch(0.945 0.009 258)',
    bd: 'oklch(0.885 0.009 258)', fg: 'oklch(0.25 0.012 262)', mu: 'oklch(0.5 0.014 262)',
    ac: 'oklch(0.52 0.16 268)', acFg: 'oklch(0.99 0.005 260)', ac2: 'oklch(0.58 0.14 172)', ac2Fg: 'oklch(0.99 0.005 180)',
    code: 'oklch(0.215 0.018 266)', codeBd: 'oklch(0.31 0.025 266)', codeRow: 'oklch(0.27 0.03 266)',
    cFg: 'oklch(0.89 0.008 260)', cKw: 'oklch(0.76 0.13 272)', cStr: 'oklch(0.83 0.12 162)', cNum: 'oklch(0.81 0.1 320)', cPn: 'oklch(0.62 0.02 262)',
    chipBg: 'oklch(0.4 0.11 270)', chipFg: 'oklch(0.98 0.01 265)', slot: 'oklch(0.28 0.02 266)', slotBd: 'oklch(0.42 0.03 266)',
    okBg: 'oklch(0.95 0.04 172)', okBd: 'oklch(0.8 0.08 172)', okFg: 'oklch(0.42 0.1 174)',
    badBg: 'oklch(0.5 0.16 25)', badFg: 'oklch(0.98 0.03 30)', bad: 'oklch(0.52 0.18 27)' } }
};

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

export function themeVarsStyle(key: ThemeKey): string {
  const v = THEMES[key].v;
  return (Object.keys(v) as (keyof ThemeVars)[]).map((k) => `--${k}:${v[k]}`).join('; ');
}
