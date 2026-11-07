import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoAnalysis } from '../src/lib/demo.js';

test('la demo genera un resultado local válido y determinista sin proveedor', () => {
  const analyzedAt = '2026-11-06T18:00:00.000Z';
  const result = createDemoAnalysis('La aplicación digital ayudó al equipo y representó un avance positivo.', analyzedAt);

  assert.equal(result.category, 'tecnología');
  assert.equal(result.sentiment, 'positive');
  assert.equal(result.language, 'es');
  assert.equal(result.analyzedAt, analyzedAt);
  assert.match(result.summary, /^Vista simulada:/);
  assert.ok(result.keywords.length >= 1 && result.keywords.length <= 5);
});
