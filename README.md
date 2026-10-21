# Texta · AI Text Analyzer

Aplicación web en español para pegar texto y obtener resumen, sentimiento, idioma, palabras clave y categoría con Google Gemini. Interfaz Svelte con SweetAlert2, backend Express y validación Zod. Diseño inspirado en la paleta y composición de [AGGY](https://aggy.mx/), con identidad propia.

## Pantallas y novedades

- **Analizador** (`#analyze`): editor, ejemplo fijo y textos aleatorios, loading animado negro/lima, resultados y copia JSON.
- **Historial** (`#history`): análisis recientes, fecha local, sentimiento, idioma, categoría y keywords desplegables. Carga 10 registros por página; **Cargar más** al final agrega la siguiente página. **Actualizar** vuelve al inicio.
- **Resumen** (`#summary`): total de análisis conservados, categorías distintas, categoría más frecuente y distribución con porcentajes. En empates se presenta una de las categorías con mayor cantidad.
- Navegación con icono y nombre en la barra izquierda; en móvil se convierte en una barra inferior, con tarjetas en una columna y controles táctiles.

El bug que mostraba error pese a HTTP 200 se corrigió separando el contrato estricto de Gemini del contrato HTTP, que incluye `analyzedAt`. El cliente valida la fecha y muestra el resultado sin rechazar los metadatos válidos del servidor.

**Textos aleatorios:** el botón del editor y los botones Artículos y noticias, Posts y tweets, Ideas y párrafos y Lugares cargan inmediatamente uno de 16 ejemplos de `src/data/sample-texts.json`. No requieren key, red ni llamadas a IA, y evitan repetir el texto actual. Son ejemplos ficticios para pruebas, no noticias verificadas. Cargar un texto no ejecuta el análisis: pulsa **Analizar texto** cuando estés listo.

## Requisitos e instalación

- Node.js **24.x** y npm (también definido en `.nvmrc` y `package.json`).
- API key de Google Gemini con acceso al modelo configurado y cuota disponible.

```powershell
cd D:\Dev\Repos\Test\AI-Text-Analyzer
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edita `.env` localmente, agrega tu key y reinicia el servidor. No compartas la key ni la agregues al repositorio.

El archivo debe estar en la raíz del proyecto, con una variable por línea, sin comas ni llaves JSON:

```dotenv
GEMINI_API_KEY=tu_key_aqui
GEMINI_MODEL=gemini-3.5-flash
PORT=3001
```

No uses el prefijo `VITE_` para la key. Reinicia el backend después de cambiar `.env`. Los comandos de arranque usan `--use-system-ca` para confiar también en los certificados del sistema operativo, sin desactivar la validación TLS.

### Manejo de secretos y exclusión de Git

- `.env` es configuración privada de tu equipo. `.gitignore` excluye `.env`, sus variantes (`.env.local`, `.env.production`, backups) y archivos de certificados/keys. La única plantilla publicable es **`.env.example`**, con `GEMINI_API_KEY` vacío.
- La key se lee únicamente en `server/index.js` y se envía a Google desde el backend. Nunca se configura como `VITE_GEMINI_API_KEY`, se agrega al frontend, a ejemplos, capturas, logs ni documentación. Vite solo usa el prefijo público `VITE_` por defecto; la configuración no expone el entorno completo.
- Crea `.env` desde la plantilla solo si todavía no existe: no sobrescribas tu archivo local. No copies la key a ningún archivo público.
- `GEMINI_API_KEY` es la credencial. `GEMINI_MODEL` y `PORT` no son secretos. `SITE_URL` es opcional y público: sirve para metadatos al compilar.
- Verifica antes de publicar con `npm run audit:secrets`. El comando también forma parte de `npm run verify`: inspecciona archivos publicables, historial Git alcanzable y `dist`, busca patrones de credenciales y coincidencias con secretos del entorno local. Solo reporta rutas y tipos, sin imprimir valores. Un hallazgo hace fallar la verificación.
- `.github/workflows/verify.yml` ejecuta la verificación en push y pull request con Node 24 e historial completo, sin necesitar la key de Gemini. La configuración está preparada localmente; se activará cuando se suba al repositorio. Los iconos generados ya están incluidos, por lo que CI no necesita ejecutar el script gráfico de Windows.
- Comprobación rápida: `git ls-files .env` debe quedar vacío; `git check-ignore .env` debe mostrar `.env`. No uses `git add -f` para subir configuración privada. Ignorar un archivo no elimina secretos que ya existan en commits anteriores: si se detecta una filtración se debe revocar/rotar la key y sanear el historial con autorización.

El chequeo incluido reduce el riesgo de filtraciones, pero no garantiza detectar todos los formatos de credenciales ni inspecciona ramas remotas que no estén disponibles localmente.

Un `503` con código `PROVIDER_BUSY` indica alta demanda del modelo en Google, no una key inválida. La app reintenta una sola vez, dentro del mismo timeout de 30 segundos. Si continúa, espera y vuelve a analizar o configura otro modelo disponible en tu cuenta.

| Variable | Uso | Valor predeterminado |
| --- | --- | --- |
| `GEMINI_API_KEY` | Obligatoria para análisis reales; solo servidor | Sin valor |
| `GEMINI_MODEL` | Modelo compatible con Interactions y JSON Schema | `gemini-3.8-flash` |
| `PORT` | Puerto del servidor | `3001` |
| `SITE_URL` | Opcional y público; origen HTTPS para canonical y enlaces sociales al compilar | Vacío en local |

La integración usa la [API REST Interactions](https://ai.google.dev/api/interactions-api) y [salida estructurada JSON](https://ai.google.dev/gemini-api/docs/structured-output), en lugar del ejemplo anterior con `@google/generative-ai` y Gemini 1.5. El acceso al modelo depende de tu cuenta. Endpoint v1beta: revisa compatibilidad antes de producción.

## Presentación, SEO y marca

El HTML inicial incluye título descriptivo, descripción, idioma `es-MX`, contenido explicativo legible antes de cargar JavaScript, metadatos Open Graph/Twitter y tarjeta social de 1200 × 630. El título de pestaña identifica Analizador, Historial o Resumen sin insertar textos de usuarios en metadatos. La app reemplaza el contenido de presentación al montar Svelte; no es un sistema SSR completo.

La marca usa un favicon vectorial propio con “t” y destello, en lima y negro, más alternativas ICO/PNG, icono Apple y manifest. Los archivos están en `public/`. Para regenerar los PNG/ICO y la tarjeta social en Windows: `powershell -NoProfile -File .\scripts\generate-brand-assets.ps1`; no requiere servicios ni paquetes externos.

`robots.txt` permite la presentación y excluye `/api/`. Esto orienta crawlers, no sustituye autenticación. La app sigue ejecutándose solo en loopback; no se ha publicado ni se garantiza posicionamiento en buscadores.

Cuando exista un dominio público real, configura `SITE_URL` con su origen HTTPS (sin rutas, credenciales, query ni fragmento) **antes de `npm run build`**. Vite añadirá canonical y `og:url`, y convertirá las imágenes sociales en URLs absolutas. Sin este dato no se inventa un dominio: los recursos funcionan localmente, pero algunos servicios de vista previa requieren esas URLs absolutas para compartir. No hay sitemap con URLs ficticias ni calificaciones/precios inventados.

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

Ejecuta revisión Svelte, pruebas con Node Test Runner + Supertest y compilación Vite. `npm test` ejecuta solo pruebas. No requieren key ni consumen cuota: simulan el proveedor y verifican API, validación, errores, timeout, rate limit y contrato REST. También cubren la regresión de `analyzedAt`, el texto citado con markdown, paginación estable con nuevas inserciones, resumen, límite de memoria, reinicio y ejemplos aleatorios. No sustituyen una llamada real a Gemini.

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
  "category": "tecnología",
  "analyzedAt": "2026-10-21T20:24:21.858Z"
}
```

Sentimientos: `positive`, `negative`, `neutral`. Categorías: `tecnología`, `deportes`, `política`, `entretenimiento`, `ciencia`, `negocios`, `otro`. Resumen en español; idioma del texto original. Entre 1 y 10 keywords.

`analyzedAt` es una fecha ISO UTC asignada por el backend después de validar el análisis; no la genera Gemini. La interfaz muestra la fecha en la zona horaria del navegador.

### Historial y resumen

`GET /api/history?limit=10` devuelve la primera página (más reciente primero):

```json
{
  "items": [],
  "hasMore": false,
  "nextCursor": null
}
```

`items` contiene objetos con el mismo contrato que `/api/analyze`. Si `hasMore` es `true`, usa `GET /api/history?limit=10&before=<nextCursor>` para seguir cargando. `limit` admite de 1 a 50; trata `nextCursor` como un cursor opaco. No hay duplicados por nuevas inserciones entre páginas. Un cursor de una sesión anterior debe descartarse: actualiza la pantalla si el servidor se reinicia. Parámetros inválidos devuelven `400 INVALID_PAGINATION`.

Por compatibilidad, `GET /api/history` sin parámetros conserva la respuesta anterior: un array con los 50 registros más recientes.

`GET /api/summary` conserva el conteo por categoría de los registros retenidos, por ejemplo:

```json
{ "tecnología": 3, "ciencia": 2 }
```

Sin análisis devuelve `{}`. Las pantallas consultan estas rutas al entrar y al pulsar **Actualizar**. Sus fallos muestran un mensaje y un botón **Reintentar**, conservando las páginas ya cargadas cuando falla “Cargar más”.

Errores: `{ "error": { "code": "...", "message": "..." } }`. Estados: `400` entrada/JSON inválido, `413` cuerpo excesivo, `415` formato no soportado, `429` límite local o cuota Gemini, `502` proveedor/respuesta inválida, `503` key no configurada, `504` timeout. `GET /api/health` indica que el servidor está activo; no comprueba credenciales.

## Estructura y límites

- `src/`: interfaz y estilos.
- `server/`: API, errores y adaptador Gemini con timeout de 30 segundos.
- `shared/analysis.js`: contratos de Gemini, respuesta HTTP con fecha, historial y resumen.
- `src/data/sample-texts.json`: ejemplos precargados por tipo.
- `src/components/`: iconos y loading de marca con soporte para movimiento reducido.
- `src/workspace.css`: navegación, vistas de datos y adaptación móvil.
- `test/`: pruebas sin llamadas externas.
- `scripts/dev.mjs`, `run-local.ps1`: ejecución local y cierre de procesos.

Máximo 12,000 caracteres; 20 solicitudes por minuto por IP. El historial conserva **hasta 500 análisis en memoria del servidor**, compartidos por quienes usan esa instancia local. Guarda el análisis y la fecha, sin el texto original ni la key. Al superar el límite elimina el más antiguo; el resumen cuenta los registros retenidos. **Reiniciar o recargar el backend borra el historial y sus métricas.** No hay base de datos, archivos de persistencia, cuentas ni aislamiento por usuario. No se registra texto ni credenciales en logs. El loading no muestra porcentajes ficticios y respeta la preferencia de movimiento reducido.

Al analizar se envía el texto a Google; `store:false` desactiva almacenamiento de la interacción para recuperación, pero las políticas de datos de Google siguen aplicando. La IA puede equivocarse y no verifica hechos. Las salidas se renderizan como texto, sin HTML interpretado.

El repositorio tiene remoto GitHub configurado; estos comandos no hacen commit, push ni despliegue. Para publicación productiva se requieren decisiones de autenticación, cuota, HTTPS y despliegue, fuera del alcance de la ejecución local.
