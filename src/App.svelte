<script>
  import Swal from 'sweetalert2';
  import { analysisSchema, MAX_TEXT_LENGTH } from '../shared/analysis.js';
  let text = $state('');
  let loading = $state(false);
  let result = $state(null);
  let error = $state('');
  let resultPanel;
  const example = 'Apple presentó hoy el iPhone 17 con una cámara revolucionaria de 200MP y un chip A19 que promete el doble de rendimiento. Los analistas esperan que las ventas superen los 100 millones de unidades en el primer trimestre.';
  const sentiments = { positive: { label: 'Positivo', symbol: '↗' }, negative: { label: 'Negativo', symbol: '↘' }, neutral: { label: 'Neutral', symbol: '→' } };
  const words = $derived(text.trim() ? text.trim().split(/\s+/).length : 0);
  const alert = (options) => Swal.fire({ confirmButtonColor: '#171918', ...options });
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
      result = analysisSchema.parse(data);
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
  function info() { alert({ title: 'Del texto a lo esencial', text: 'Gemini genera un resumen en español y detecta el sentimiento, el idioma original, las palabras clave y la categoría. La IA puede equivocarse y no verifica los hechos. Al analizar, el texto se envía a Google Gemini. Esta app no guarda tu historial.', icon: 'info', confirmButtonText: 'Entendido' }); }
</script>

<svelte:head><title>Texta — Dale sentido a tus palabras</title></svelte:head>

<div class="app-shell">
  <aside class="rail" aria-label="Identidad de la aplicación">
    <a href="#main" class="logo-symbol" aria-label="Texta, ir al analizador">t<span>✳</span></a>
    <div class="rail-line"></div><a href="#editor" class="rail-active" aria-label="Editor de texto">≡</a>
    <span class="rail-bottom">IA</span>
  </aside>
  <div class="page">
    <header class="topbar"><a class="wordmark" href="#main">texta<span>®</span></a><div class="topbar-right"><span class="powered"><span class="gemini-star">✦</span> Powered by Gemini</span><button class="help-button" onclick={info}>Cómo funciona <span>↗</span></button></div></header>
    <main id="main">
      <section class="intro" aria-labelledby="title"><div><div class="eyebrow"><span></span> MENOS RUIDO. MÁS CONTEXTO.</div><h1 id="title">Mucho texto.<br /><mark>Todo claro.</mark><span class="period">✳</span></h1><p>Encuentra lo esencial de cualquier texto.<br class="desktop-break" /> Un resumen, su intención y las palabras que importan.</p></div><div class="intro-note"><span class="note-star">✳</span><p>Tu siguiente gran idea<br />empieza por entender.</p><span class="note-arrow">↙</span></div></section>
      <div class="workspace">
        <section class="editor-card" id="editor" aria-labelledby="editor-title"><div class="card-heading"><div><span class="step">01</span><h2 id="editor-title">Tu texto, aquí</h2></div><button class="text-button" onclick={loadExample} disabled={loading}>Probar un ejemplo <span>↗</span></button></div>
          <form onsubmit={analyze}><label class="sr-only" for="text">Texto para analizar</label><textarea id="text" bind:value={text} disabled={loading} maxlength={MAX_TEXT_LENGTH} placeholder="Pega ese artículo, tweet o idea que tienes en mente…" aria-describedby="text-hint text-counter" oninput={() => { result = null; error = ''; }}></textarea>
            <div class="editor-meta"><span>{words} {words === 1 ? 'palabra' : 'palabras'}</span><span id="text-counter">{text.length.toLocaleString('es-MX')} / 12,000</span></div>
            <div class="editor-actions"><button type="button" class="clear-button" onclick={clear} disabled={loading || (!text && !result)}>Limpiar</button><button class="analyze-button" type="submit" disabled={loading || !text.trim()}>{#if loading}<span class="spinner"></span> Analizando…{:else}<span>✦</span> Analizar texto <span>↗</span>{/if}</button></div>
          </form><p class="privacy" id="text-hint"><span>◇</span> Al analizar, envías tu texto a Google Gemini. Sin historial en esta app.</p>
        </section>
        <section class="results-card" aria-labelledby="results-title" aria-busy={loading} bind:this={resultPanel} tabindex="-1"><div class="card-heading"><div><span class="step">02</span><h2 id="results-title">Lo esencial</h2></div>{#if result}<span class="ready"><span></span> Listo</span>{:else}<span class="result-label">TU ANÁLISIS</span>{/if}</div>
          <div aria-live="polite" class="result-body">
          {#if loading}<div class="empty-state"><div class="analysis-orbit loading-orbit">✦</div><h3>Conectando las ideas…</h3><p>Gemini está leyendo tu texto.<br />Esto puede tomar unos segundos.</p><div class="skeleton"></div><div class="skeleton short"></div></div>
          {:else if result}<div class="result-content"><div class="summary-label">RESUMEN</div><p class="summary">{result.summary}</p><div class="insight-grid"><div class="insight"><span class="field-label">Sentimiento</span><span class="sentiment {result.sentiment}">{sentiments[result.sentiment].symbol} {sentiments[result.sentiment].label}</span></div><div class="insight"><span class="field-label">Idioma detectado</span><strong class="language">{languageName(result.language)} <small>{result.language}</small></strong></div></div><div class="keyword-block"><span class="field-label">Palabras clave</span><div class="tags">{#each result.keywords as keyword}<span>{keyword}</span>{/each}</div></div><div class="result-bottom"><div><span class="field-label">Categoría</span><span class="category">{result.category}</span></div><button class="text-button" onclick={copy}>Copiar JSON ↗</button></div><p class="ai-note">Generado con IA. Revisa el resultado; no es una verificación de hechos.</p></div>
          {:else if error}<div class="empty-state error-state"><div class="analysis-orbit">!</div><h3>Intentémoslo de nuevo</h3><p role="alert">{error}</p><span class="empty-caption">Tu texto sigue en el editor.</span></div>
          {:else}<div class="empty-state"><div class="analysis-orbit"><span>✳</span></div><h3>Las ideas están ahí.<br />Vamos a encontrarlas.</h3><p>Agrega un texto y deja que la IA<br />conecte los puntos por ti.</p><div class="preview-tags"><span>Resumen</span><span>Sentimiento</span><span>Keywords</span></div><span class="empty-caption">UN POCO DE IA. MUCHA CLARIDAD.</span></div>{/if}
          </div>
        </section>
      </div>
      <section class="feature-strip" aria-label="Qué puedes analizar"><span class="strip-label">CUALQUIER TEXTO.<br /><strong>OTRA PERSPECTIVA.</strong></span><span>↗ Artículos y noticias</span><span>↗ Posts y tweets</span><span>↗ Ideas y párrafos</span><span class="strip-end">Tú pones las palabras.<br /><strong>Nosotros, el contexto.</strong></span></section>
      <footer><span>texta<span class="footer-star">✳</span> <span class="footer-divider">/</span> Hecho para entender.</span><span>Inteligencia artificial, claridad humana.</span></footer>
    </main>
  </div>
</div>
