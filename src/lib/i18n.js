export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'texta.language';

const messages = {
  en: {
    'nav.analyze': 'Analyzer', 'nav.history': 'History', 'nav.summary': 'Summary', 'nav.info': 'Information',
    'aria.identity': 'Application identity', 'aria.menu': 'Main menu', 'aria.home': 'Texta, go to analyzer',
    'theme.light': 'Switch to light theme', 'theme.dark': 'Switch to dark theme', 'help': 'How it works',
    'loading.analysis': 'Analyzing text…', 'loading.demo': 'Simulating request…', 'demo.label': 'Mock demo',
    'footer.tagline': 'Artificial intelligence, human clarity.', 'footer.demo': 'Demo data · Nothing sent.',
    'modal.title': 'From text to essentials',
    'modal.demo': 'This publication preserves the Texta interface but only allows predefined examples. Each example returns a related mock response after simulating the request; it does not use Gemini or send data outside the browser.',
    'modal.production': 'Gemini summarizes and classifies your text; it can make mistakes and does not verify facts. Text is sent to Google. Only the result is kept in this browser, up to 500 analyses. It is not shared with other visitors or stored on the server.',
    'modal.confirm': 'Got it', 'history.warningTitle': 'Analysis ready, history not saved',
    'history.warningText': 'The browser did not allow this result to be stored locally.',
    'title.analyze': 'Texta | AI text analyzer: summary and sentiment', 'title.history': 'Analysis history | Texta',
    'title.summary': 'Category summary | Texta', 'title.info': 'How it works | Texta', 'title.demo': 'Texta | Interactive demo without AI',
    'hero.eyebrow': 'LESS NOISE. MORE CONTEXT.', 'hero.line1': 'Much text.', 'hero.line2': 'All clear.',
    'hero.description': 'Find what matters in any text.\nA summary, its intent, and the words that count.',
    'hero.note': 'Your next great idea\nstarts with understanding.',
    'editor.title': 'Your text, here', 'editor.example': 'Try an example', 'editor.random': 'Random text',
    'editor.samplesReady': 'Ready-made examples, no waiting', 'editor.label': 'Text to analyze',
    'editor.placeholder': 'Paste that article, post, or idea you have in mind…',
    'editor.demoPlaceholder': 'Select one of the available examples…', 'editor.word': 'word', 'editor.words': 'words',
    'editor.clear': 'Clear', 'editor.analyze': 'Analyze text', 'editor.demoAnalyze': 'Run example',
    'editor.analyzing': 'Analyzing…', 'editor.demoAnalyzing': 'Simulating request…',
    'editor.privacy': 'Text is sent to Google. Only the result is stored in this browser.',
    'editor.demoPrivacy': 'Mock demo: select an example. Nothing leaves your browser.',
    'result.title': 'The essentials', 'result.ready': 'Ready', 'result.label': 'YOUR ANALYSIS', 'result.summary': 'SUMMARY',
    'result.sentiment': 'Sentiment', 'result.language': 'Detected language', 'result.keywords': 'Keywords',
    'result.category': 'Category', 'result.copy': 'Copy JSON',
    'result.loading': 'Connecting the ideas…', 'result.loadingDetail': 'Gemini is reading your text. We are finding what matters.',
    'result.demoLoading': 'Request simulation…', 'result.demoLoadingDetail': 'Finding the mock response associated with this example.',
    'result.aiNote': 'Generated with AI. This is not fact verification.',
    'result.demoNote': 'Mock response associated with the example. No AI is used.',
    'result.errorTitle': 'Let’s try again', 'result.errorCaption': 'Your text is still in the editor.',
    'result.emptyTitle': 'The ideas are there.\nLet’s find them.',
    'result.emptyText': 'Add text and let AI connect the dots for you.',
    'result.demoEmptyText': 'Select an example and run its test response.',
    'result.emptyCaption': 'A LITTLE AI. A LOT OF CLARITY.', 'result.demoEmptyCaption': 'SAME FLOW. TEST DATA.',
    'strip.label': 'TRY A TEXT.', 'strip.strong': 'DISCOVER ANOTHER PERSPECTIVE.',
    'strip.aria': 'Random texts by type', 'strip.randomAria': 'Random text',
    'samples.articles': 'Articles and news', 'samples.posts': 'Posts and tweets', 'samples.ideas': 'Ideas and paragraphs', 'samples.places': 'Places',
    'samples.note': 'Preloaded fictional examples · Changes with every click',
    'samples.demoEnd': 'Each example has a related mock response.', 'samples.productionEnd': 'Analyze when you are ready.',
    'alert.clearTitle': 'Start over?', 'alert.clearText': 'The text and analysis on this screen will be removed.',
    'alert.clearConfirm': 'Yes, clear', 'alert.cancel': 'Cancel', 'alert.invalidTitle': 'Review your text',
    'alert.invalidText': 'Enter between 1 and 12,000 characters to continue.', 'alert.requestFailed': 'The text could not be analyzed.',
    'error.timeout': 'The request took too long. Try again.', 'error.connection': 'The server cannot be reached. Check that it is running.',
    'error.invalidResult': 'The server returned an invalid result.', 'error.generic': 'Something went wrong. Try again.',
    'alert.analysisFailed': 'We could not analyze it', 'alert.copied': 'JSON copied', 'alert.copyFailed': 'Could not copy',
    'alert.copyText': 'Your browser did not allow clipboard access.',
    'history.eyebrow': 'YOUR IDEAS, WITH CONTEXT', 'history.title': 'History',
    'history.description': 'Return to the essentials from your latest analyses.',
    'history.session': 'Up to 500 results stored only in this browser. Original text is not retained.',
    'history.demoSession': 'The example request and its mock response are stored only in this browser.',
    'history.emptyTitle': 'Everything starts with text', 'history.emptyText': 'Completed analyses will appear here, newest first.',
    'history.first': 'Analyze my first text', 'history.viewQuery': 'View request and keywords', 'history.viewKeywords': 'View keywords',
    'history.loadMore': 'Load more', 'history.end': 'You have seen all your analyses', 'history.localRecords': 'local records',
    'summary.eyebrow': 'THE BIG PICTURE', 'summary.title': 'Your summary',
    'summary.description': 'Discover which topics appear in your analyses.',
    'summary.session': 'Metrics calculated in this browser from up to 500 local results.',
    'summary.emptyTitle': 'No topics to discover yet', 'summary.emptyText': 'Analyze your first text to see the category summary.',
    'summary.goAnalyzer': 'Go to analyzer', 'summary.saved': 'Saved analyses', 'summary.inBrowser': 'In this browser',
    'summary.detected': 'Detected categories', 'summary.perspectives': 'Different perspectives',
    'summary.frequent': 'Most frequent topic', 'summary.inCategory': 'analyses in this category',
    'summary.chartTitle': 'Your content by category', 'summary.explore': 'Explore history',
    'info.eyebrow': 'FROM TEXT TO ESSENTIALS', 'info.title1': 'An idea goes in.', 'info.title2': 'Clarity comes out.',
    'info.description': 'Texta combines a Svelte interface, a Node.js API, and Gemini to transform free-form content into clear data without turning browser history into shared information.',
    'info.flow': 'FLOW', 'info.flowTitle': 'How an analysis travels', 'info.flowStatus': 'Protected end-to-end flow',
    'info.return': 'RETURN · VALIDATED RESULT',
    'info.step1Title': 'Your browser', 'info.step1Detail': 'You write or load text. The API key never reaches the frontend.', 'info.step1Tag': 'Private input',
    'info.step2Title': 'Texta API', 'info.step2Detail': 'Express validates size, limits requests, and prepares a safe instruction.',
    'info.step3Detail': 'AI returns a summary, sentiment, language, keywords, and category.', 'info.step3Tag': 'Structured JSON',
    'info.step4Title': 'Local result', 'info.step4Detail': 'Texta validates the response and stores only the result in your browser.',
    'info.capability': '01 / CAPABILITY', 'info.capabilityTitle': 'What it delivers',
    'info.capabilityText': 'A short Spanish summary, sentiment, original language, up to ten keywords, and one topic category.',
    'info.privacy': '02 / PRIVACY', 'info.privacyTitle': 'What it keeps',
    'info.privacyText': 'Up to 500 results in this browser. It does not store original text, create accounts, or share history with other people.',
    'info.limits': '03 / LIMITS', 'info.limitsTitle': 'What you should know',
    'info.limitsText': 'AI can make mistakes and does not verify facts. Every installation needs its own Gemini API key and available quota.',
    'info.calloutDemoTitle': 'This publication uses mock responses.',
    'info.calloutDemoText': 'The diagram explains production mode. Here you choose an example, the request is simulated, and its test response is returned without calling Gemini.',
    'info.calloutProdTitle': 'The key stays on the server.',
    'info.calloutProdText': 'The browser talks to Texta; Texta talks to Gemini. The result returns validated before it is displayed.',
    'info.tryExamples': 'Try the examples', 'info.tryAnalyzer': 'Try the analyzer',
  },
  es: {
    'nav.analyze': 'Analizador', 'nav.history': 'Historial', 'nav.summary': 'Resumen', 'nav.info': 'Información',
    'aria.identity': 'Identidad de la aplicación', 'aria.menu': 'Menú principal', 'aria.home': 'Texta, ir al analizador',
    'theme.light': 'Activar tema claro', 'theme.dark': 'Activar tema oscuro', 'help': 'Cómo funciona',
    'loading.analysis': 'Analizando texto…', 'loading.demo': 'Simulación de consulta…', 'demo.label': 'Demo con mocks',
    'footer.tagline': 'Inteligencia artificial, claridad humana.', 'footer.demo': 'Demo con datos de prueba · Sin datos enviados.',
    'modal.title': 'Del texto a lo esencial',
    'modal.demo': 'Esta publicación conserva la interfaz de Texta, pero solo permite seleccionar ejemplos precargados. Cada ejemplo devuelve una respuesta mock relacionada después de simular la consulta; no usa Gemini ni envía datos fuera del navegador.',
    'modal.production': 'Gemini resume y clasifica tu texto; puede equivocarse y no verifica hechos. El texto se envía a Google. Solo el resultado se conserva en este navegador, hasta 500 análisis. No se comparte con otros visitantes ni se guarda en el servidor.',
    'modal.confirm': 'Entendido', 'history.warningTitle': 'Análisis listo, historial no guardado',
    'history.warningText': 'El navegador no permitió guardar este resultado localmente.',
    'title.analyze': 'Texta | Analizador de texto con IA: resumen y sentimiento', 'title.history': 'Historial de análisis | Texta',
    'title.summary': 'Resumen por categoría | Texta', 'title.info': 'Cómo funciona | Texta', 'title.demo': 'Texta | Demo interactiva sin IA',
    'hero.eyebrow': 'MENOS RUIDO. MÁS CONTEXTO.', 'hero.line1': 'Mucho texto.', 'hero.line2': 'Todo claro.',
    'hero.description': 'Encuentra lo esencial de cualquier texto.\nUn resumen, su intención y las palabras que importan.',
    'hero.note': 'Tu siguiente gran idea\nempieza por entender.',
    'editor.title': 'Tu texto, aquí', 'editor.example': 'Probar un ejemplo', 'editor.random': 'Texto aleatorio',
    'editor.samplesReady': 'Ejemplos listos, sin esperas', 'editor.label': 'Texto para analizar',
    'editor.placeholder': 'Pega ese artículo, tweet o idea que tienes en mente…',
    'editor.demoPlaceholder': 'Selecciona uno de los ejemplos disponibles…', 'editor.word': 'palabra', 'editor.words': 'palabras',
    'editor.clear': 'Limpiar', 'editor.analyze': 'Analizar texto', 'editor.demoAnalyze': 'Consultar ejemplo',
    'editor.analyzing': 'Analizando…', 'editor.demoAnalyzing': 'Simulando consulta…',
    'editor.privacy': 'El texto se envía a Google. Solo el resultado se guarda en este navegador.',
    'editor.demoPrivacy': 'Demo con mocks: selecciona un ejemplo. Nada se envía fuera del navegador.',
    'result.title': 'Lo esencial', 'result.ready': 'Listo', 'result.label': 'TU ANÁLISIS', 'result.summary': 'RESUMEN',
    'result.sentiment': 'Sentimiento', 'result.language': 'Idioma detectado', 'result.keywords': 'Palabras clave',
    'result.category': 'Categoría', 'result.copy': 'Copiar JSON',
    'result.loading': 'Conectando las ideas…', 'result.loadingDetail': 'Gemini está leyendo tu texto. Buscamos lo esencial.',
    'result.demoLoading': 'Simulación de consulta…', 'result.demoLoadingDetail': 'Buscando la respuesta mock asociada al ejemplo.',
    'result.aiNote': 'Generado con IA. No es una verificación de hechos.',
    'result.demoNote': 'Respuesta mock relacionada con el ejemplo. No usa IA.',
    'result.errorTitle': 'Intentémoslo de nuevo', 'result.errorCaption': 'Tu texto sigue en el editor.',
    'result.emptyTitle': 'Las ideas están ahí.\nVamos a encontrarlas.',
    'result.emptyText': 'Agrega un texto y deja que la IA conecte los puntos por ti.',
    'result.demoEmptyText': 'Selecciona un ejemplo y consulta su respuesta de prueba.',
    'result.emptyCaption': 'UN POCO DE IA. MUCHA CLARIDAD.', 'result.demoEmptyCaption': 'MISMOS FLUJOS. DATOS DE PRUEBA.',
    'strip.label': 'PRUEBA UN TEXTO.', 'strip.strong': 'DESCUBRE OTRA PERSPECTIVA.',
    'strip.aria': 'Textos aleatorios por tipo', 'strip.randomAria': 'Texto aleatorio',
    'samples.articles': 'Artículos y noticias', 'samples.posts': 'Posts y tweets', 'samples.ideas': 'Ideas y párrafos', 'samples.places': 'Lugares',
    'samples.note': 'Ejemplos ficticios precargados · Cambian con cada clic',
    'samples.demoEnd': 'Cada ejemplo tiene una respuesta mock relacionada.', 'samples.productionEnd': 'Analiza cuando estés listo.',
    'alert.clearTitle': '¿Empezar de nuevo?', 'alert.clearText': 'Se borrarán el texto y el análisis de esta pantalla.',
    'alert.clearConfirm': 'Sí, limpiar', 'alert.cancel': 'Cancelar', 'alert.invalidTitle': 'Revisa tu texto',
    'alert.invalidText': 'Ingresa entre 1 y 12,000 caracteres para continuar.', 'alert.requestFailed': 'No fue posible analizar el texto.',
    'error.timeout': 'La solicitud tardó demasiado. Intenta de nuevo.', 'error.connection': 'No hay conexión con el servidor. Comprueba que esté en ejecución.',
    'error.invalidResult': 'El servidor devolvió un resultado inválido.', 'error.generic': 'Ocurrió un error. Intenta de nuevo.',
    'alert.analysisFailed': 'No pudimos analizarlo', 'alert.copied': 'JSON copiado', 'alert.copyFailed': 'No se pudo copiar',
    'alert.copyText': 'Tu navegador no permitió acceder al portapapeles.',
    'history.eyebrow': 'TUS IDEAS, CON CONTEXTO', 'history.title': 'Historial',
    'history.description': 'Vuelve a lo esencial de tus últimos análisis.',
    'history.session': 'Hasta 500 resultados guardados solo en este navegador. El texto original no se conserva.',
    'history.demoSession': 'La consulta de ejemplo y su respuesta mock se guardan solo en este navegador.',
    'history.emptyTitle': 'Todo empieza con un texto', 'history.emptyText': 'Los análisis completados aparecerán aquí, del más reciente al más antiguo.',
    'history.first': 'Analizar mi primer texto', 'history.viewQuery': 'Ver consulta y palabras clave', 'history.viewKeywords': 'Ver palabras clave',
    'history.loadMore': 'Cargar más', 'history.end': 'Ya viste todos tus análisis', 'history.localRecords': 'registros locales',
    'summary.eyebrow': 'UNA MIRADA AL CONJUNTO', 'summary.title': 'Tu resumen',
    'summary.description': 'Descubre qué temas aparecen en tus análisis.',
    'summary.session': 'Métricas calculadas en este navegador a partir de hasta 500 resultados locales.',
    'summary.emptyTitle': 'Todavía no hay temas por descubrir', 'summary.emptyText': 'Analiza tu primer texto para ver el resumen de categorías.',
    'summary.goAnalyzer': 'Ir al analizador', 'summary.saved': 'Análisis guardados', 'summary.inBrowser': 'En este navegador',
    'summary.detected': 'Categorías detectadas', 'summary.perspectives': 'Perspectivas diferentes',
    'summary.frequent': 'Tema más frecuente', 'summary.inCategory': 'análisis en esta categoría',
    'summary.chartTitle': 'Tu contenido, por categoría', 'summary.explore': 'Explorar el historial',
    'info.eyebrow': 'DEL TEXTO A LO ESENCIAL', 'info.title1': 'Una idea entra.', 'info.title2': 'La claridad sale.',
    'info.description': 'Texta combina una interfaz Svelte, una API Node.js y Gemini para transformar contenido libre en datos claros, sin convertir el historial en información compartida.',
    'info.flow': 'FLUJO', 'info.flowTitle': 'Cómo viaja un análisis', 'info.flowStatus': 'Flujo protegido de extremo a extremo',
    'info.return': 'RETORNO · RESULTADO VALIDADO',
    'info.step1Title': 'Tu navegador', 'info.step1Detail': 'Escribes o cargas un texto. La API key nunca llega al frontend.', 'info.step1Tag': 'Entrada privada',
    'info.step2Title': 'API de Texta', 'info.step2Detail': 'Express valida el tamaño, limita solicitudes y prepara una instrucción segura.',
    'info.step3Detail': 'La IA devuelve resumen, sentimiento, idioma, palabras clave y categoría.', 'info.step3Tag': 'JSON estructurado',
    'info.step4Title': 'Resultado local', 'info.step4Detail': 'Texta valida la respuesta y guarda solo el resultado en tu navegador.',
    'info.capability': '01 / CAPACIDAD', 'info.capabilityTitle': 'Qué entrega',
    'info.capabilityText': 'Un resumen breve en español, sentimiento, idioma original, hasta diez palabras clave y una categoría temática.',
    'info.privacy': '02 / PRIVACIDAD', 'info.privacyTitle': 'Qué conserva',
    'info.privacyText': 'Hasta 500 resultados en este navegador. No guarda el texto original, no crea cuentas y no comparte el historial con otras personas.',
    'info.limits': '03 / LÍMITES', 'info.limitsTitle': 'Qué debes saber',
    'info.limitsText': 'La IA puede equivocarse y no verifica hechos. Cada instalación necesita su propia API key y cuota disponible de Gemini.',
    'info.calloutDemoTitle': 'Esta publicación usa respuestas mock.',
    'info.calloutDemoText': 'El diagrama explica el modo productivo. Aquí eliges un ejemplo, se simula la consulta y se devuelve su respuesta de prueba sin llamar a Gemini.',
    'info.calloutProdTitle': 'La key se queda en el servidor.',
    'info.calloutProdText': 'El navegador habla con Texta; Texta habla con Gemini. El resultado regresa validado antes de mostrarse.',
    'info.tryExamples': 'Probar los ejemplos', 'info.tryAnalyzer': 'Probar el analizador',
  },
};

const categories = {
  en: { tecnología: 'Technology', deportes: 'Sports', política: 'Politics', entretenimiento: 'Entertainment', ciencia: 'Science', negocios: 'Business', otro: 'Other' },
  es: { tecnología: 'Tecnología', deportes: 'Deportes', política: 'Política', entretenimiento: 'Entretenimiento', ciencia: 'Ciencia', negocios: 'Negocios', otro: 'Otro' },
};

const sentiments = {
  en: { positive: 'Positive', negative: 'Negative', neutral: 'Neutral' },
  es: { positive: 'Positivo', negative: 'Negativo', neutral: 'Neutral' },
};

export function normalizeLanguage(value) {
  return value === 'es' ? 'es' : DEFAULT_LANGUAGE;
}

export function translate(language, key, replacements = {}) {
  const selected = normalizeLanguage(language);
  const template = messages[selected][key] ?? messages.en[key] ?? key;
  return Object.entries(replacements).reduce((value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)), template);
}

export function categoryName(category, language) {
  const selected = normalizeLanguage(language);
  return categories[selected][category] ?? category;
}

export function sentimentName(sentiment, language) {
  const selected = normalizeLanguage(language);
  return sentiments[selected][sentiment] ?? sentiment;
}

export function formatDate(value, language) {
  const locale = normalizeLanguage(language) === 'es' ? 'es-MX' : 'en-US';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function displayLanguage(code, language) {
  const locale = normalizeLanguage(language) === 'es' ? 'es' : 'en';
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(code);
  } catch {
    return code;
  }
}

export function formatNumber(value, language) {
  return Number(value).toLocaleString(normalizeLanguage(language) === 'es' ? 'es-MX' : 'en-US');
}

export function analysisCount(language, count) {
  if (normalizeLanguage(language) === 'es') return `${count} análisis`;
  return `${count} ${count === 1 ? 'analysis' : 'analyses'}`;
}
