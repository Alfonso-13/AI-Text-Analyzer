<script>
  import Swal from 'sweetalert2';
  import { onMount, tick } from 'svelte';
  import AnalyzerView from './components/AnalyzerView.svelte';
  import HistoryView from './components/HistoryView.svelte';
  import Icon from './components/Icon.svelte';
  import InfoView from './components/InfoView.svelte';
  import SummaryView from './components/SummaryView.svelte';
  import { addToHistory, readHistory } from './lib/history.js';

  const menu = [
    { id: 'analyze', label: 'Analizador', icon: 'analyze' },
    { id: 'history', label: 'Historial', icon: 'history' },
    { id: 'summary', label: 'Resumen', icon: 'summary' },
    { id: 'info', label: 'Información', icon: 'info' },
  ];
  const THEME_STORAGE_KEY = 'texta.theme';
  const demoMode = import.meta.env.VITE_APP_MODE === 'demo';
  let view = $state('analyze');
  let historyItems = $state([]);
  let loading = $state(false);
  let theme = $state('light');

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

  function saveAnalysis(record) {
    try {
      // History is intentionally scoped to this browser; there is no shared server history.
      historyItems = addToHistory(localStorage, record);
    } catch {
      Swal.fire({
        icon: 'warning',
        title: 'Análisis listo, historial no guardado',
        text: 'El navegador no permitió guardar este resultado localmente.',
        confirmButtonColor: '#171918',
      });
    }
  }

  function info() {
    Swal.fire({
      title: 'Del texto a lo esencial',
      text: demoMode
        ? 'Esta publicación conserva la interfaz de Texta, pero solo permite seleccionar ejemplos precargados. Cada ejemplo devuelve una respuesta mock relacionada después de simular la consulta; no usa Gemini ni envía datos fuera del navegador.'
        : 'Gemini resume y clasifica tu texto; puede equivocarse y no verifica hechos. El texto se envía a Google. Solo el resultado se conserva en el almacenamiento local de este navegador, hasta 500 análisis. No se comparte con otros visitantes ni se guarda en el servidor.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#171918',
    });
  }

  onMount(() => {
    // Re-validate persisted results before exposing them to any view.
    historyItems = readHistory(localStorage);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const preferredTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme);

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

<svelte:head><title>{demoMode ? 'Texta | Demo interactiva sin IA' : view === 'history' ? 'Historial de análisis | Texta' : view === 'summary' ? 'Resumen por categoría | Texta' : view === 'info' ? 'Cómo funciona | Texta' : 'Texta | Analizador de texto con IA: resumen y sentimiento'}</title></svelte:head>

<div class="app-shell">
  <aside class="rail" aria-label="Identidad de la aplicación">
    <a href="#analyze" class="logo-symbol" aria-label="Texta, ir al analizador">t<span>✳</span></a>
    <div class="rail-line"></div>
    <nav class="main-nav" aria-label="Menú principal">
      {#each menu as item}
        <a href={'#' + item.id} class:active={view === item.id} aria-current={view === item.id ? 'page' : undefined}><Icon name={item.icon} /><span>{item.label}</span></a>
      {/each}
    </nav>
  </aside>
  <div class="page">
    <header class="topbar">
      <a class="wordmark" href="#analyze">texta<span class="wordmark-star" aria-hidden="true">✳</span></a>
      <div class="topbar-right">
        {#if loading}<span class="global-loading" role="status"><span class="spinner"></span> {demoMode ? 'Simulación de consulta…' : 'Analizando texto…'}</span>{:else if demoMode}<span class="demo-mode-label"><span>◇</span> Demo con mocks</span>{:else}<span class="powered"><span class="gemini-star">✦</span> Powered by Gemini</span>{/if}
        <button class="theme-button" onclick={toggleTheme} aria-label={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'} title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
        <button class="help-button" onclick={info}>Cómo funciona <span>↗</span></button>
      </div>
    </header>
    <main id="main">
      {#if view === 'analyze'}
        <AnalyzerView {demoMode} onSaved={saveAnalysis} onLoadingChange={value => loading = value} />
      {:else if view === 'history'}
        <HistoryView items={historyItems} {demoMode} />
      {:else if view === 'summary'}
        <SummaryView items={historyItems} />
      {:else}
        <InfoView {demoMode} />
      {/if}
    </main>
    <footer class="site-footer"><span>texta<span class="footer-star">✳</span> <span class="footer-divider">/</span> Hecho para entender.</span><span>{demoMode ? 'Demo con datos de prueba · Sin datos enviados.' : 'Inteligencia artificial, claridad humana.'}</span></footer>
  </div>
</div>
