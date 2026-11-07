<script>
  import Icon from './Icon.svelte';

  let { items = [], demoMode = false } = $props();
  let visibleCount = $state(10);
  const visibleItems = $derived(items.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < items.length);
  const sentiments = {
    positive: { label: 'Positivo', symbol: '↗' },
    negative: { label: 'Negativo', symbol: '↘' },
    neutral: { label: 'Neutral', symbol: '→' },
  };
  const categoryClasses = {
    tecnología: 'technology', deportes: 'sports', política: 'politics',
    entretenimiento: 'entertainment', ciencia: 'science', negocios: 'business', otro: 'other',
  };

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
</script>

<section class="data-view" aria-labelledby="history-title">
  <header class="view-header"><div><div class="eyebrow"><span></span> TUS IDEAS, CON CONTEXTO</div><h1 class="view-title" id="history-title">Historial<span>↗</span></h1><p>Vuelve a lo esencial de tus últimos análisis.</p></div></header>
  <p class="session-note">{demoMode ? 'La consulta de ejemplo y su respuesta mock se guardan solo en este navegador.' : 'Hasta 500 resultados guardados solo en este navegador. El texto original no se conserva.'}</p>
  {#if !items.length}
    <div class="data-empty"><Icon name="history" /><h2>Todo empieza con un texto</h2><p>Los análisis completados aparecerán aquí, del más reciente al más antiguo.</p><a class="primary-link" href="#analyze">Analizar mi primer texto ↗</a></div>
  {:else}
    <div class="history-list">
      {#each visibleItems as item, index}
        <article class="history-item">
          <div class="history-meta"><span class="history-number">{String(index + 1).padStart(2, '0')}</span><time datetime={item.analyzedAt}>{formatDate(item.analyzedAt)}</time><span class="sentiment {item.sentiment}">{sentiments[item.sentiment].symbol} {sentiments[item.sentiment].label}</span></div>
          <p class="history-summary">{item.summary}</p>
          <div class="history-tags"><span class="category {categoryClass(item.category)}">{item.category}</span><span class="language">{languageName(item.language)}</span></div>
          <details><summary>{item.sourceText ? 'Ver consulta y palabras clave' : 'Ver palabras clave'}</summary>{#if item.sourceText}<p class="saved-query">{item.sourceText}</p>{/if}<div class="tags">{#each item.keywords as keyword}<span>{keyword}</span>{/each}</div></details>
        </article>
      {/each}
    </div>
    {#if hasMore}<div class="load-more"><button class="analyze-button" onclick={() => visibleCount += 10}>Cargar más <span>↓</span></button><p>{visibleItems.length} de {items.length} análisis</p></div>{:else}<p class="list-end">Ya viste todos tus análisis · {items.length} registros locales</p>{/if}
  {/if}
</section>
