# Texta · AI Text Analyzer

Demo full-stack que convierte texto libre en un resumen en español, sentimiento, idioma, palabras clave y categoría mediante Google Gemini.

Nació como proyecto de aprendizaje y portafolio para demostrar una integración de IA útil, validada y segura: la API key permanece en el backend y el historial se conserva únicamente en el navegador.

![Analizador Texta en tema claro](docs/screenshots/texta-desktop-light.png)

## Demo interactiva

[Abrir Texta Demo en GitHub Pages](https://alfonso-13.github.io/AI-Text-Analyzer/)

La publicación conserva la interfaz y permite recorrer el analizador, la carga, el resultado, el historial y el resumen sin configurar una API key. El editor libre permanece desactivado: se elige uno de los ejemplos ficticios y, después de una espera breve, se muestra la respuesta mock asociada. **No usa Gemini, no realiza un análisis real y no envía información fuera del navegador**.

| Modo | Propósito | Procesamiento |
| --- | --- | --- |
| `production` | Ejecutar la aplicación completa localmente | Express + Google Gemini |
| `demo` | Mostrar el flujo públicamente y sin credenciales | Ejemplos y respuestas mock en el navegador |

## Qué demuestra

- Svelte 5 y una interfaz adaptable con temas claro y oscuro.
- Express 5, límites de solicitudes, timeout y manejo seguro de errores.
- Contratos Zod compartidos para validar entrada, salida del modelo y respuesta HTTP.
- Integración con Gemini usando salida JSON estructurada y `store: false`.
- Historial privado por navegador, sin almacenar el texto original en el servidor.
- Pruebas automatizadas, build y auditoría de secretos.

## Evidencia visual

| Analizador | Resultado |
| --- | --- |
| ![Pantalla del analizador](docs/screenshots/texta-desktop-light.png) | ![Resultado estructurado de un análisis](docs/screenshots/texta-result-light.png) |

| Historial | Resumen |
| --- | --- |
| ![Historial local en tema oscuro](docs/screenshots/texta-history-dark.png) | ![Resumen por categorías](docs/screenshots/texta-summary-light.png) |

| Cómo funciona | Vista móvil |
| --- | --- |
| ![Flujo técnico animado](docs/screenshots/texta-info-dark.png) | ![Texta en vista móvil y tema oscuro](docs/screenshots/texta-mobile-dark.png) |

Las capturas usan contenido ficticio. La aplicación no verifica hechos y no debe interpretarse como una fuente informativa.

## Ejecutar localmente

Requiere Node.js **24.x**, npm y una API key de Gemini:

```powershell
git clone https://github.com/Alfonso-13/AI-Text-Analyzer.git
cd AI-Text-Analyzer
nvm list
nvm use 24.19.0
npm ci
Copy-Item .env.example .env
```

Agrega `GEMINI_API_KEY` a `.env` y ejecuta:

```powershell
.\run-local.ps1
```

Abre [http://127.0.0.1:5173](http://127.0.0.1:5173). El script levanta Vite y Express; no cambia la versión de NVM automáticamente.

Para validar el proyecto completo:

```powershell
.\run-local.ps1 -Verify
```

Los dos modos viven en `main` y se configuran mediante [app.config.json](app.config.json). `npm run build` compila producción y `npm run build:demo` activa los mocks y la ruta pública sin modificar el código. Solo el build estático resultante se publica desde la raíz de `gh-pages`.

## Alcance

Es una demostración educativa y reutilizable, no un servicio público de IA operado. Cada instalación en modo `production` usa su propia API key y cuota. Una publicación abierta con análisis reales requeriría autenticación, control de presupuesto, protección antiabuso y observabilidad; por eso GitHub Pages ofrece solamente el modo simulado.

La guía de configuración, arquitectura, contrato API, privacidad y comandos está en [DEV.md](DEV.md). Distribuido bajo [licencia MIT](LICENSE).
