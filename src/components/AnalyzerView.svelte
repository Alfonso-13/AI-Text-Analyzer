<script>
  import Swal from 'sweetalert2';
  import { analysisResponseSchema, MAX_TEXT_LENGTH } from '../../shared/analysis.js';
  import BrandLoading from './BrandLoading.svelte';
  import Icon from './Icon.svelte';
  import { createDemoAnalysis } from '../lib/demo.js';
  import { pickSample, sampleKinds } from '../lib/samples.js';
  import { categoryName, displayLanguage, formatDate, formatNumber, sentimentName, translate as t } from '../lib/i18n.js';

  let { demoMode = false, language = 'en', onSaved = () => {}, onLoadingChange = () => {} } = $props();
  let text = $state('');
  let loading = $state(false);
  let result = $state(null);
  let error = $state('');
  let resultPanel = $state();
  const example = 'Apple presentó hoy el iPhone 17 con una cámara revolucionaria de 200MP y un chip A19 que promete el doble de rendimiento. Los analistas esperan que las ventas superen los 100 millones de unidades en el primer trimestre.';
  const sentiments = {
    positive: { symbol: '↗' },
    negative: { symbol: '↘' },
    neutral: { symbol: '→' },
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
  const heroDescription = $derived(t(language, 'hero.description').split('\n'));
  const heroNote = $derived(t(language, 'hero.note').split('\n'));
  const emptyTitle = $derived(t(language, 'result.emptyTitle').split('\n'));
  const alert = options => Swal.fire({ confirmButtonColor: '#171918', ...options });

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
      title: t(language, 'alert.clearTitle'),
      text: t(language, 'alert.clearText'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t(language, 'alert.clearConfirm'),
      cancelButtonText: t(language, 'alert.cancel'),
    });
    if (answer.isConfirmed) setText('');
  }

  async function analyze(event) {
    event.preventDefault();
    if (loading) return;
    if (!text.trim() || text.length > MAX_TEXT_LENGTH) {
      await alert({ title: t(language, 'alert.invalidTitle'), text: t(language, 'alert.invalidText'), icon: 'info' });
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
        if (!response.ok) throw new Error(data.error?.message || t(language, 'alert.requestFailed'));
      }
      // Validate the API boundary again before rendering or saving anything in this browser.
      result = analysisResponseSchema.parse(data);
      onSaved(demoMode ? { ...result, sourceText: text, simulated: true } : result);
      requestAnimationFrame(() => resultPanel?.focus());
    } catch (cause) {
      error = cause.name === 'TimeoutError'
        ? t(language, 'error.timeout')
        : cause instanceof TypeError
          ? t(language, 'error.connection')
          : cause.name === 'ZodError'
            ? t(language, 'error.invalidResult')
            : cause.message || t(language, 'error.generic');
      await alert({ icon: 'error', title: t(language, 'alert.analysisFailed'), text: error, confirmButtonText: t(language, 'modal.confirm') });
    } finally {
      loading = false;
      onLoadingChange(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      await alert({ toast: true, position: 'top-end', icon: 'success', title: t(language, 'alert.copied'), showConfirmButton: false, timer: 2000 });
    } catch {
      await alert({ icon: 'info', title: t(language, 'alert.copyFailed'), text: t(language, 'alert.copyText') });
    }
  }
</script>

<section class="intro" aria-labelledby="title">
  <div>
    <div class="eyebrow"><span></span> {t(language, 'hero.eyebrow')}</div>
    <h1 id="title">{t(language, 'hero.line1')}<br /><mark>{t(language, 'hero.line2')}</mark><span class="period">✳</span></h1>
    <p>{heroDescription[0]}<br class="desktop-break" /> {heroDescription[1]}</p>
  </div>
  <div class="intro-note"><span class="note-star">✳</span><p>{heroNote[0]}<br />{heroNote[1]}</p><span class="note-arrow">↙</span></div>
</section>

<div class="workspace">
  <section class="editor-card" id="editor" aria-labelledby="editor-title">
    <div class="card-heading">
      <div><span class="step">01</span><h2 id="editor-title">{t(language, 'editor.title')}</h2></div>
      <button class="text-button" onclick={() => demoMode ? loadRandom() : setText(example)} disabled={loading}>{t(language, 'editor.example')} <span>↗</span></button>
    </div>
    <div class="random-toolbar"><button class="random-button" onclick={() => loadRandom()} disabled={loading}><Icon name="shuffle" /> {t(language, 'editor.random')}</button><span>{t(language, 'editor.samplesReady')}</span></div>
    <form onsubmit={analyze}>
      <label class="sr-only" for="text">{t(language, 'editor.label')}</label>
      <textarea id="text" bind:value={text} disabled={loading || demoMode} maxlength={MAX_TEXT_LENGTH} placeholder={t(language, demoMode ? 'editor.demoPlaceholder' : 'editor.placeholder')} aria-describedby="text-hint text-counter" oninput={() => { result = null; error = ''; }}></textarea>
      <div class="editor-meta"><span>{words} {t(language, words === 1 ? 'editor.word' : 'editor.words')}</span><span id="text-counter">{formatNumber(text.length, language)} / 12,000</span></div>
      <div class="editor-actions">
        <button type="button" class="clear-button" onclick={clear} disabled={loading || (!text && !result)}>{t(language, 'editor.clear')}</button>
        <button class="analyze-button" type="submit" disabled={loading || !text.trim()}>{#if loading}<span class="spinner"></span> {t(language, demoMode ? 'editor.demoAnalyzing' : 'editor.analyzing')}{:else}<span>✦</span> {t(language, demoMode ? 'editor.demoAnalyze' : 'editor.analyze')} <span>↗</span>{/if}</button>
      </div>
    </form>
    <p class="privacy" id="text-hint"><span>◇</span> {t(language, demoMode ? 'editor.demoPrivacy' : 'editor.privacy')}</p>
  </section>

  <section class="results-card" aria-labelledby="results-title" aria-busy={loading} bind:this={resultPanel} tabindex="-1">
    <div class="card-heading"><div><span class="step">02</span><h2 id="results-title">{t(language, 'result.title')}</h2></div>{#if result}<span class="ready"><span></span> {t(language, 'result.ready')}</span>{:else}<span class="result-label">{t(language, 'result.label')}</span>{/if}</div>
    <div aria-live="polite" class="result-body">
      {#if loading}
        <BrandLoading title={t(language, demoMode ? 'result.demoLoading' : 'result.loading')} detail={t(language, demoMode ? 'result.demoLoadingDetail' : 'result.loadingDetail')} />
      {:else if result}
        <div class="result-content">
          <div class="summary-label">{t(language, 'result.summary')}</div><p class="summary">{result.summary}</p>
          <div class="insight-grid">
            <div class="insight"><span class="field-label">{t(language, 'result.sentiment')}</span><span class="sentiment {result.sentiment}">{sentiments[result.sentiment].symbol} {sentimentName(result.sentiment, language)}</span></div>
            <div class="insight"><span class="field-label">{t(language, 'result.language')}</span><strong class="language">{displayLanguage(result.language, language)} <small>{result.language}</small></strong></div>
          </div>
          <div class="keyword-block"><span class="field-label">{t(language, 'result.keywords')}</span><div class="tags">{#each result.keywords as keyword}<span>{keyword}</span>{/each}</div></div>
          <div class="result-bottom"><div><span class="field-label">{t(language, 'result.category')}</span><span class="category {categoryClass(result.category)}">{categoryName(result.category, language)}</span></div><button class="text-button" onclick={copy}>{t(language, 'result.copy')} ↗</button></div>
          <p class="ai-note"><time datetime={result.analyzedAt}>{formatDate(result.analyzedAt, language)}</time> · {t(language, demoMode ? 'result.demoNote' : 'result.aiNote')}</p>
        </div>
      {:else if error}
        <div class="empty-state error-state"><div class="analysis-orbit">!</div><h3>{t(language, 'result.errorTitle')}</h3><p role="alert">{error}</p><span class="empty-caption">{t(language, 'result.errorCaption')}</span></div>
      {:else}
        <div class="empty-state"><div class="analysis-orbit"><span>✳</span></div><h3>{emptyTitle[0]}<br />{emptyTitle[1]}</h3><p>{t(language, demoMode ? 'result.demoEmptyText' : 'result.emptyText')}</p><div class="preview-tags"><span>{t(language, 'result.summary')}</span><span>{t(language, 'result.sentiment')}</span><span>{t(language, 'result.keywords')}</span></div><span class="empty-caption">{t(language, demoMode ? 'result.demoEmptyCaption' : 'result.emptyCaption')}</span></div>
      {/if}
    </div>
  </section>
</div>

<section class="feature-strip" aria-label={t(language, 'strip.aria')}><span class="strip-label">{t(language, 'strip.label')}<br /><strong>{t(language, 'strip.strong')}</strong></span>{#each sampleKinds as kind}<button class="sample-kind" disabled={loading} onclick={() => loadRandom(kind.id)} aria-label={t(language, 'strip.randomAria') + ': ' + t(language, `samples.${kind.id}`)}>↗ {t(language, `samples.${kind.id}`)}</button>{/each}</section>
<p class="sample-note">{t(language, 'samples.note')} · {t(language, demoMode ? 'samples.demoEnd' : 'samples.productionEnd')}</p>
