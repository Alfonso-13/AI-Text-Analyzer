import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { analysisSchema, analysisResponseSchema, historyPageSchema, summarySchema, MAX_TEXT_LENGTH } from '../shared/analysis.js';
import { pickSample, sampleKinds } from '../src/lib/samples.js';
import samples from '../src/data/sample-texts.json' with { type: 'json' };

const content = { summary: 'Apple presentó el iPhone 17 con mejoras de cámara y rendimiento.', sentiment: 'positive', language: 'es', keywords: ['Apple', 'iPhone 17'], category: 'tecnología' };
const create = (options = {}) => createApp({ analyze: async text => ({ ...content, summary: text }), distPath: 'nonexistent-test-dist', ...options });
const post = (app, text) => request(app).post('/api/analyze').send({ text }).expect(200);

test('Regresión: el cliente acepta analyzedAt sin incluirlo en el contrato de Gemini', () => {
  const response = { ...content, analyzedAt: '2026-10-21T20:24:21.858Z' };
  assert.deepEqual(analysisResponseSchema.parse(response), response);
  assert.equal(analysisSchema.safeParse(response).success, false);
  assert.equal(analysisResponseSchema.safeParse({ ...response, analyzedAt: 'fecha inválida' }).success, false);
  assert.equal(analysisResponseSchema.safeParse({ ...response, sentiment: 'inventado' }).success, false);
});
test('Regresión: acepta el texto citado con prefijo markdown y guarda el resultado', async () => {
  const app = create();
  const text = '> "Apple presentó hoy el iPhone 17 con una cámara revolucionaria de 200MP y un chip A19 que promete el doble de rendimiento. Los analistas esperan que las ventas superen los 100 millones de unidades en el primer trimestre."\n';
  const response = await post(app, text);
  assert.equal(analysisResponseSchema.parse(response.body).summary, text.trim());
  const history = await request(app).get('/api/history?limit=10').expect(200);
  assert.deepEqual(historyPageSchema.parse(history.body).items, [response.body]);
});
test('Historial y resumen vacíos tienen contratos válidos', async () => {
  const app = create();
  const history = await request(app).get('/api/history?limit=10').expect(200);
  assert.deepEqual(historyPageSchema.parse(history.body), { items: [], nextCursor: null, hasMore: false });
  const summary = await request(app).get('/api/summary').expect(200);
  assert.deepEqual(summarySchema.parse(summary.body), {});
});
test('Paginación mantiene orden, no duplica registros y funciona con nuevas inserciones', async () => {
  const app = create();
  for (let i = 1; i <= 12; i++) await post(app, `Texto ${i}`);
  const first = historyPageSchema.parse((await request(app).get('/api/history?limit=10').expect(200)).body);
  assert.equal(first.items.length, 10);
  assert.equal(first.items[0].summary, 'Texto 12');
  assert.equal(first.items.at(-1).summary, 'Texto 3');
  assert.equal(first.hasMore, true);
  await post(app, 'Nuevo mientras se pagina');
  const next = historyPageSchema.parse((await request(app).get(`/api/history?limit=10&before=${first.nextCursor}`).expect(200)).body);
  assert.deepEqual(next.items.map(item => item.summary), ['Texto 2', 'Texto 1']);
  assert.equal(next.hasMore, false);
  assert.equal(next.nextCursor, null);
  const legacy = await request(app).get('/api/history').expect(200);
  assert.equal(Array.isArray(legacy.body), true);
  assert.equal(legacy.body[0].summary, 'Nuevo mientras se pagina');
});
for (const query of ['limit=0', 'limit=51', 'limit=-1', 'limit=1.5', 'limit=abc', 'limit=10&before=x', 'limit=10&before=-1', 'limit=10&before=9007199254740992', 'limit=1&limit=2']) {
  test(`Historial rechaza paginación inválida: ${query}`, async () => { await request(create()).get(`/api/history?${query}`).expect(400); });
}
test('Resumen cuenta categorías y no registra análisis fallidos', async () => {
  const app = create({ analyze: async text => text === 'fallo' ? { ...content, sentiment: 'inválido' } : { ...content, category: text === 'ciencia' ? 'ciencia' : 'tecnología' } });
  await post(app, 'uno'); await post(app, 'dos'); await post(app, 'ciencia');
  await request(app).post('/api/analyze').send({ text: 'fallo' }).expect(502);
  const response = await request(app).get('/api/summary').expect(200);
  assert.deepEqual(summarySchema.parse(response.body), { tecnología: 2, ciencia: 1 });
  assert.equal(response.headers['cache-control'], 'no-store');
});
test('Historial no persiste entre instancias y no expone el texto original', async () => {
  const app = create({ analyze: async () => content });
  await post(app, 'Texto original privado');
  const history = await request(app).get('/api/history?limit=10').expect(200);
  assert.ok(!JSON.stringify(history.body).includes('Texto original privado'));
  const other = await request(create()).get('/api/history?limit=10').expect(200);
  assert.equal(other.body.items.length, 0);
});
test('Historial se limita a 500 registros y el resumen usa los registros retenidos', async () => {
  const app = create({ rateLimitMax: 600 });
  for (let i = 1; i <= 501; i++) await post(app, `Texto ${i}`);
  const summary = await request(app).get('/api/summary').expect(200);
  assert.equal(summary.body.tecnología, 500);
  const last = await request(app).get('/api/history?limit=50&before=3').expect(200);
  assert.deepEqual(last.body.items.map(item => item.summary), ['Texto 2']);
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
  for (const sample of samples) assert.ok(sample.text.length > 0 && sample.text.length <= MAX_TEXT_LENGTH);
});
