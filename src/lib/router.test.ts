import { describe, expect, it } from 'vitest';
import { TRAILS, TRAIL_KEYS } from './trails';
import { isUnlocked, parseUrl, urlFor } from './router';

describe('urlFor', () => {
  it('TypeTrail\'s map screen is the root path', () => {
    expect(urlFor('ts', 'map', 0)).toBe('/');
    expect(urlFor('ts', 'map', 5)).toBe('/');
  });

  it('JSTrail\'s map screen is /js', () => {
    expect(urlFor('js', 'map', 0)).toBe('/js');
  });

  it('the slide screen is /ch/{1-based chapter number}, prefixed per trail', () => {
    expect(urlFor('ts', 'slide', 0)).toBe('/ch/1');
    expect(urlFor('ts', 'slide', 4)).toBe('/ch/5');
    expect(urlFor('js', 'slide', 0)).toBe('/js/ch/1');
  });

  it('the exercise screen appends /ex', () => {
    expect(urlFor('ts', 'ex', 2)).toBe('/ch/3/ex');
    expect(urlFor('js', 'ex', 1)).toBe('/js/ch/2/ex');
  });
});

describe('parseUrl', () => {
  it('falls back to TypeTrail\'s map for the root path', () => {
    expect(parseUrl('/')).toEqual({ trail: 'ts', ci: null, screen: 'map' });
  });

  it('recognizes /js as JSTrail\'s map', () => {
    expect(parseUrl('/js')).toEqual({ trail: 'js', ci: null, screen: 'map' });
  });

  it('falls back to TypeTrail\'s map for anything unrecognized', () => {
    expect(parseUrl('/whatever')).toEqual({ trail: 'ts', ci: null, screen: 'map' });
    expect(parseUrl('/ch/')).toEqual({ trail: 'ts', ci: null, screen: 'map' });
    expect(parseUrl('/ch/abc')).toEqual({ trail: 'ts', ci: null, screen: 'map' });
  });

  it('parses a TypeTrail slide path back to its 0-based chapter index', () => {
    expect(parseUrl('/ch/1')).toEqual({ trail: 'ts', ci: 0, screen: 'slide' });
    expect(parseUrl('/ch/5')).toEqual({ trail: 'ts', ci: 4, screen: 'slide' });
  });

  it('parses a JSTrail path with its /js prefix', () => {
    expect(parseUrl('/js/ch/2')).toEqual({ trail: 'js', ci: 1, screen: 'slide' });
    expect(parseUrl('/js/ch/2/ex')).toEqual({ trail: 'js', ci: 1, screen: 'ex' });
  });

  it('parses an exercise path', () => {
    expect(parseUrl('/ch/3/ex')).toEqual({ trail: 'ts', ci: 2, screen: 'ex' });
  });

  it('tolerates a trailing slash', () => {
    expect(parseUrl('/ch/1/')).toEqual({ trail: 'ts', ci: 0, screen: 'slide' });
  });

  it('falls back to that trail\'s map when the chapter number is out of range', () => {
    expect(parseUrl('/ch/0')).toEqual({ trail: 'ts', ci: null, screen: 'map' });
    expect(parseUrl(`/ch/${TRAILS.ts.chapters.length + 1}`)).toEqual({ trail: 'ts', ci: null, screen: 'map' });
    expect(parseUrl(`/js/ch/${TRAILS.js.chapters.length + 1}`)).toEqual({ trail: 'js', ci: null, screen: 'map' });
  });

  it('round-trips through urlFor for every chapter of every trail', () => {
    for (const key of TRAIL_KEYS) {
      TRAILS[key].chapters.forEach((_, ci) => {
        expect(parseUrl(urlFor(key, 'slide', ci))).toEqual({ trail: key, ci, screen: 'slide' });
        expect(parseUrl(urlFor(key, 'ex', ci))).toEqual({ trail: key, ci, screen: 'ex' });
      });
    }
  });
});

describe('isUnlocked', () => {
  it('chapter 0 is always unlocked', () => {
    expect(isUnlocked(0, {})).toBe(true);
  });

  it('a later chapter is locked until the previous one is done', () => {
    expect(isUnlocked(3, {})).toBe(false);
    expect(isUnlocked(3, { 2: true })).toBe(true);
  });

  it('a chapter already done stays unlocked even without the previous one recorded', () => {
    expect(isUnlocked(3, { 3: true })).toBe(true);
  });
});
