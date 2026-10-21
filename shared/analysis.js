import { z } from 'zod';
export const MAX_TEXT_LENGTH = 12000;
export const categories = ['tecnología', 'deportes', 'política', 'entretenimiento', 'ciencia', 'negocios', 'otro'];
export const analysisSchema = z.object({
  summary: z.string().trim().min(1).max(1500),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  language: z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/),
  keywords: z.array(z.string().trim().min(1).max(100)).min(1).max(10),
  category: z.enum(categories),
}).strict();
// Gemini only generates content; the API adds its own trusted metadata.
export const analysisResponseSchema = analysisSchema.extend({ analyzedAt: z.iso.datetime() });
export const historyPageSchema = z.object({
  items: z.array(analysisResponseSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
}).strict();
export const summarySchema = z.partialRecord(z.enum(categories), z.number().int().nonnegative());
export const inputSchema = z.object({ text: z.string().max(MAX_TEXT_LENGTH).trim().min(1) }).strict();
