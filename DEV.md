# Guía técnica de Texta

## Arquitectura

```mermaid
flowchart LR
  Browser[Navegador · Svelte] -->|POST /api/analyze| API[Express]
  API -->|Interactions API| Gemini[Google Gemini]
  Gemini --> API
  API -->|resultado validado| Browser
  Browser -->|solo resultado| Storage[(localStorage)]
```

El frontend y el backend viven en el mismo repositorio. En desarrollo Vite atiende en `127.0.0.1:5173` y envía `/api` a Express en `127.0.0.1:3001`. En modo compilado Express sirve `dist/`.

El build admite dos recorridos desde el mismo código:

```mermaid
flowchart LR
  Production[production] --> API[Express + Gemini]
  Demo[demo] --> Mocks[Ejemplos y respuestas mock]
  API --> Result[Resultado validado]
  Mocks --> Result
  Result --> Storage[(localStorage)]
```

## Configuración

Copia `.env.example` como `.env` sin sobrescribir una configuración existente:

```dotenv
GEMINI_API_KEY=tu_key_aqui
GEMINI_MODEL=gemini-3.5-flash
PORT=3001
SITE_URL=
```

| Variable | Alcance | Predeterminado |
| --- | --- | --- |
| `GEMINI_API_KEY` | Secreto obligatorio para análisis reales; solo backend | Sin valor |
| `GEMINI_MODEL` | Modelo compatible con Interactions y JSON Schema | `gemini-3.5-flash` |
| `PORT` | Puerto del servidor compilado | `3001` |
| `SITE_URL` | Origen HTTPS público para canonical y Open Graph al compilar | Vacío |

La key se lee en `server/index.js` y se envía a Google en el header `x-goog-api-key`. Nunca debe convertirse en una variable `VITE_`.

`app.config.json` contiene la configuración pública de ambos perfiles:

| Campo | Producción | Demo |
| --- | --- | --- |
| Selector | predeterminado (`mode: production`) | `vite --mode demo` |
| `base` | `/` | `/AI-Text-Analyzer/` |
| `siteUrl` | vacío o definido por `SITE_URL` | `https://alfonso-13.github.io` |

No contiene secretos. El perfil demo se encuentra en la propiedad `demo`; desactiva el editor libre y reemplaza la llamada a `/api/analyze` por la respuesta mock asociada al ejemplo seleccionado. También cambia los avisos de la interfaz para evitar presentarla como IA real.

## Comandos

Selecciona primero la versión documentada del proyecto:

```powershell
nvm list
nvm use 24.19.0
node --version
```

El resultado debe comenzar con `v24`. Después usa el script local recomendado:

```powershell
.\run-local.ps1             # Vite + Express en desarrollo
.\run-local.ps1 -Verify     # verificación completa
.\run-local.ps1 -Production # build + servidor local de producción
```

El script valida Node 24, crea `.env` desde la plantilla cuando falta e instala dependencias si todavía no existe `node_modules`. No cambia la versión de NVM automáticamente.

Comandos npm equivalentes:

```powershell
npm run dev             # Vite + Express en desarrollo
npm run build           # compila el modo definido en app.config.json
npm run build:demo      # compila el demo estático con mocks
npm start               # sirve dist y API desde Express
npm run check           # diagnósticos Svelte
npm test                # pruebas sin llamadas externas
npm run audit:secrets   # árbol, historial Git y dist
npm run verify          # check + test + build + auditoría
npm run verify:demo     # check + test + build demo + auditoría
```

`run-local.ps1` ofrece los modos equivalentes normal, `-Production` y `-Verify`. Los procesos se enlazan únicamente a loopback.

### Demo estática de GitHub Pages

La aplicación soporta `production` y `demo` desde el mismo código y desde la misma rama `main`. `app.config.json` conserva producción como valor predeterminado y define el perfil público del demo. `npm run build:demo` selecciona ese perfil sin editar archivos. En `demo`, el usuario solo puede seleccionar ejemplos ficticios precargados. Después de una espera de 1.4 segundos, el navegador devuelve la respuesta mock exacta asociada al ejemplo; no ejecuta heurísticas ni llama a Gemini.

`npm run build:demo` genera `dist/`, y esos archivos compilados se publican en la raíz de la rama `gh-pages`. En **Settings > Pages** la fuente debe ser **Deploy from a branch**, rama `gh-pages`, carpeta `/(root)`. `gh-pages` es un artefacto de publicación; el código editable permanece únicamente en `main`.

Para revisar el build público localmente desde `main`:

```powershell
npm ci
npm run build:demo
npx vite preview --host 127.0.0.1
```

La demo guarda en `localStorage` el ejemplo consultado y su respuesta mock para que Historial y Resumen sean navegables. No consume cuota y no debe utilizarse para evaluar la calidad de un análisis de IA. Este comportamiento es exclusivo del modo demo; en producción el historial conserva solo el resultado validado y no el texto original.

## Contrato de análisis

`POST /api/analyze` requiere `Content-Type: application/json`:

```json
{ "text": "La nueva herramienta nos ayudó a trabajar mejor." }
```

Respuesta `200`:

```json
{
  "summary": "Una nueva herramienta mejoró el trabajo del equipo.",
  "sentiment": "positive",
  "language": "es",
  "keywords": ["herramienta", "trabajo"],
  "category": "tecnología",
  "analyzedAt": "2026-10-21T20:24:21.858Z"
}
```

Sentimientos: `positive`, `negative`, `neutral`. Categorías: `tecnología`, `deportes`, `política`, `entretenimiento`, `ciencia`, `negocios`, `otro`. `analyzedAt` es una fecha UTC asignada por el backend después de validar la salida del proveedor.

El servidor expone además `GET /api/health`. El historial y el resumen no son endpoints: se calculan en el cliente con los resultados almacenados en `localStorage`.

## Flujo de datos y privacidad

- El texto original viaja del navegador al backend y de ahí a Google Gemini.
- La solicitud usa `store: false`, pero siguen aplicando los términos y políticas de datos de Google.
- El backend no persiste el texto ni el resultado.
- El navegador guarda hasta 500 resultados validados bajo `texta.analysis-history.v1`.
- El historial no contiene el texto original, no cruza navegadores y se pierde al borrar los datos del sitio.
- Las salidas se renderizan como texto, nunca como HTML interpretado.

En modo `demo`, no se acepta texto libre ni se envían solicitudes al backend o a Google. Cada ejemplo precargado tiene una respuesta mock explícita. El navegador simula la espera de consulta y guarda localmente tanto el ejemplo elegido como su respuesta, identificados como datos de demostración.

## Resiliencia y seguridad

- Máximo de entrada: 12,000 caracteres.
- Límite local: 20 análisis por minuto por IP.
- Timeout del proveedor: 30 segundos.
- Un reintento ante `503` dentro del mismo límite de tiempo.
- Traducción de errores sin filtrar respuestas privadas del proveedor.
- Helmet, `Cache-Control: no-store` para `/api` y validación estricta con Zod.
- Auditoría propia de secretos en archivos publicables, blobs Git alcanzables y `dist`.

Estos controles son apropiados para ejecución local. Una publicación abierta requeriría autenticación o cuotas globales, presupuesto y apagado, protección antiabuso, observabilidad, política de privacidad y configuración explícita de proxy.

## Estructura

- `src/App.svelte`: enrutamiento local, layout, tema y orquestación del historial.
- `src/components/AnalyzerView.svelte`: editor, petición y presentación del resultado.
- `src/components/HistoryView.svelte`: historial local paginado en la interfaz.
- `src/components/SummaryView.svelte`: métricas derivadas del historial.
- `src/components/InfoView.svelte`: explicación visual y flujo animado del análisis.
- `src/lib/history.js`: lectura, validación, límite y resumen de `localStorage`.
- `server/`: API, errores y adaptador de Gemini.
- `shared/analysis.js`: contratos Zod del proveedor y la respuesta HTTP.
- `test/`: pruebas de API, proveedor, almacenamiento local, muestras y secretos.

## Marca y metadatos

Los tokens visuales principales son rojo `#e30613`, negro `#121212` y blanco. `src/theme.css` contiene la capa de marca y los temas. Los íconos y la tarjeta social se regeneran en Windows con:

```powershell
powershell -NoProfile -File .\scripts\generate-brand-assets.ps1
```

Configura `SITE_URL` antes del build únicamente cuando exista un dominio HTTPS real. Sin ese valor el proyecto no inventa canonical, sitemap ni URL de demo.
