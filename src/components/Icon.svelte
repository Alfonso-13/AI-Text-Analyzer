<script>
  let { name } = $props();
  const paths = {
    analyze: 'M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4M14 6l4 4M4 4h6M4 8h3',
    history: 'M3 11a9 9 0 1 1 2.4 7M3 4v7h7M12 7v5l3 2',
    summary: 'M4 20h16M6 16v-5M12 16V4M18 16V8',
    shuffle: 'M3 5h3l12 14h3M17 15l4 4-4 3M3 19h3l4-5M14 9l4-4h3M17 1l4 4-4 4',
    sun: 'M12 3V1M12 23v-2M4.2 4.2 2.8 2.8M21.2 21.2l-1.4-1.4M3 12H1M23 12h-2M4.2 19.8l-1.4 1.4M21.2 2.8l-1.4 1.4M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
    moon: 'M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2',
    info: 'M12 11v6M12 7h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  };
</script>
<svg width="21" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name] || paths.analyze} /></svg>
