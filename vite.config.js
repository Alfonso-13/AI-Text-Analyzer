import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig(({ mode }) => {
  // This is the only optional public setting read by the HTML transform.
  // Never expose the entire environment through define() or envPrefix.
  const siteUrl = process.env.SITE_URL ?? loadEnv(mode, process.cwd(), 'SITE_URL').SITE_URL;
  let origin;
  if (siteUrl?.trim()) {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error();
      origin = parsed.origin;
    } catch { throw new Error('SITE_URL debe ser un origen HTTPS sin credenciales, ruta, query ni fragmento.'); }
  }
  return {
    plugins: [svelte(), {
      name: 'texta-presentation-metadata',
      transformIndexHtml(html) {
        if (!origin) return html;
        return html.replaceAll('content="/social-card.png"', `content="${origin}/social-card.png"`)
          .replace('</head>', `    <link rel="canonical" href="${origin}/" />\n    <meta property="og:url" content="${origin}/" />\n  </head>`);
      },
    }],
    server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3001' } },
  };
});
