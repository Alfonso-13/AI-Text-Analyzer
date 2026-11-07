<script>
  import Swal from 'sweetalert2';
  import { onMount, tick } from 'svelte';
  import AnalyzerView from './components/AnalyzerView.svelte';
  import HistoryView from './components/HistoryView.svelte';
  import Icon from './components/Icon.svelte';
  import InfoView from './components/InfoView.svelte';
  import SummaryView from './components/SummaryView.svelte';
  import { addToHistory, readHistory } from './lib/history.js';
  import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, normalizeLanguage, translate as t } from './lib/i18n.js';

  const menu = [
    { id: 'analyze', labelKey: 'nav.analyze', icon: 'analyze' },
    { id: 'history', labelKey: 'nav.history', icon: 'history' },
    { id: 'summary', labelKey: 'nav.summary', icon: 'summary' },
    { id: 'info', labelKey: 'nav.info', icon: 'info' },
  ];
  const THEME_STORAGE_KEY = 'texta.theme';
  const demoMode = import.meta.env.VITE_APP_MODE === 'demo';
  let view = $state('analyze');
  let historyItems = $state([]);
  let loading = $state(false);
  let theme = $state('light');
  let language = $state(DEFAULT_LANGUAGE);
  const pageTitle = $derived(t(language, demoMode ? 'title.demo' : view === 'history' ? 'title.history' : view === 'summary' ? 'title.summary' : view === 'info' ? 'title.info' : 'title.analyze'));

  function applyTheme(nextTheme) {
    theme = nextTheme;
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  function applyLanguage(nextLanguage) {
    language = normalizeLanguage(nextLanguage);
    document.documentElement.lang = language;
  }

  function toggleLanguage() {
    const nextLanguage = language === 'en' ? 'es' : 'en';
    applyLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  function saveAnalysis(record) {
    try {
      // History is intentionally scoped to this browser; there is no shared server history.
      historyItems = addToHistory(localStorage, record);
    } catch {
      Swal.fire({
        icon: 'warning',
        title: t(language, 'history.warningTitle'),
        text: t(language, 'history.warningText'),
        confirmButtonText: t(language, 'modal.confirm'),
        confirmButtonColor: '#171918',
      });
    }
  }

  function info() {
    Swal.fire({
      title: t(language, 'modal.title'),
      text: t(language, demoMode ? 'modal.demo' : 'modal.production'),
      icon: 'info',
      confirmButtonText: t(language, 'modal.confirm'),
      confirmButtonColor: '#171918',
    });
  }

  onMount(() => {
    // Re-validate persisted results before exposing them to any view.
    historyItems = readHistory(localStorage);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const preferredTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme);
    applyLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));

    const syncRoute = () => {
      const route = location.hash.slice(1);
      view = menu.some(item => item.id === route) ? route : 'analyze';
      tick().then(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    };
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  });
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<div class="app-shell">
  <aside class="rail" aria-label={t(language, 'aria.identity')}>
    <a href="#analyze" class="logo-symbol" aria-label={t(language, 'aria.home')}>t<span>✳</span></a>
    <div class="rail-line"></div>
    <nav class="main-nav" aria-label={t(language, 'aria.menu')}>
      {#each menu as item}
        <a href={'#' + item.id} class:active={view === item.id} aria-current={view === item.id ? 'page' : undefined}><Icon name={item.icon} /><span>{t(language, item.labelKey)}</span></a>
      {/each}
    </nav>
  </aside>
  <div class="page">
    <header class="topbar">
      <a class="wordmark" href="#analyze">texta<span class="wordmark-star" aria-hidden="true">✳</span></a>
      <div class="topbar-right">
        {#if loading}<span class="global-loading" role="status"><span class="spinner"></span> {t(language, demoMode ? 'loading.demo' : 'loading.analysis')}</span>{:else if demoMode}<span class="demo-mode-label"><span>◇</span> {t(language, 'demo.label')}</span>{:else}<span class="powered"><span class="gemini-star">✦</span> Powered by Gemini</span>{/if}
        <button class="language-toggle" onclick={toggleLanguage} aria-label={language === 'en' ? 'Switch language to Spanish' : 'Cambiar idioma a inglés'} title={language === 'en' ? 'Español' : 'English'}><span class:active={language === 'en'}>EN</span><i>/</i><span class:active={language === 'es'}>ES</span></button>
        <button class="theme-button" onclick={toggleTheme} aria-label={t(language, theme === 'dark' ? 'theme.light' : 'theme.dark')} title={t(language, theme === 'dark' ? 'theme.light' : 'theme.dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
        <button class="help-button" onclick={info}>{t(language, 'help')} <span>↗</span></button>
      </div>
    </header>
    <main id="main">
      {#if view === 'analyze'}
        <AnalyzerView {demoMode} {language} onSaved={saveAnalysis} onLoadingChange={value => loading = value} />
      {:else if view === 'history'}
        <HistoryView items={historyItems} {demoMode} {language} />
      {:else if view === 'summary'}
        <SummaryView items={historyItems} {language} />
      {:else}
        <InfoView {demoMode} {language} />
      {/if}
    </main>
    <footer class="site-footer"><span>texta<span class="footer-star">✳</span> <span class="footer-divider">/</span> {language === 'en' ? 'Made to understand.' : 'Hecho para entender.'}</span><span>{t(language, demoMode ? 'footer.demo' : 'footer.tagline')}</span></footer>
  </div>
</div>
