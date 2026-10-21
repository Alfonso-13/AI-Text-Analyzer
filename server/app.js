import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { inputSchema, analysisSchema } from '../shared/analysis.js';
import { AppError } from './errors.js';

export function createApp({ analyze, rateLimitMax = 20, distPath = resolve('dist') } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: { directives: { 'style-src': ["'self'", "'unsafe-inline'"] } } }));
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/analyze', rateLimit({ windowMs: 60000, limit: rateLimitMax, standardHeaders: 'draft-8', legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error: { code: 'RATE_LIMIT', message: 'Demasiadas solicitudes. Espera un minuto.' } }) }));
  app.post('/api/analyze', (req, _res, next) => {
    if (!req.is('application/json')) return next(new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Envía el cuerpo como application/json.'));
    next();
  }, express.json({ limit: '100kb' }), async (req, res) => {
    const parsed = inputSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, 'INVALID_TEXT', 'Ingresa un texto de entre 1 y 12,000 caracteres.');
    const result = await analyze(parsed.data.text);
    const checked = analysisSchema.safeParse(result);
    if (!checked.success) throw new AppError(502, 'INVALID_ANALYSIS', 'El proveedor devolvió un análisis inválido.');
    res.json(checked.data);
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint no encontrado.' } }));
  if (existsSync(resolve(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.get('/', (_req, res) => res.sendFile(resolve(distPath, 'index.html')));
  }
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.too.large') return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'El texto enviado es demasiado grande.' } });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'El cuerpo JSON no es válido.' } });
    const known = err instanceof AppError;
    res.status(known ? err.status : 500).json({ error: { code: known ? err.code : 'INTERNAL_ERROR', message: known ? err.message : 'No fue posible completar el análisis.' } });
  });
  return app;
}
