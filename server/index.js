import { createApp } from './app.js';
import { createGeminiAnalyzer } from './gemini.js';
const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un puerto válido.');
const app = createApp({ analyze: createGeminiAnalyzer({ apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || undefined }) });
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Texta: http://127.0.0.1:${port}`);
  if (!process.env.GEMINI_API_KEY) console.warn('Falta GEMINI_API_KEY. Configura .env para analizar textos.');
});
server.on('error', (error) => { console.error(`No se pudo iniciar el servidor (${error.code}).`); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(() => process.exit(0));
  server.closeAllConnections();
});
