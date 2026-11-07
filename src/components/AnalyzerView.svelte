<script>
  import Swal from 'sweetalert2';
  import { analysisResponseSchema, MAX_TEXT_LENGTH } from '../../shared/analysis.js';
  import BrandLoading from './BrandLoading.svelte';
  import Icon from './Icon.svelte';
  import { createDemoAnalysis } from '../lib/demo.js';
  import { pickSample, sampleKinds } from '../lib/samples.js';

  let { demoMode = false, onSaved = () => {}, onLoadingChange = () => {} } = $props();
  let text = $state('');
  let loading = $state(false);
  let result = $state(null);
  let error = $state('');
  let resultPanel = $state();
  const example = 'Apple presentó hoy el iPhone 17 con una cámara revolucionaria de 200MP y un chip A19 que promete el doble de rendimiento. Los analistas esperan que las ventas superen los 100 millones de unidades en el primer trimestre.';
  const sentiments = {
    positive: { label: 'Positivo', symbol: '↗' },
    negative: { label: 'Negativo', symbol: '↘' },
    neutral: { label: 'Neutral', symbol: '→' },
  };
  const categoryClasses = {
    tecnología: 'technology',
    deportes: 'sports',
    política: 'politics',
    entretenimiento: 'entertainment',
    ciencia: 'science',
    negocios: 'business',
    otro: 'other',
  };
  const words = $derived(text.trim() ? text.trim().split(/\s+/).length : 0);
  const alert = options => Swal.fire({ confirmButtonColor: '#171918', ...options });

  function formatDate(value) {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }

  function languageName(code) {
    try {
      return new Intl.DisplayNames(['es'], { type: 'language' }).of(code);
    } catch {
      return code;
    }
  }

  function categoryClass(category) {
    return `category-${categoryClasses[category] || 'other'}`;
  }

  function setText(value) {
    text = value;
    result = null;
    error = '';
    requestAnimationFrame(() => document.getElementById('text')?.focus());
  }

  function loadRandom(kind = 'all') {
    const sample = pickSample(kind, text);
    if (sample) setText(sample);
  }

  async function clear() {
    if (!text && !result) return;
    const answer = await alert({
      title: '¿Empezar de nuevo?',
      text: 'Se borrarán el texto y el análisis de esta pantalla.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
    });
    if (answer.isConfirmed) setText('');
  }

  async function analyze(event) {
    event.preventDefault();
    if (loading) return;
    if (!text.trim() || text.length > MAX_TEXT_LENGTH) {
      await alert({ title: 'Revisa tu texto', text: 'Ingresa entre 1 y 12,000 caracteres para continuar.', icon: 'info' });
      return;
    }

    loading = true;
    onLoadingChange(true);
    result = null;
    error = '';
    try {
      let data;
      if (demoMode) {
        // The static demo waits like a request, then resolves the exact mock attached to the selected sample.
        await new Promise(resolve => setTimeout(resolve, 1400));
        data = createDemoAnalysis(text);
      } else {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: AbortSignal.timeout(35000),
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'No fue posible analizar el texto.');
      }
      // Validate the API boundary again before rendering or saving anything in this browser.
      result = analysisResponseSchema.parse(data);
      onSaved(demoMode ? { ...result, sourceText: text, simulated: true } : result);
      requestAnimationFrame(() => resultPanel?.focus());
    } catch (cause) {
      error = cause.name === 'TimeoutError'
        ? 'La solicitud tardó demasiado. Intenta de nuevo.'
        : cause instanceof TypeError
          ? 'No hay conexión con el servidor. Comprueba que esté en ejecución.'
          : cause.name === 'ZodError'
            ? 'El servidor devolvió un resultado inválido.'
            : cause.message || 'Ocurrió un error. Intenta de nuevo.';
      await alert({ icon: 'error', title: 'No pudimos analizarlo', text: error, confirmButtonText: 'Entendido' });
    } finally {
      loading = false;
      onLoadingChange(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      await alert({ toast: true, position: 'top-end', icon: 'success', title: 'JSON copiado', showConfirmButton: false, timer: 2000 });
    } catch {
      await alert({ icon: 'info', title: 'No se pudo copiar', text: 'Tu navegador no permitió acceder al portapapeles.' });
    }
  }
</script>

<section class="intro" aria-labelledby="title">
  <div>
    <div class="eyebrow"><span></span> MENOS RUIDO. MÁS CONTEXTO.</div>
    <h1 id="title">Mucho texto.<br /><mark>Todo claro.</mark><span class="period">✳</span></h1>
    <p>Encuentra lo esencial de cualquier texto.<br class="desktop-break" /> Un resumen, su intención y las palabras que importan.</p>
  </div>
  <div class="intro-note"><span class="note-star">✳</span><p>Tu siguiente gran idea<br />empieza por entender.</p><span class="note-arrow">↙</span></div>
</section>

<div class="workspace">
  <section class="editor-card" id="editor" aria-labelledby="editor-title">
    <div class="card-heading">
      <div><span class="step">01</span><h2 id="editor-title">Tu texto, aquí</h2></div>
      <button class="text-button" onclick={() => demoMode ? loadRandom() : setText(example)} disabled={loading}>Probar un ejemplo <span>↗</span></button>
    </div>
    <div class="random-toolbar"><button class="random-button" onclick={() => loadRandom()} disabled={loading}><Icon name="shuffle" /> Texto aleatorio</button><span>Ejemplos listos, sin esperas</span></div>
    <form onsubmit={analyze}>
      <label class="sr-only" for="text">Texto para analizar</label>
      <textarea id="text" bind:value={text} disabled={loading || demoMode} maxlength={MAX_TEXT_LENGTH} placeholder={demoMode ? 'Selecciona uno de los ejemplos disponibles…' : 'Pega ese artículo, tweet o idea que tienes en mente…'} aria-describedby="text-hint text-counter" oninput={() => { result = null; error = ''; }}></textarea>
      <div class="editor-meta"><span>{words} {words === 1 ? 'palabra' : 'palabras'}</span><span id="text-counter">{text.length.toLocaleString('es-MX')} / 12,000</span></div>
      <div class="editor-actions">
        <button type="button" class="clear-button" onclick={clear} disabled={loading || (!text && !result)}>Limpiar</button>
        <button class="analyze-button" type="submit" disabled={loading || !text.trim()}>{#if loading}<span class="spinner"></span> {demoMode ? 'Simulando consulta…' : 'Analizando…'}{:else}<span>✦</span> {demoMode ? 'Consultar ejemplo' : 'Analizar texto'} <span>↗</span>{/if}</button>
      </div>
    </form>
    <p class="privacy" id="text-hint"><span>◇</span> {demoMode ? 'Demo con mocks: selecciona un ejemplo. Nada se envía fuera del navegador.' : 'El texto se envía a Google. Solo el resultado se guarda en este navegador.'}</p>
  </section>

  <section class="results-card" aria-labelledby="results-title" aria-busy={loading} bind:this={resultPanel} tabindex="-1">
    <div class="card-heading"><div><span class="step">02</span><h2 id="results-title">Lo esencial</h2></div>{#if result}<span class="ready"><span></span> Listo</span>{:else}<span class="result-label">TU ANÁLISIS</span>{/if}</div>
    <div aria-live="polite" class="result-body">
      {#if loading}
        <BrandLoading title={demoMode ? 'Simulación de consulta…' : 'Conectando las ideas…'} detail={demoMode ? 'Buscando la respuesta mock asociada al ejemplo.' : 'Gemini está leyendo tu texto. Buscamos lo esencial.'} />
      {:else if result}
        <div class="result-content">
          <div class="summary-label">RESUMEN</div><p class="summary">{result.summary}</p>
          <div class="insight-grid">
            <div class="insight"><span class="field-label">Sentimiento</span><span class="sentiment {result.sentiment}">{sentiments[result.sentiment].symbol} {sentiments[result.sentiment].label}</span></div>
            <div class="insight"><span class="field-label">Idioma detectado</span><strong class="language">{languageName(result.language)} <small>{result.language}</small></strong></div>
          </div>
          <div class="keyword-block"><span class="field-label">Palabras clave</span><div class="tags">{#each result.keywords as keyword}<span>{keyword}</span>{/each}</div></div>
          <div class="result-bottom"><div><span class="field-label">Categoría</span><span class="category {categoryClass(result.category)}">{result.category}</span></div><button class="text-button" onclick={copy}>Copiar JSON ↗</button></div>
          <p class="ai-note"><time datetime={result.analyzedAt}>{formatDate(result.analyzedAt)}</time> · {demoMode ? 'Respuesta mock relacionada con el ejemplo. No usa IA.' : 'Generado con IA. No es una verificación de hechos.'}</p>
        </div>
      {:else if error}
        <div class="empty-state error-state"><div class="analysis-orbit">!</div><h3>Intentémoslo de nuevo</h3><p role="alert">{error}</p><span class="empty-caption">Tu texto sigue en el editor.</span></div>
      {:else}
        <div class="empty-state"><div class="analysis-orbit"><span>✳</span></div><h3>Las ideas están ahí.<br />Vamos a encontrarlas.</h3><p>{demoMode ? 'Selecciona un ejemplo y consulta su respuesta de prueba.' : 'Agrega un texto y deja que la IA conecte los puntos por ti.'}</p><div class="preview-tags"><span>Resumen</span><span>Sentimiento</span><span>Keywords</span></div><span class="empty-caption">{demoMode ? 'MISMOS FLUJOS. DATOS DE PRUEBA.' : 'UN POCO DE IA. MUCHA CLARIDAD.'}</span></div>
      {/if}
    </div>
  </section>
</div>

<section class="feature-strip" aria-label="Textos aleatorios por tipo"><span class="strip-label">PRUEBA UN TEXTO.<br /><strong>DESCUBRE OTRA PERSPECTIVA.</strong></span>{#each sampleKinds as kind}<button class="sample-kind" disabled={loading} onclick={() => loadRandom(kind.id)} aria-label={'Texto aleatorio: ' + kind.label}>↗ {kind.label}</button>{/each}</section>
<p class="sample-note">Ejemplos ficticios precargados · Cambian con cada clic · {demoMode ? 'Cada ejemplo tiene una respuesta mock relacionada.' : 'Analiza cuando estés listo.'}</p>
