import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readAppConfig() {
  const config = JSON.parse(readFileSync(resolve('app.config.json'), 'utf8'));
  if (!['production', 'demo'].includes(config.mode)) throw new Error('app.config.json: mode debe ser production o demo.');
  if (typeof config.base !== 'string' || !config.base.startsWith('/') || !config.base.endsWith('/')) throw new Error('app.config.json: base debe iniciar y terminar con /.');
  if (typeof config.siteUrl !== 'string') throw new Error('app.config.json: siteUrl debe ser texto.');
  return config;
}

export default defineConfig(({ mode }) => {
  const appConfig = readAppConfig();
  const isDemo = appConfig.mode === 'demo';
  const base = appConfig.base;
  // This is the only optional public setting read by the HTML transform.
  // Never expose the entire environment through define() or envPrefix.
  const siteUrl = appConfig.siteUrl || process.env.SITE_URL || loadEnv(mode, process.cwd(), 'SITE_URL').SITE_URL;
  let origin;
  if (siteUrl?.trim()) {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error();
      origin = parsed.origin;
    } catch { throw new Error('SITE_URL debe ser un origen HTTPS sin credenciales, ruta, query ni fragmento.'); }
  }
  const publicUrl = origin ? new URL(base, `${origin}/`).href : undefined;
  return {
    base,
    define: { 'import.meta.env.VITE_APP_MODE': JSON.stringify(appConfig.mode) },
    plugins: [svelte(), {
      name: 'texta-presentation-metadata',
      enforce: 'post',
      transformIndexHtml(html) {
        if (!publicUrl) return html;
        let transformed = html
          .replace(/content="[^"]*social-card\.png"/g, `content="${publicUrl}social-card.png"`)
          .replace('</head>', `    <link rel="canonical" href="${publicUrl}" />\n    <meta property="og:url" content="${publicUrl}" />\n  </head>`);
        if (isDemo) {
          transformed = transformed
            .replace(`${base}site.webmanifest`, `${base}site-demo.webmanifest`)
            .replace('<title>Texta | Analizador de texto con IA: resumen y sentimiento</title>', '<title>Texta | Demo interactiva sin IA</title>')
            .replace('Convierte artículos, posts e ideas en claridad con Texta. Obtén resumen, sentimiento, idioma, palabras clave y categoría con inteligencia artificial.', 'Recorre el flujo de Texta con resultados simulados localmente. Sin Gemini, API key ni datos enviados fuera del navegador.')
            .replace('Resume y analiza el sentimiento, idioma, palabras clave y categoría de tus textos con IA.', 'Prueba la interfaz de Texta mediante una simulación local, sin usar IA ni enviar información.')
            .replace('Texta | Analizador de texto con IA', 'Texta | Demo interactiva sin IA')
            .replace('Del texto a lo esencial: resumen, sentimiento, idioma y palabras clave.', 'Explora el flujo visual de Texta con resultados simulados dentro de tu navegador.');
        }
        return transformed;
      },
    }],
    server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3001' } },
  };
});
