import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readAppConfig() {
  const config = JSON.parse(readFileSync(resolve('app.config.json'), 'utf8'));
  if (config.mode !== 'production') throw new Error('app.config.json: el modo predeterminado debe ser production.');
  if (typeof config.base !== 'string' || !config.base.startsWith('/') || !config.base.endsWith('/')) throw new Error('app.config.json: base debe iniciar y terminar con /.');
  if (typeof config.siteUrl !== 'string') throw new Error('app.config.json: siteUrl debe ser texto.');
  if (!config.demo || typeof config.demo.base !== 'string' || !config.demo.base.startsWith('/') || !config.demo.base.endsWith('/')) throw new Error('app.config.json: demo.base debe iniciar y terminar con /.');
  if (typeof config.demo.siteUrl !== 'string') throw new Error('app.config.json: demo.siteUrl debe ser texto.');
  return config;
}

export default defineConfig(({ mode }) => {
  const config = readAppConfig();
  // `vite --mode demo` selects the public mock profile without editing or duplicating source branches.
  const isDemo = mode === 'demo';
  const appMode = isDemo ? 'demo' : config.mode;
  const appConfig = isDemo ? config.demo : config;
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
    define: { 'import.meta.env.VITE_APP_MODE': JSON.stringify(appMode) },
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
            .replace('<title>Texta | AI text analyzer: summary and sentiment</title>', '<title>Texta | Interactive demo without AI</title>')
            .replace('Turn articles, posts, and ideas into clarity with Texta. Get a Spanish summary, sentiment, detected language, keywords, and category through AI.', 'Explore the complete Texta flow with local mock responses. No Gemini, API key, or data sent outside the browser.')
            .replace('Summarize and analyze sentiment, language, keywords, and category with AI.', 'Try the Texta interface through a local simulation without AI or external data transfer.')
            .replace('Texta | AI text analyzer', 'Texta | Interactive demo without AI')
            .replace('From text to essentials: summary, sentiment, language, and keywords.', 'Explore the Texta product flow with responses simulated inside your browser.');
        }
        return transformed;
      },
    }],
    server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3001' } },
  };
});
