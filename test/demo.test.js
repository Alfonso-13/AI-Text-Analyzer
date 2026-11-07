import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoAnalysis } from '../src/lib/demo.js';

test('la demo devuelve el mock exacto asociado a un ejemplo', () => {
  const analyzedAt = '2026-11-06T18:00:00.000Z';
  const text = '¡Por fin terminé mi primer proyecto de programación! Hubo muchos errores en el camino, pero ver la aplicación funcionando hizo que todo valiera la pena. Gracias a quienes me ayudaron a no rendirme.';
  const result = createDemoAnalysis(text, analyzedAt);

  assert.equal(result.category, 'tecnología');
  assert.equal(result.sentiment, 'positive');
  assert.equal(result.language, 'es');
  assert.equal(result.analyzedAt, analyzedAt);
  assert.match(result.summary, /primer proyecto de programación/);
  assert.deepEqual(result.keywords, ['programación', 'proyecto', 'aplicación', 'aprendizaje']);
});

test('la demo rechaza texto libre sin un mock asociado', () => {
  assert.throws(() => createDemoAnalysis('Texto escrito manualmente'), /Selecciona uno de los ejemplos/);
});
