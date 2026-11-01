<script>
  import Icon from './Icon.svelte';
  import { summarizeHistory } from '../lib/history.js';

  let { items = [] } = $props();
  const summary = $derived(summarizeHistory(items));
  const categoryCounts = $derived(Object.entries(summary).sort((a, b) => b[1] - a[1]));
  const totalAnalyses = $derived(items.length);
  const categoryClasses = {
    tecnología: 'technology', deportes: 'sports', política: 'politics',
    entretenimiento: 'entertainment', ciencia: 'science', negocios: 'business', otro: 'other',
  };

  function categoryClass(category) {
    return `category-${categoryClasses[category] || 'other'}`;
  }
</script>

<section class="data-view" aria-labelledby="summary-title">
  <header class="view-header"><div><div class="eyebrow"><span></span> UNA MIRADA AL CONJUNTO</div><h1 class="view-title" id="summary-title">Tu resumen<span class="summary-symbol">∑</span></h1><p>Descubre qué temas aparecen en tus análisis.</p></div></header>
  <p class="session-note">Métricas calculadas en este navegador a partir de hasta 500 resultados locales.</p>
  {#if totalAnalyses === 0}
    <div class="data-empty"><Icon name="summary" /><h2>Todavía no hay temas por descubrir</h2><p>Analiza tu primer texto para ver el resumen de categorías.</p><a class="primary-link" href="#analyze">Ir al analizador ↗</a></div>
  {:else}
    <div class="stats-grid">
      <article class="stat-card accent-stat"><span>Análisis guardados</span><strong>{totalAnalyses}</strong><small>En este navegador</small></article>
      <article class="stat-card"><span>Categorías detectadas</span><strong>{categoryCounts.length}<small> / 7</small></strong><small>Perspectivas diferentes</small></article>
      <article class="stat-card"><span>Tema más frecuente</span><strong class="top-category">{categoryCounts[0][0]}</strong><small>{categoryCounts[0][1]} análisis en esta categoría</small></article>
    </div>
    <section class="category-chart" aria-labelledby="categories-title">
      <div class="chart-heading"><h2 id="categories-title">Tu contenido, por categoría</h2><span>{totalAnalyses} análisis</span></div>
      {#each categoryCounts as [category, count]}
        <div class="category-row"><div><span>{category}</span><strong>{count} <small>· {Math.round(count / totalAnalyses * 100)}%</small></strong></div><div class="category-track" role="meter" aria-label={category} aria-valuenow={count} aria-valuemin="0" aria-valuemax={totalAnalyses}><span class={categoryClass(category)} style:width={count / totalAnalyses * 100 + '%'}></span></div></div>
      {/each}
      <a class="text-button chart-link" href="#history">Explorar el historial ↗</a>
    </section>
  {/if}
</section>
