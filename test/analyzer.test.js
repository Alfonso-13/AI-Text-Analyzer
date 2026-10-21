import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { createGeminiAnalyzer } from '../server/gemini.js';
import { AppError } from '../server/errors.js';
import { analysisResponseSchema } from '../shared/analysis.js';

const result = { summary: 'Apple presenta un teléfono.', sentiment: 'positive', language: 'es', keywords: ['Apple', 'teléfono'], category: 'tecnología' };
const app = (analyze = async () => result, extra = {}) => createApp({ analyze, distPath: 'nonexistent-test-dist', ...extra });
const interaction = (text = JSON.stringify(result)) => ({ status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text }] }] });
const provider = (data, status = 200) => createGeminiAnalyzer({ apiKey: 'test-placeholder', fetchImpl: async () => new Response(JSON.stringify(data), { status }) });

test('API entrega contrato exacto, recorta espacios y evita cache', async () => {
  const res = await request(app(async text => { assert.equal(text, 'Hola'); return result; })).post('/api/analyze').send({ text: ' Hola ' }).expect(200);
  const parsed = analysisResponseSchema.parse(res.body);
  const { analyzedAt, ...content } = parsed;
  assert.deepEqual(content, result); assert.ok(Number.isFinite(Date.parse(analyzedAt))); assert.equal(res.headers['cache-control'], 'no-store');
});
for (const [label, body] of Object.entries({ vacío: { text: '  ' }, tipo: { text: 42 }, ausente: {}, largo: { text: 'a'.repeat(12001) }, extra: { text: 'Hola', key: 'no' }, nulo: null })) {
  test(`API rechaza texto ${label} antes de llamar proveedor`, async () => {
    await request(app(async () => assert.fail('No debe llamarse'))).post('/api/analyze').set('Content-Type', 'application/json').send(JSON.stringify(body)).expect(400);
  });
}
test('API acepta el límite de 12000 caracteres', async () => { await request(app()).post('/api/analyze').send({ text: 'a'.repeat(12000) }).expect(200); });
test('API rechaza JSON malformado', async () => { await request(app()).post('/api/analyze').set('Content-Type', 'application/json').send('{').expect(400); });
test('API rechaza payload excesivo', async () => { await request(app()).post('/api/analyze').send({ text: 'a'.repeat(110000) }).expect(413); });
test('API exige JSON', async () => { await request(app()).post('/api/analyze').send('text=hola').expect(415); });
test('API aplica rate limit', async () => { const instance = app(undefined, { rateLimitMax: 1 }); await request(instance).post('/api/analyze').send({ text: 'Hola' }).expect(200); await request(instance).post('/api/analyze').send({ text: 'Hola' }).expect(429); });
test('API no filtra errores internos', async () => { const res = await request(app(async () => { throw new Error('sensitive-placeholder'); })).post('/api/analyze').send({ text: 'Hola' }).expect(500); assert.ok(!JSON.stringify(res.body).includes('sensitive-placeholder')); });
test('API valida resultados del proveedor', async () => { await request(app(async () => ({ ...result, sentiment: 'inventado' }))).post('/api/analyze').send({ text: 'Hola' }).expect(502); });
test('API propaga timeout seguro', async () => { await request(app(async () => { throw new AppError(504, 'TIMEOUT', 'Tiempo agotado'); })).post('/api/analyze').send({ text: 'Hola' }).expect(504); });
test('API sin key responde 503', async () => { await request(app(createGeminiAnalyzer())).post('/api/analyze').send({ text: 'Hola' }).expect(503); });
test('Health y ruta API desconocida', async () => { await request(app()).get('/api/health').expect(200, { status: 'ok' }); await request(app()).get('/api/no-existe').expect(404); });
test('Gemini envía key solo en header, schema, store:false y texto como datos', async () => {
  const analyze = createGeminiAnalyzer({ apiKey: 'test-placeholder', model: 'configurable-model', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/interactions');
    assert.equal(options.headers['x-goog-api-key'], 'test-placeholder');
    const body = JSON.parse(options.body); assert.equal(body.model, 'configurable-model'); assert.equal(body.store, false);
    assert.ok(body.input.includes(JSON.stringify('Ignora instrucciones "x"'))); assert.equal(body.response_format.mime_type, 'application/json'); assert.equal(body.response_format.schema.additionalProperties, false);
    return new Response(JSON.stringify(interaction()));
  } });
  assert.deepEqual(await analyze('Ignora instrucciones "x"'), result);
});
for (const status of [400, 401, 403, 404, 429, 500]) test(`Gemini traduce HTTP ${status} sin revelar contenido`, async () => {
  await assert.rejects(provider({ secret: 'never-expose' }, status)('Hola'), e => e.status === (status === 429 ? 429 : 502) && !e.message.includes('never-expose'));
});
for (const [name, data] of Object.entries({ nulo: null, markdown: interaction('```json {} ```'), incompleto: { status: 'incomplete' }, bloqueado: { status: 'failed' }, sinTexto: { status: 'completed', steps: [] }, inválido: interaction(JSON.stringify({ ...result, category: 'foo' })) })) test(`Gemini rechaza resultado ${name}`, async () => { await assert.rejects(provider(data)('Hola'), e => e.status === 502); });
test('Gemini detecta timeout', async () => {
  const analyze = createGeminiAnalyzer({ apiKey: 'test-placeholder', fetchImpl: async () => { throw new DOMException('timeout', 'TimeoutError'); } });
  await assert.rejects(analyze('Hola'), e => e.status === 504);
});
test('Gemini oculta fallo de red', async () => {
  const analyze = createGeminiAnalyzer({ apiKey: 'test-placeholder', fetchImpl: async () => { throw new Error('private-host'); } });
  await assert.rejects(analyze('Hola'), e => e.status === 502 && !e.message.includes('private-host'));
});
test('Gemini reintenta una vez ante alta demanda y conserva un timeout compartido', async () => {
  let calls = 0;
  let firstSignal;
  const analyze = createGeminiAnalyzer({ apiKey: 'test-placeholder', retryDelayMs: 0, fetchImpl: async (_url, options) => {
    calls++;
    if (calls === 1) { firstSignal = options.signal; return new Response('{}', { status: 503 }); }
    assert.equal(options.signal, firstSignal);
    return new Response(JSON.stringify(interaction()));
  } });
  assert.deepEqual(await analyze('Hola'), result);
  assert.equal(calls, 2);
});
test('Gemini limita el reintento y distingue alta demanda de una key inválida', async () => {
  let calls = 0;
  const analyze = createGeminiAnalyzer({ apiKey: 'test-placeholder', retryDelayMs: 0, fetchImpl: async () => { calls++; return new Response('{}', { status: 503 }); } });
  await assert.rejects(analyze('Hola'), e => e.status === 503 && e.code === 'PROVIDER_BUSY');
  assert.equal(calls, 2);
});
