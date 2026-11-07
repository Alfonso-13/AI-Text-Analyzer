import samples from '../data/sample-texts.json' with { type: 'json' };
import { analysisResponseSchema } from '../../shared/analysis.js';

const mockByText = new Map(samples.map(sample => [sample.text, sample.analysis]));

export function createDemoAnalysis(text, analyzedAt = new Date().toISOString()) {
  const mock = mockByText.get(text);
  if (!mock) throw new Error('Selecciona uno de los ejemplos disponibles para ejecutar la demo.');
  return analysisResponseSchema.parse({ ...mock, analyzedAt });
}
