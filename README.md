<div align="center">

# Texta · AI Text Analyzer

**A full-stack AI demo that turns free-form text into structured, readable insights.**

`Svelte 5` · `Express 5` · `Google Gemini` · `Zod` · `Local-first history`

[Live demo](https://alfonso-13.github.io/AI-Text-Analyzer/) · [Technical guide](DEV.md) · [MIT license](LICENSE)

</div>

---

## About the project

Texta converts free-form text into a Spanish summary, sentiment, detected language, keywords, and category through Google Gemini.

It was built as a learning and portfolio project to demonstrate a useful, validated, and secure AI integration. The API key remains on the server, the backend does not persist requests or results, and analysis history stays in the browser.

![Texta analyzer in light mode](docs/screenshots/texta-desktop-light.png)

<details>
<summary><strong>Resumen en español</strong></summary>

Texta es una demo full-stack que convierte texto libre en un resumen en español, sentimiento, idioma detectado, palabras clave y categoría mediante Google Gemini.

El proyecto demuestra una integración de IA validada y segura: la API key permanece en el backend, el servidor no guarda textos ni resultados y el historial se conserva únicamente en el navegador. La demo pública utiliza ejemplos ficticios y respuestas mock relacionadas, por lo que no requiere credenciales ni consume la API de Gemini.

</details>

## Interactive demo

[Open the Texta live demo](https://alfonso-13.github.io/AI-Text-Analyzer/)

The public build preserves the complete analyzer, loading, result, history, and summary experience without requiring an API key. Free-form input is disabled: visitors select a fictional example and receive its associated mock response after a short simulated wait.

The demo **does not use Gemini, perform a real AI analysis, or send information outside the browser**.

| Mode | Purpose | Processing |
| --- | --- | --- |
| `production` | Run the complete application locally | Express + Google Gemini |
| `demo` | Present the product flow publicly without credentials | Browser-only examples and mock responses |

## Engineering highlights

- Svelte 5 interface with responsive light and dark themes.
- English-first interface with a persistent `EN / ES` selector.
- Session-scoped cinematic entrance with replay support and reduced-motion fallback.
- Express 5 API with rate limiting, request timeout, retry boundaries, and safe error handling.
- Shared Zod contracts for input, model output, browser storage, and HTTP responses.
- Gemini structured JSON output with `store: false`.
- Browser-local history and category summaries with a 500-result limit.
- Production and public demo profiles built from the same `main` branch.
- Automated checks, tests, builds, and secret auditing.

## Visual evidence

| Analyzer | Structured result |
| --- | --- |
| ![Texta analyzer screen](docs/screenshots/texta-desktop-light.png) | ![Structured analysis result](docs/screenshots/texta-result-light.png) |

| History | Category summary |
| --- | --- |
| ![Browser-local history in dark mode](docs/screenshots/texta-history-dark.png) | ![Category summary dashboard](docs/screenshots/texta-summary-light.png) |

| How it works | Mobile view |
| --- | --- |
| ![Animated technical flow](docs/screenshots/texta-info-dark.png) | ![Texta mobile view in dark mode](docs/screenshots/texta-mobile-dark.png) |

Screenshots use fictional content. Texta does not verify facts and should not be treated as an information source.

## Run locally

Requirements: NVM for Windows, Node.js **24.19.0** installed through NVM, npm, and a Gemini API key.

```powershell
git clone https://github.com/Alfonso-13/AI-Text-Analyzer.git
cd AI-Text-Analyzer
nvm list
nvm use 24.19.0
npm ci
Copy-Item .env.example .env
```

Add `GEMINI_API_KEY` to `.env`, then run:

```powershell
.\run-local.ps1
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The script runs `nvm use 24.19.0`, validates that exact installation, and then starts Vite and Express with its own `npm.cmd`.

Run the complete production validation with:

```powershell
.\run-local.ps1 -Verify
```

Both profiles live in `main` and are defined in [app.config.json](app.config.json). `npm run build` compiles production, while `npm run build:demo` enables the public mock profile without editing source files. Only the compiled output is published from the root of `gh-pages`.

The interface defaults to English and stores the selected language in the browser. The entrance runs once per tab session; append `?intro` to the URL to replay it during review.

## Scope and reuse

Texta is an educational, reusable demo rather than a publicly operated AI service. Every production installation uses its own Gemini API key and quota. An open real-analysis service would additionally require authentication, global budget controls, abuse protection, observability, and an explicit privacy policy; this is why the GitHub Pages build uses mocks only.

Configuration, architecture, API contracts, privacy decisions, and validation commands are documented in [DEV.md](DEV.md). The project is distributed under the [MIT License](LICENSE).

Feedback and contributions are welcome.
