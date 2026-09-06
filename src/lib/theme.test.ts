import { describe, expect, it } from 'vitest';
import { THEME_KEYS, THEMES, themeVarsStyle } from './theme';

describe('THEMES', () => {
  it('THEME_KEYS matches the THEMES map exactly', () => {
    expect(THEME_KEYS).toEqual(Object.keys(THEMES));
    expect(THEME_KEYS.length).toBe(6);
  });

  it('every theme defines the exact same set of CSS variable keys', () => {
    const referenceKeys = Object.keys(THEMES[THEME_KEYS[0]].v).sort();
    for (const key of THEME_KEYS) {
      expect(Object.keys(THEMES[key].v).sort()).toEqual(referenceKeys);
    }
  });

  it('every theme value is a non-empty string (no missing colors)', () => {
    for (const key of THEME_KEYS) {
      const theme = THEMES[key];
      expect(theme.swatch).toBeTruthy();
      expect(theme.overlay).toBeTruthy();
      for (const [varName, value] of Object.entries(theme.v)) {
        expect(value, `${key}.v.${varName}`).toBeTruthy();
      }
    }
  });
});

describe('themeVarsStyle', () => {
  it('serializes every CSS variable as --name:value, semicolon-separated', () => {
    const style = themeVarsStyle('TSブルー');
    const decls = style.split('; ');
    expect(decls.length).toBe(Object.keys(THEMES['TSブルー'].v).length);
    for (const decl of decls) {
      expect(decl).toMatch(/^--[a-zA-Z0-9]+:.+$/);
    }
    expect(style).toContain(`--bg:${THEMES['TSブルー'].v.bg}`);
    expect(style).toContain(`--ac:${THEMES['TSブルー'].v.ac}`);
  });
});
