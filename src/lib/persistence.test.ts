import { describe, expect, it } from 'vitest';
import { loadDone, saveDone } from './persistence';

function fakeStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    store,
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
  };
}

describe('loadDone', () => {
  it('returns null when nothing is saved', () => {
    expect(loadDone(fakeStorage())).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(loadDone(fakeStorage({ 'typetrail:done': '{not json' }))).toBeNull();
  });

  it('returns null when the saved shape is missing a trail key', () => {
    expect(loadDone(fakeStorage({ 'typetrail:done': JSON.stringify({ ts: { 0: true } }) }))).toBeNull();
    expect(loadDone(fakeStorage({ 'typetrail:done': JSON.stringify('not an object') }))).toBeNull();
  });

  it('returns the saved state when well-formed', () => {
    const done = { ts: { 0: true, 2: true }, js: { 0: true } };
    expect(loadDone(fakeStorage({ 'typetrail:done': JSON.stringify(done) }))).toEqual(done);
  });

  it('does not throw if getItem itself throws (e.g. storage disabled)', () => {
    const storage = { getItem: () => { throw new Error('blocked'); } };
    expect(loadDone(storage)).toBeNull();
  });
});

describe('saveDone', () => {
  it('round-trips through save then load', () => {
    const storage = fakeStorage();
    const done = { ts: { 1: true }, js: {} };
    saveDone(done, storage);
    expect(loadDone(storage)).toEqual(done);
  });

  it('does not throw if setItem itself throws (e.g. quota exceeded)', () => {
    const storage = { setItem: () => { throw new Error('quota'); } };
    expect(() => saveDone({ ts: {}, js: {} }, storage)).not.toThrow();
  });
});
