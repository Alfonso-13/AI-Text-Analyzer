import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { analysisSchema, analysisResponseSchema, MAX_TEXT_LENGTH } from '../shared/analysis.js';
import { addToHistory, HISTORY_LIMIT, HISTORY_STORAGE_KEY, readHistory, summarizeHistory } from '../src/lib/history.js';
import { pickSample, sampleKinds } from '../src/lib/samples.js';
import samples from '../src/data/sample-texts.json' with { type: 'json' };

const content = {
  summary: 'Apple presentó el iPhone 17 con mejoras de cámara y rendimiento.',
  sentiment: 'positive',
  language: 'es',
  keywords: ['Apple', 'iPhone 17'],
  category: 'tecnología',
};
const response = { ...content, analyzedAt: '2026-10-21T20:24:21.858Z' };

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('El cliente acepta analyzedAt sin incluirlo en el contrato de Gemini', () => {
  assert.deepEqual(analysisResponseSchema.parse(response), response);
  assert.equal(analysisSchema.safeParse(response).success, false);
  assert.equal(analysisResponseSchema.safeParse({ ...response, analyzedAt: 'fecha inválida' }).success, false);
});

test('El historial se guarda solo en el almacenamiento del navegador', async () => {
  const app = createApp({ analyze: async () => content, distPath: 'nonexistent-test-dist' });
  const result = await request(app).post('/api/analyze').send({ text: 'Texto original privado' }).expect(200);

  await request(app).get('/api/history').expect(404);
  await request(app).get('/api/summary').expect(404);

  const storage = createStorage();
  assert.deepEqual(addToHistory(storage, result.body), [result.body]);
  assert.ok(!storage.getItem(HISTORY_STORAGE_KEY).includes('Texto original privado'));
});

test('Cada almacenamiento conserva un historial aislado y persistente', () => {
  const firstBrowser = createStorage();
  const secondBrowser = createStorage();

  addToHistory(firstBrowser, response);

  assert.deepEqual(readHistory(firstBrowser), [response]);
  assert.deepEqual(readHistory(secondBrowser), []);
});

test('La demo conserva la consulta de ejemplo junto con su respuesta mock', () => {
  const storage = createStorage();
  const demoRecord = { ...response, sourceText: 'Consulta de ejemplo', simulated: true };

  assert.deepEqual(addToHistory(storage, demoRecord), [demoRecord]);
  assert.deepEqual(readHistory(storage), [demoRecord]);
  assert.match(storage.getItem(HISTORY_STORAGE_KEY), /Consulta de ejemplo/);
});

test('El historial ignora datos inválidos y se limita a 500 registros', () => {
  const storage = createStorage();
  storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([{ ...response, sentiment: 'inventado' }, response]));
  assert.deepEqual(readHistory(storage), [response]);

  for (let index = 0; index <= HISTORY_LIMIT; index++) {
    addToHistory(storage, { ...response, summary: `Análisis ${index}` });
  }

  const history = readHistory(storage);
  assert.equal(history.length, HISTORY_LIMIT);
  assert.equal(history[0].summary, `Análisis ${HISTORY_LIMIT}`);
  assert.equal(history.at(-1).summary, 'Análisis 1');
});

test('El resumen se calcula con el historial local válido', () => {
  const items = [
    response,
    { ...response, summary: 'Segundo', category: 'ciencia' },
    { ...response, summary: 'Tercero' },
  ];
  assert.deepEqual(summarizeHistory(items), { tecnología: 2, ciencia: 1 });
});

test('Un almacenamiento corrupto se recupera como historial vacío', () => {
  const storage = createStorage();
  storage.setItem(HISTORY_STORAGE_KEY, '{texto inválido');
  assert.deepEqual(readHistory(storage), []);
});

test('Textos aleatorios están disponibles por tipo sin red y sin repetición inmediata', () => {
  for (const kind of sampleKinds) {
    const pool = samples.filter(item => item.kind === kind.id);
    assert.ok(pool.length >= 3);
    const first = pickSample(kind.id, '', () => 0);
    const second = pickSample(kind.id, first, () => 0);
    assert.notEqual(first, second);
    assert.ok(pool.some(item => item.text === first));
  }
  assert.equal(pickSample('desconocido'), null);
  assert.equal(new Set(samples.map(item => item.text)).size, samples.length);
  for (const sample of samples) {
    assert.ok(sample.text.length > 0 && sample.text.length <= MAX_TEXT_LENGTH);
    assert.equal(analysisSchema.safeParse(sample.analysis).success, true);
  }
});
