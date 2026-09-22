import type { TrailKey } from './trails';

const DONE_KEY = 'typetrail:done';

export type DoneState = Record<TrailKey, Record<number, boolean>>;

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

function isDoneState(v: unknown): v is DoneState {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (['ts', 'js'] as TrailKey[]).every((k) => typeof o[k] === 'object' && o[k] !== null);
}

/** Reads saved per-trail chapter-completion state. Returns null if there's nothing saved, or it's unreadable/malformed. */
export function loadDone(storage: ReadableStorage = localStorage): DoneState | null {
  try {
    const raw = storage.getItem(DONE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isDoneState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Persists per-trail chapter-completion state. Silently no-ops if storage is unavailable (private browsing, quota, ...). */
export function saveDone(done: DoneState, storage: WritableStorage = localStorage): void {
  try {
    storage.setItem(DONE_KEY, JSON.stringify(done));
  } catch {
    // progress just won't survive a reload this time; not worth surfacing to the user.
  }
}
