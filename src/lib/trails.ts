import { DATA } from './data';
import { JS_DATA } from './jsData';
import type { Chapter } from './types';
import type { ThemeKey } from './theme';

export type TrailKey = 'ts' | 'js';

export interface TrailDef {
  key: TrailKey;
  label: string;
  badge: string;
  theme: ThemeKey;
  chapters: Chapter[];
}

export const TRAILS: Record<TrailKey, TrailDef> = {
  ts: { key: 'ts', label: 'TypeTrail', badge: 'TT', theme: 'TSブルー', chapters: DATA },
  js: { key: 'js', label: 'JSTrail', badge: 'JS', theme: 'JSイエロー', chapters: JS_DATA },
};

export const TRAIL_KEYS = Object.keys(TRAILS) as TrailKey[];
