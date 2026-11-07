<script>
  import Icon from './Icon.svelte';
  import { summarizeHistory } from '../lib/history.js';
  import { analysisCount, categoryName, translate as t } from '../lib/i18n.js';

  let { items = [], language = 'en' } = $props();
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
  <header class="view-header"><div><div class="eyebrow"><span></span> {t(language, 'summary.eyebrow')}</div><h1 class="view-title" id="summary-title">{t(language, 'summary.title')}<span class="summary-symbol">∑</span></h1><p>{t(language, 'summary.description')}</p></div></header>
  <p class="session-note">{t(language, 'summary.session')}</p>
  {#if totalAnalyses === 0}
    <div class="data-empty"><Icon name="summary" /><h2>{t(language, 'summary.emptyTitle')}</h2><p>{t(language, 'summary.emptyText')}</p><a class="primary-link" href="#analyze">{t(language, 'summary.goAnalyzer')} ↗</a></div>
  {:else}
    <div class="stats-grid">
      <article class="stat-card accent-stat"><span>{t(language, 'summary.saved')}</span><strong>{totalAnalyses}</strong><small>{t(language, 'summary.inBrowser')}</small></article>
      <article class="stat-card"><span>{t(language, 'summary.detected')}</span><strong>{categoryCounts.length}<small> / 7</small></strong><small>{t(language, 'summary.perspectives')}</small></article>
      <article class="stat-card"><span>{t(language, 'summary.frequent')}</span><strong class="top-category">{categoryName(categoryCounts[0][0], language)}</strong><small>{categoryCounts[0][1]} {t(language, 'summary.inCategory')}</small></article>
    </div>
    <section class="category-chart" aria-labelledby="categories-title">
      <div class="chart-heading"><h2 id="categories-title">{t(language, 'summary.chartTitle')}</h2><span>{analysisCount(language, totalAnalyses)}</span></div>
      {#each categoryCounts as [category, count]}
        <div class="category-row"><div><span>{categoryName(category, language)}</span><strong>{count} <small>· {Math.round(count / totalAnalyses * 100)}%</small></strong></div><div class="category-track" role="meter" aria-label={categoryName(category, language)} aria-valuenow={count} aria-valuemin="0" aria-valuemax={totalAnalyses}><span class={categoryClass(category)} style:width={count / totalAnalyses * 100 + '%'}></span></div></div>
      {/each}
      <a class="text-button chart-link" href="#history">{t(language, 'summary.explore')} ↗</a>
    </section>
  {/if}
</section>
