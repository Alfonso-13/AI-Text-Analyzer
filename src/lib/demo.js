import { analysisResponseSchema } from '../../shared/analysis.js';

const categoryTerms = {
  tecnología: ['tecnología', 'software', 'aplicación', 'digital', 'datos', 'equipo', 'internet', 'código'],
  deportes: ['deporte', 'partido', 'equipo', 'torneo', 'jugador', 'carrera'],
  política: ['gobierno', 'política', 'congreso', 'elección', 'ley', 'propuesta'],
  entretenimiento: ['película', 'música', 'serie', 'festival', 'estreno', 'artista'],
  ciencia: ['ciencia', 'estudio', 'investigación', 'experimento', 'evidencia', 'laboratorio'],
  negocios: ['empresa', 'negocio', 'ventas', 'mercado', 'cliente', 'inversión'],
};
const positiveTerms = ['mejor', 'beneficio', 'éxito', 'positivo', 'ayudó', 'celebró', 'avance'];
const negativeTerms = ['problema', 'error', 'riesgo', 'negativo', 'falló', 'crisis', 'pérdida'];
const stopWords = new Set(['para', 'como', 'este', 'esta', 'estos', 'estas', 'desde', 'hasta', 'sobre', 'entre', 'también', 'pero', 'porque', 'donde', 'cuando', 'quien', 'todo', 'toda', 'todos', 'todas', 'unos', 'unas', 'del', 'las', 'los', 'una', 'con', 'por', 'que', 'sus', 'sin', 'más', 'fue', 'son', 'han', 'y', 'o', 'de', 'la', 'el', 'en', 'un', 'se', 'a']);

function includesTerm(text, term) {
  return text.includes(term);
}

function detectCategory(text) {
  let best = { category: 'otro', score: 0 };
  for (const [category, terms] of Object.entries(categoryTerms)) {
    const score = terms.filter(term => includesTerm(text, term)).length;
    if (score > best.score) best = { category, score };
  }
  return best.category;
}

function extractKeywords(text) {
  const counts = new Map();
  const words = text.toLocaleLowerCase('es-MX').match(/[\p{L}\p{N}]+/gu) ?? [];
  for (const word of words) {
    if (word.length < 4 || stopWords.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  const keywords = [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([word]) => word);
  return keywords.length ? keywords : ['demostración'];
}

export function createDemoAnalysis(rawText, analyzedAt = new Date().toISOString()) {
  const text = rawText.trim().replace(/\s+/g, ' ');
  const normalized = text.toLocaleLowerCase('es-MX');
  const positiveScore = positiveTerms.filter(term => includesTerm(normalized, term)).length;
  const negativeScore = negativeTerms.filter(term => includesTerm(normalized, term)).length;
  const sentiment = positiveScore > negativeScore ? 'positive' : negativeScore > positiveScore ? 'negative' : 'neutral';
  const excerpt = text.length > 230 ? `${text.slice(0, 227).trimEnd()}…` : text;

  return analysisResponseSchema.parse({
    summary: `Vista simulada: ${excerpt}`,
    sentiment,
    language: /[áéíóúñ¿¡]|\b(el|la|los|las|de|que|una|para)\b/i.test(text) ? 'es' : 'und',
    keywords: extractKeywords(text),
    category: detectCategory(normalized),
    analyzedAt,
  });
}
