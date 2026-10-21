# Texta · AI Text Analyzer

Aplicación web en español para pegar texto y obtener resumen, sentimiento, idioma, palabras clave y categoría con Google Gemini. Interfaz Svelte con SweetAlert2, backend Express y validación Zod. Diseño inspirado en la paleta y composición de [AGGY](https://aggy.mx/), con identidad propia.

## Requisitos e instalación

- Node.js **24.x** y npm (también definido en `.nvmrc` y `package.json`).
- API key de Google Gemini con acceso al modelo configurado y cuota disponible.

```powershell
cd D:\Dev\Repos\Test\AI-Text-Analyzer
npm ci
Copy-Item .env.example .env
```

Edita `.env` localmente, agrega tu key y reinicia el servidor. No compartas la key ni la agregues al repositorio.

| Variable | Uso | Valor predeterminado |
| --- | --- | --- |
| `GEMINI_API_KEY` | Obligatoria para análisis reales; solo servidor | Sin valor |
| `GEMINI_MODEL` | Modelo compatible con Interactions y JSON Schema | `gemini-3.8-flash` |
| `PORT` | Puerto del servidor | `3001` |

La integración usa la [API REST Interactions](https://ai.google.dev/api/interactions-api) y [salida estructurada JSON](https://ai.google.dev/gemini-api/docs/structured-output), en lugar del ejemplo anterior con `@google/generative-ai` y Gemini 1.5. El acceso al modelo depende de tu cuenta. Endpoint v1beta: revisa compatibilidad antes de producción.

## Ejecutar localmente

```powershell
.\run-local.ps1
```

El script crea `.env` si falta, instala dependencias si falta `node_modules` y arranca ambos procesos. Agrega tu key al archivo y reinicia si lo creó vacío. Abre [http://127.0.0.1:5173](http://127.0.0.1:5173). Detén con **Ctrl+C**. No se requiere cambiar la política de PowerShell: si tu equipo bloquea scripts, usa `npm run dev`.

Alternativa manual después de instalar y configurar `.env`:

```powershell
npm run dev
```

Vite atiende en `5173` y envía `/api` a Express en `3001`. En desarrollo conserva `PORT=3001`. Un puerto ocupado produce un error; libera ese puerto antes de iniciar. Para ejecutar la compilación con un solo servidor:

```powershell
.\run-local.ps1 -Production
# o:
npm run build
npm start
```

Abre [http://127.0.0.1:3001](http://127.0.0.1:3001). Ambos servidores se enlazan únicamente a loopback. `PORT` puede cambiar al ejecutar la compilación. El script no abre navegador ni deja servicios instalados.

## Pruebas

```powershell
.\run-local.ps1 -Verify
# o:
npm run verify
```

Ejecuta revisión Svelte, pruebas con Node Test Runner + Supertest y compilación Vite. `npm test` ejecuta solo pruebas. No requieren key ni consumen cuota: simulan el proveedor y verifican API, validación, errores, timeout, rate limit y contrato REST. No sustituyen una llamada real a Gemini.

Prueba manual con key configurada: pega texto o carga el ejemplo, pulsa **Analizar texto** y verifica resumen, sentimiento verde/rojo/gris, idioma, tags y categoría. Prueba texto positivo, negativo, neutral e inglés; copia JSON, limpia y revisa en pantalla móvil. El ejemplo es texto de entrada proporcionado para demostración, no una noticia verificada. Sin key se muestra un error de configuración con SweetAlert2.

## API

`POST /api/analyze` · `Content-Type: application/json`

```json
{ "text": "La nueva herramienta nos ayudó a trabajar mejor." }
```

Respuesta `200` (contenido variable generado por IA):

```json
{
  "summary": "Una nueva herramienta mejoró el trabajo del equipo.",
  "sentiment": "positive",
  "language": "es",
  "keywords": ["herramienta", "trabajo"],
  "category": "tecnología"
}
```

Sentimientos: `positive`, `negative`, `neutral`. Categorías: `tecnología`, `deportes`, `política`, `entretenimiento`, `ciencia`, `negocios`, `otro`. Resumen en español; idioma del texto original. Entre 1 y 10 keywords.

Errores: `{ "error": { "code": "...", "message": "..." } }`. Estados: `400` entrada/JSON inválido, `413` cuerpo excesivo, `415` formato no soportado, `429` límite local o cuota Gemini, `502` proveedor/respuesta inválida, `503` key no configurada, `504` timeout. `GET /api/health` indica que el servidor está activo; no comprueba credenciales.

## Estructura y límites

- `src/`: interfaz y estilos.
- `server/`: API, errores y adaptador Gemini con timeout de 30 segundos.
- `shared/analysis.js`: contrato de entrada y salida.
- `test/`: pruebas sin llamadas externas.
- `scripts/dev.mjs`, `run-local.ps1`: ejecución local y cierre de procesos.

Máximo 12,000 caracteres; 20 solicitudes por minuto por IP, almacenadas en memoria. No hay base de datos, cuentas ni historial. La aplicación no registra texto, key ni respuesta del proveedor. Al analizar se envía el texto a Google; `store:false` desactiva almacenamiento de la interacción para recuperación, pero las políticas de datos de Google siguen aplicando. La IA puede equivocarse y no verifica hechos. Las salidas se renderizan como texto, sin HTML interpretado.

El repositorio tiene remoto GitHub configurado; estos comandos no hacen commit, push ni despliegue. Para publicación productiva se requieren decisiones de autenticación, cuota, HTTPS y despliegue, fuera del alcance de la ejecución local.
