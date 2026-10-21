<script>
  import Swal from 'sweetalert2';
  import { onMount, untrack, tick } from 'svelte';
  import { analysisResponseSchema, historyPageSchema, summarySchema, MAX_TEXT_LENGTH } from '../shared/analysis.js';
  import BrandLoading from './components/BrandLoading.svelte';
  import Icon from './components/Icon.svelte';
  import { pickSample, sampleKinds } from './lib/samples.js';
  let view = $state('analyze');
  const menu = [{ id: 'analyze', label: 'Analizador', icon: 'analyze' }, { id: 'history', label: 'Historial', icon: 'history' }, { id: 'summary', label: 'Resumen', icon: 'summary' }];
  let historyItems = $state([]);
  let historyCursor = $state(null);
  let historyHasMore = $state(false);
  let historyLoading = $state(false);
  let moreLoading = $state(false);
  let historyError = $state('');
  let historyRequest = 0;
  let summaryData = $state({});
  let summaryLoading = $state(false);
  let summaryError = $state('');
  const categoryCounts = $derived(Object.entries(summaryData).sort((a, b) => b[1] - a[1]));
  const totalAnalyses = $derived(categoryCounts.reduce((total, [, count]) => total + count, 0));
  let text = $state('');
  let loading = $state(false);
  let result = $state(null);
  let error = $state('');
  let resultPanel = $state();
  const example = 'Apple presentó hoy el iPhone 17 con una cámara revolucionaria de 200MP y un chip A19 que promete el doble de rendimiento. Los analistas esperan que las ventas superen los 100 millones de unidades en el primer trimestre.';
  const sentiments = { positive: { label: 'Positivo', symbol: '↗' }, negative: { label: 'Negativo', symbol: '↘' }, neutral: { label: 'Neutral', symbol: '→' } };
  const words = $derived(text.trim() ? text.trim().split(/\s+/).length : 0);
  const alert = (options) => Swal.fire({ confirmButtonColor: '#171918', ...options });
  onMount(() => {
    const syncRoute = () => {
      view = menu.some(item => item.id === location.hash.slice(1)) ? location.hash.slice(1) : 'analyze';
      tick().then(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    };
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  });
  $effect(() => {
    const selected = view;
    untrack(() => {
      if (selected === 'history') loadHistory(true);
      if (selected === 'summary') loadSummary();
    });
  });
  async function getJson(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'No fue posible cargar la información.');
    return data;
  }
  function requestMessage(e) {
    return e.name === 'ZodError' ? 'La información recibida no tiene el formato esperado.' : e.name === 'TimeoutError' ? 'La solicitud tardó demasiado. Intenta de nuevo.' : e instanceof TypeError ? 'No hay conexión con el servidor.' : e.message;
  }
  async function loadHistory(reset = false) {
    if (!reset && (moreLoading || !historyHasMore)) return;
    const request = ++historyRequest;
    if (reset) { historyLoading = true; historyItems = []; historyCursor = null; historyHasMore = false; }
    else moreLoading = true;
    historyError = '';
    try {
      const params = new URLSearchParams({ limit: '10' });
      if (!reset && historyCursor) params.set('before', historyCursor);
      const data = historyPageSchema.parse(await getJson(`/api/history?${params}`));
      if (request !== historyRequest) return;
      historyItems = reset ? data.items : [...historyItems, ...data.items];
      historyCursor = data.nextCursor;
      historyHasMore = data.hasMore;
    } catch (e) { if (request === historyRequest) historyError = requestMessage(e); }
    finally { if (request === historyRequest) { historyLoading = false; moreLoading = false; } }
  }
  async function loadSummary() {
    summaryLoading = true; summaryError = '';
    try { summaryData = summarySchema.parse(await getJson('/api/summary')); }
    catch (e) { summaryError = requestMessage(e); }
    finally { summaryLoading = false; }
  }
  function formatDate(value) { return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
  function loadRandom(kind = 'all') {
    const sample = pickSample(kind, text);
    if (sample) { text = sample; result = null; error = ''; requestAnimationFrame(() => document.getElementById('text')?.focus()); }
  }
  function languageName(code) {
    try { return new Intl.DisplayNames(['es'], { type: 'language' }).of(code); } catch { return code; }
  }
  function loadExample() { text = example; result = null; error = ''; }
  async function clear() {
    if (!text && !result) return;
    const answer = await alert({ title: '¿Empezar de nuevo?', text: 'Se borrarán el texto y el análisis de esta pantalla.', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, limpiar', cancelButtonText: 'Cancelar' });
    if (answer.isConfirmed) { text = ''; result = null; error = ''; }
  }
  async function analyze(event) {
    event.preventDefault();
    if (loading) return;
    if (!text.trim() || text.length > MAX_TEXT_LENGTH) {
      await alert({ title: 'Revisa tu texto', text: 'Ingresa entre 1 y 12,000 caracteres para continuar.', icon: 'info' }); return;
    }
    loading = true; result = null; error = '';
    try {
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), signal: AbortSignal.timeout(35000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'No fue posible analizar el texto.');
      result = analysisResponseSchema.parse(data);
      requestAnimationFrame(() => resultPanel?.focus());
    } catch (e) {
      error = e.name === 'TimeoutError' ? 'La solicitud tardó demasiado. Intenta de nuevo.' : e instanceof TypeError ? 'No hay conexión con el servidor. Comprueba que esté en ejecución.' : e.name === 'ZodError' ? 'El servidor devolvió un resultado inválido.' : e.message || 'Ocurrió un error. Intenta de nuevo.';
      await alert({ icon: 'error', title: 'No pudimos analizarlo', text: error, confirmButtonText: 'Entendido' });
    } finally { loading = false; }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(JSON.stringify(result, null, 2)); await alert({ toast: true, position: 'top-end', icon: 'success', title: 'JSON copiado', showConfirmButton: false, timer: 2000 }); }
    catch { await alert({ icon: 'info', title: 'No se pudo copiar', text: 'Tu navegador no permitió acceder al portapapeles.' }); }
  }
  function info() { alert({ title: 'Del texto a lo esencial', text: 'Gemini resume y clasifica tu texto; puede equivocarse y no verifica hechos. El texto se envía a Google. Esta instancia conserva hasta 500 análisis en memoria hasta reiniciar el servidor, sin guardar el texto original. El historial es compartido por quienes usan esta instancia local. Los textos aleatorios son ejemplos precargados y no noticias verificadas.', icon: 'info', confirmButtonText: 'Entendido' }); }
</script>

<svelte:head><title>{view === 'history' ? 'Historial de análisis | Texta' : view === 'summary' ? 'Resumen por categoría | Texta' : 'Texta | Analizador de texto con IA: resumen y sentimiento'}</title></svelte:head>

<div class="app-shell">
  <aside class="rail" aria-label="Identidad de la aplicación">
    <a href="#analyze" class="logo-symbol" aria-label="Texta, ir al analizador">t<span>✳</span></a>
    <div class="rail-line"></div>
    <nav class="main-nav" aria-label="Menú principal">{#each menu as item}<a href={'#' + item.id} class:active={view === item.id} aria-current={view === item.id ? 'page' : undefined}><Icon name={item.icon} /><span>{item.label}</span></a>{/each}</nav>
    <span class="rail-bottom">IA</span>
  </aside>
  <div class="page">
    <header class="topbar"><a class="wordmark" href="#analyze">texta<span>®</span></a><div class="topbar-right">{#if loading}<span class="global-loading" role="status"><span class="spinner"></span> Analizando texto…</span>{:else}<span class="powered"><span class="gemini-star">✦</span> Powered by Gemini</span>{/if}<button class="help-button" onclick={info}>Cómo funciona <span>↗</span></button></div></header>
    <main id="main">
      {#if view === 'analyze'}
      <section class="intro" aria-labelledby="title"><div><div class="eyebrow"><span></span> MENOS RUIDO. MÁS CONTEXTO.</div><h1 id="title">Mucho texto.<br /><mark>Todo claro.</mark><span class="period">✳</span></h1><p>Encuentra lo esencial de cualquier texto.<br class="desktop-break" /> Un resumen, su intención y las palabras que importan.</p></div><div class="intro-note"><span class="note-star">✳</span><p>Tu siguiente gran idea<br />empieza por entender.</p><span class="note-arrow">↙</span></div></section>
      <div class="workspace">
        <section class="editor-card" id="editor" aria-labelledby="editor-title"><div class="card-heading"><div><span class="step">01</span><h2 id="editor-title">Tu texto, aquí</h2></div><button class="text-button" onclick={loadExample} disabled={loading}>Probar un ejemplo <span>↗</span></button></div><div class="random-toolbar"><button class="random-button" onclick={() => loadRandom()} disabled={loading}><Icon name="shuffle" /> Texto aleatorio</button><span>Ejemplos listos, sin esperas</span></div>
          <form onsubmit={analyze}><label class="sr-only" for="text">Texto para analizar</label><textarea id="text" bind:value={text} disabled={loading} maxlength={MAX_TEXT_LENGTH} placeholder="Pega ese artículo, tweet o idea que tienes en mente…" aria-describedby="text-hint text-counter" oninput={() => { result = null; error = ''; }}></textarea>
            <div class="editor-meta"><span>{words} {words === 1 ? 'palabra' : 'palabras'}</span><span id="text-counter">{text.length.toLocaleString('es-MX')} / 12,000</span></div>
            <div class="editor-actions"><button type="button" class="clear-button" onclick={clear} disabled={loading || (!text && !result)}>Limpiar</button><button class="analyze-button" type="submit" disabled={loading || !text.trim()}>{#if loading}<span class="spinner"></span> Analizando…{:else}<span>✦</span> Analizar texto <span>↗</span>{/if}</button></div>
          </form><p class="privacy" id="text-hint"><span>◇</span> Texto enviado a Google. Análisis guardado en memoria hasta reiniciar.</p>
        </section>
        <section class="results-card" aria-labelledby="results-title" aria-busy={loading} bind:this={resultPanel} tabindex="-1"><div class="card-heading"><div><span class="step">02</span><h2 id="results-title">Lo esencial</h2></div>{#if result}<span class="ready"><span></span> Listo</span>{:else}<span class="result-label">TU ANÁLISIS</span>{/if}</div>
          <div aria-live="polite" class="result-body">
          {#if loading}<BrandLoading title="Conectando las ideas…" detail="Gemini está leyendo tu texto. Buscamos lo esencial." />
          {:else if result}<div class="result-content"><div class="summary-label">RESUMEN</div><p class="summary">{result.summary}</p><div class="insight-grid"><div class="insight"><span class="field-label">Sentimiento</span><span class="sentiment {result.sentiment}">{sentiments[result.sentiment].symbol} {sentiments[result.sentiment].label}</span></div><div class="insight"><span class="field-label">Idioma detectado</span><strong class="language">{languageName(result.language)} <small>{result.language}</small></strong></div></div><div class="keyword-block"><span class="field-label">Palabras clave</span><div class="tags">{#each result.keywords as keyword}<span>{keyword}</span>{/each}</div></div><div class="result-bottom"><div><span class="field-label">Categoría</span><span class="category">{result.category}</span></div><button class="text-button" onclick={copy}>Copiar JSON ↗</button></div><p class="ai-note"><time datetime={result.analyzedAt}>{formatDate(result.analyzedAt)}</time> · Generado con IA. No es una verificación de hechos.</p></div>
          {:else if error}<div class="empty-state error-state"><div class="analysis-orbit">!</div><h3>Intentémoslo de nuevo</h3><p role="alert">{error}</p><span class="empty-caption">Tu texto sigue en el editor.</span></div>
          {:else}<div class="empty-state"><div class="analysis-orbit"><span>✳</span></div><h3>Las ideas están ahí.<br />Vamos a encontrarlas.</h3><p>Agrega un texto y deja que la IA<br />conecte los puntos por ti.</p><div class="preview-tags"><span>Resumen</span><span>Sentimiento</span><span>Keywords</span></div><span class="empty-caption">UN POCO DE IA. MUCHA CLARIDAD.</span></div>{/if}
          </div>
        </section>
      </div>
      <section class="feature-strip" aria-label="Textos aleatorios por tipo"><span class="strip-label">PRUEBA UN TEXTO.<br /><strong>DESCUBRE OTRA PERSPECTIVA.</strong></span>{#each sampleKinds as kind}<button class="sample-kind" disabled={loading} onclick={() => loadRandom(kind.id)} aria-label={'Texto aleatorio: ' + kind.label}>↗ {kind.label}</button>{/each}</section><p class="sample-note">Ejemplos ficticios precargados · Cambian con cada clic · Analiza cuando estés listo.</p>
      {:else if view === 'history'}
        <section class="data-view" aria-labelledby="history-title"><header class="view-header"><div><div class="eyebrow"><span></span> TUS IDEAS, CON CONTEXTO</div><h1 class="view-title" id="history-title">Historial<span>↗</span></h1><p>Vuelve a lo esencial de tus últimos análisis.</p></div><button class="secondary-button" onclick={() => loadHistory(true)} disabled={historyLoading || moreLoading}>Actualizar ↻</button></header><p class="session-note">Hasta 500 análisis de esta instancia local. Se borran al reiniciar el servidor.</p>
        {#if historyLoading}<BrandLoading title="Recuperando tus análisis…" detail="Estamos preparando el historial de esta sesión." />
        {:else}
          {#if !historyItems.length && !historyError}<div class="data-empty"><Icon name="history" /><h2>Todo empieza con un texto</h2><p>Los análisis completados aparecerán aquí, del más reciente al más antiguo.</p><a class="primary-link" href="#analyze">Analizar mi primer texto ↗</a></div>{/if}
          <div class="history-list">{#each historyItems as item, index}<article class="history-item"><div class="history-meta"><span class="history-number">{String(index + 1).padStart(2, '0')}</span><time datetime={item.analyzedAt}>{formatDate(item.analyzedAt)}</time><span class="sentiment {item.sentiment}">{sentiments[item.sentiment].symbol} {sentiments[item.sentiment].label}</span></div><p class="history-summary">{item.summary}</p><div class="history-tags"><span class="category">{item.category}</span><span class="language">{languageName(item.language)}</span></div><details><summary>Ver palabras clave</summary><div class="tags">{#each item.keywords as keyword}<span>{keyword}</span>{/each}</div></details></article>{/each}</div>
          {#if historyError}<div class="inline-error" role="alert"><p>{historyError}</p><button class="secondary-button" onclick={() => loadHistory(historyItems.length === 0)}>Reintentar</button></div>{/if}
          {#if historyHasMore}<div class="load-more"><button class="analyze-button" onclick={() => loadHistory()} disabled={moreLoading}>{#if moreLoading}<span class="spinner"></span> Cargando…{:else}Cargar más <span>↓</span>{/if}</button><p>{historyItems.length} análisis cargados</p></div>{:else if historyItems.length}<p class="list-end">Ya viste todos los análisis de esta sesión · {historyItems.length} registros</p>{/if}
        {/if}</section>
      {:else}
        <section class="data-view" aria-labelledby="summary-title"><header class="view-header"><div><div class="eyebrow"><span></span> UNA MIRADA AL CONJUNTO</div><h1 class="view-title" id="summary-title">Tu resumen<span>✳</span></h1><p>Descubre qué temas aparecen en tus análisis.</p></div><button class="secondary-button" onclick={loadSummary} disabled={summaryLoading}>Actualizar ↻</button></header><p class="session-note">Métricas de los análisis conservados en esta instancia local, hasta 500 registros.</p>
        {#if summaryLoading}<BrandLoading title="Conectando los temas…" detail="Estamos reuniendo las categorías de tus análisis." />
        {:else if summaryError}<div class="inline-error" role="alert"><p>{summaryError}</p><button class="secondary-button" onclick={loadSummary}>Reintentar</button></div>
        {:else if totalAnalyses === 0}<div class="data-empty"><Icon name="summary" /><h2>Todavía no hay temas por descubrir</h2><p>Analiza tu primer texto para ver el resumen de categorías.</p><a class="primary-link" href="#analyze">Ir al analizador ↗</a></div>
        {:else}<div class="stats-grid"><article class="stat-card accent-stat"><span>Análisis guardados</span><strong>{totalAnalyses}</strong><small>En esta sesión del servidor</small></article><article class="stat-card"><span>Categorías detectadas</span><strong>{categoryCounts.length}<small> / 7</small></strong><small>Perspectivas diferentes</small></article><article class="stat-card"><span>Tema más frecuente</span><strong class="top-category">{categoryCounts[0][0]}</strong><small>{categoryCounts[0][1]} análisis en esta categoría</small></article></div><section class="category-chart" aria-labelledby="categories-title"><div class="chart-heading"><h2 id="categories-title">Tu contenido, por categoría</h2><span>{totalAnalyses} análisis</span></div>{#each categoryCounts as [category, count]}<div class="category-row"><div><span>{category}</span><strong>{count} <small>· {Math.round(count / totalAnalyses * 100)}%</small></strong></div><div class="category-track" role="meter" aria-label={category} aria-valuenow={count} aria-valuemin="0" aria-valuemax={totalAnalyses}><span style:width={count / totalAnalyses * 100 + '%'}></span></div></div>{/each}<a class="text-button chart-link" href="#history">Explorar el historial ↗</a></section>{/if}</section>
      {/if}
      <footer><span>texta<span class="footer-star">✳</span> <span class="footer-divider">/</span> Hecho para entender.</span><span>Inteligencia artificial, claridad humana.</span></footer>
    </main>
  </div>
</div>
