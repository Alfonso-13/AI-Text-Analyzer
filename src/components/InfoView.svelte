<script>
  import { translate as t } from '../lib/i18n.js';

  let { demoMode = false, language = 'en' } = $props();
  const steps = $derived([
    {
      number: '01',
      icon: 'Aa',
      title: t(language, 'info.step1Title'),
      detail: t(language, 'info.step1Detail'),
      tag: t(language, 'info.step1Tag'),
    },
    {
      number: '02',
      icon: '{ }',
      title: t(language, 'info.step2Title'),
      detail: t(language, 'info.step2Detail'),
      tag: 'Node.js + Zod',
    },
    {
      number: '03',
      icon: '✦',
      title: 'Gemini',
      detail: t(language, 'info.step3Detail'),
      tag: t(language, 'info.step3Tag'),
    },
    {
      number: '04',
      icon: '✓',
      title: t(language, 'info.step4Title'),
      detail: t(language, 'info.step4Detail'),
      tag: 'localStorage',
    },
  ]);
</script>

<section class="info-view" aria-labelledby="info-title">
  <header class="info-hero">
    <div>
      <div class="eyebrow"><span></span> {t(language, 'info.eyebrow')}</div>
      <h1 class="info-title" id="info-title">{t(language, 'info.title1')}<br /><mark>{t(language, 'info.title2')}</mark></h1>
    </div>
    <p>{t(language, 'info.description')}</p>
  </header>

  <section class="flow-panel" aria-labelledby="flow-title">
    <div class="flow-heading">
      <div><span class="step">{t(language, 'info.flow')}</span><h2 id="flow-title">{t(language, 'info.flowTitle')}</h2></div>
      <span class="flow-status"><i></i> {t(language, 'info.flowStatus')}</span>
    </div>
    <div class="flow-diagram">
      {#each steps as step, index}
        <article class="flow-node">
          <div class="node-top"><span class="node-number">{step.number}</span><span class="node-icon">{step.icon}</span></div>
          <h3>{step.title}</h3>
          <p>{step.detail}</p>
          <span class="node-tag">{step.tag}</span>
        </article>
        {#if index < steps.length - 1}
          <div class="flow-connector" aria-hidden="true"><span></span></div>
        {/if}
      {/each}
      <div class="flow-return" aria-hidden="true"><span></span><em>{t(language, 'info.return')}</em></div>
    </div>
  </section>

  <div class="info-cards">
    <article><span>{t(language, 'info.capability')}</span><h2>{t(language, 'info.capabilityTitle')}</h2><p>{t(language, 'info.capabilityText')}</p></article>
    <article><span>{t(language, 'info.privacy')}</span><h2>{t(language, 'info.privacyTitle')}</h2><p>{t(language, 'info.privacyText')}</p></article>
    <article><span>{t(language, 'info.limits')}</span><h2>{t(language, 'info.limitsTitle')}</h2><p>{t(language, 'info.limitsText')}</p></article>
  </div>

  <aside class="info-callout">
    <div class="callout-symbol">◇</div>
    <div><strong>{t(language, demoMode ? 'info.calloutDemoTitle' : 'info.calloutProdTitle')}</strong><p>{t(language, demoMode ? 'info.calloutDemoText' : 'info.calloutProdText')}</p></div>
    <a href="#analyze">{t(language, demoMode ? 'info.tryExamples' : 'info.tryAnalyzer')} <span>↗</span></a>
  </aside>
</section>
