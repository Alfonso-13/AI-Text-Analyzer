<script>
  let { demoMode = false } = $props();
  const steps = [
    {
      number: '01',
      icon: 'Aa',
      title: 'Tu navegador',
      detail: 'Escribes o cargas un texto. La API key nunca llega al frontend.',
      tag: 'Entrada privada',
    },
    {
      number: '02',
      icon: '{ }',
      title: 'API de Texta',
      detail: 'Express valida el tamaño, limita solicitudes y prepara una instrucción segura.',
      tag: 'Node.js + Zod',
    },
    {
      number: '03',
      icon: '✦',
      title: 'Gemini',
      detail: 'La IA devuelve resumen, sentimiento, idioma, palabras clave y categoría.',
      tag: 'JSON estructurado',
    },
    {
      number: '04',
      icon: '✓',
      title: 'Resultado local',
      detail: 'Texta valida la respuesta y guarda solo el resultado en tu navegador.',
      tag: 'localStorage',
    },
  ];
</script>

<section class="info-view" aria-labelledby="info-title">
  {#if demoMode}<aside class="demo-info-note"><strong>Estás recorriendo una simulación local.</strong><span>El diagrama explica la arquitectura de la versión completa; esta publicación sustituye API y Gemini por reglas ejecutadas en tu navegador.</span></aside>{/if}
  <header class="info-hero">
    <div>
      <div class="eyebrow"><span></span> DEL TEXTO A LO ESENCIAL</div>
      <h1 class="info-title" id="info-title">Una idea entra.<br /><mark>La claridad sale.</mark></h1>
    </div>
    <p>Texta combina una interfaz Svelte, una API Node.js y Gemini para transformar contenido libre en datos claros, sin convertir el historial en información compartida.</p>
  </header>

  <section class="flow-panel" aria-labelledby="flow-title">
    <div class="flow-heading">
      <div><span class="step">FLUJO</span><h2 id="flow-title">Cómo viaja un análisis</h2></div>
      <span class="flow-status"><i></i> Flujo protegido de extremo a extremo</span>
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
      <div class="flow-return" aria-hidden="true"><span></span><em>RETORNO · RESULTADO VALIDADO</em></div>
    </div>
  </section>

  <div class="info-cards">
    <article><span>01 / CAPACIDAD</span><h2>Qué entrega</h2><p>Un resumen breve en español, sentimiento, idioma original, hasta diez palabras clave y una categoría temática.</p></article>
    <article><span>02 / PRIVACIDAD</span><h2>Qué conserva</h2><p>Hasta 500 resultados en este navegador. No guarda el texto original, no crea cuentas y no comparte el historial con otras personas.</p></article>
    <article><span>03 / LÍMITES</span><h2>Qué debes saber</h2><p>La IA puede equivocarse y no verifica hechos. Cada instalación necesita su propia API key y cuota disponible de Gemini.</p></article>
  </div>

  <aside class="info-callout">
    <div class="callout-symbol">◇</div>
    <div><strong>La key se queda en el servidor.</strong><p>El navegador habla con Texta; Texta habla con Gemini. El resultado regresa validado antes de mostrarse.</p></div>
    <a href="#analyze">Probar el analizador <span>↗</span></a>
  </aside>
</section>
