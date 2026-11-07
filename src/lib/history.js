import { z } from 'zod';
import { analysisResponseSchema, MAX_TEXT_LENGTH } from '../../shared/analysis.js';

export const HISTORY_STORAGE_KEY = 'texta.analysis-history.v1';
export const HISTORY_LIMIT = 500;
const historyRecordSchema = analysisResponseSchema.extend({
  sourceText: z.string().max(MAX_TEXT_LENGTH).optional(),
  simulated: z.boolean().optional(),
}).strict();

export function readHistory(storage) {
  if (!storage) return [];

  try {
    const parsed = JSON.parse(storage.getItem(HISTORY_STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    // localStorage is user-controlled; discard malformed or obsolete records on every read.
    return parsed
      .map(item => historyRecordSchema.safeParse(item))
      .filter(result => result.success)
      .map(result => result.data)
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function addToHistory(storage, record) {
  const validRecord = historyRecordSchema.parse(record);
  // Production records contain only the result; demo records may also include their predefined sample text.
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
