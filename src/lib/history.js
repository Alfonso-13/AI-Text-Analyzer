import { analysisResponseSchema } from '../../shared/analysis.js';

export const HISTORY_STORAGE_KEY = 'texta.analysis-history.v1';
export const HISTORY_LIMIT = 500;

export function readHistory(storage) {
  if (!storage) return [];

  try {
    const parsed = JSON.parse(storage.getItem(HISTORY_STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    // localStorage is user-controlled; discard malformed or obsolete records on every read.
    return parsed
      .map(item => analysisResponseSchema.safeParse(item))
      .filter(result => result.success)
      .map(result => result.data)
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function addToHistory(storage, record) {
  const validRecord = analysisResponseSchema.parse(record);
  // Keep the newest validated results only; raw input text is intentionally never persisted.
  const next = [validRecord, ...readHistory(storage)].slice(0, HISTORY_LIMIT);
  storage?.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function summarizeHistory(items) {
  return items.reduce((summary, item) => {
    summary[item.category] = (summary[item.category] || 0) + 1;
    return summary;
  }, {});
}
