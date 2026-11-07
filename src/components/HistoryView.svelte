<script>
  import Icon from './Icon.svelte';
  import { analysisCount, categoryName, displayLanguage, formatDate, sentimentName, translate as t } from '../lib/i18n.js';

  let { items = [], demoMode = false, language = 'en' } = $props();
  let visibleCount = $state(10);
  const visibleItems = $derived(items.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < items.length);
  const sentiments = {
    positive: { symbol: '↗' },
    negative: { symbol: '↘' },
    neutral: { symbol: '→' },
  };
  const categoryClasses = {
    tecnología: 'technology', deportes: 'sports', política: 'politics',
    entretenimiento: 'entertainment', ciencia: 'science', negocios: 'business', otro: 'other',
  };

  function categoryClass(category) {
    return `category-${categoryClasses[category] || 'other'}`;
  }
</script>

<section class="data-view" aria-labelledby="history-title">
  <header class="view-header"><div><div class="eyebrow"><span></span> {t(language, 'history.eyebrow')}</div><h1 class="view-title" id="history-title">{t(language, 'history.title')}<span>↗</span></h1><p>{t(language, 'history.description')}</p></div></header>
  <p class="session-note">{t(language, demoMode ? 'history.demoSession' : 'history.session')}</p>
  {#if !items.length}
    <div class="data-empty"><Icon name="history" /><h2>{t(language, 'history.emptyTitle')}</h2><p>{t(language, 'history.emptyText')}</p><a class="primary-link" href="#analyze">{t(language, 'history.first')} ↗</a></div>
  {:else}
    <div class="history-list">
      {#each visibleItems as item, index}
        <article class="history-item">
          <div class="history-meta"><span class="history-number">{String(index + 1).padStart(2, '0')}</span><time datetime={item.analyzedAt}>{formatDate(item.analyzedAt, language)}</time><span class="sentiment {item.sentiment}">{sentiments[item.sentiment].symbol} {sentimentName(item.sentiment, language)}</span></div>
          <p class="history-summary">{item.summary}</p>
          <div class="history-tags"><span class="category {categoryClass(item.category)}">{categoryName(item.category, language)}</span><span class="language">{displayLanguage(item.language, language)}</span></div>
          <details><summary>{t(language, item.sourceText ? 'history.viewQuery' : 'history.viewKeywords')}</summary>{#if item.sourceText}<p class="saved-query">{item.sourceText}</p>{/if}<div class="tags">{#each item.keywords as keyword}<span>{keyword}</span>{/each}</div></details>
        </article>
      {/each}
    </div>
    {#if hasMore}<div class="load-more"><button class="analyze-button" onclick={() => visibleCount += 10}>{t(language, 'history.loadMore')} <span>↓</span></button><p>{visibleItems.length} / {analysisCount(language, items.length)}</p></div>{:else}<p class="list-end">{t(language, 'history.end')} · {items.length} {t(language, 'history.localRecords')}</p>{/if}
  {/if}
</section>
