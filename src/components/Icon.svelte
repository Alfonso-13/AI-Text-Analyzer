<script>
  let { name } = $props();
  const paths = {
    analyze: 'M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4M14 6l4 4M4 4h6M4 8h3',
    history: 'M3 11a9 9 0 1 1 2.4 7M3 4v7h7M12 7v5l3 2',
    summary: 'M4 20h16M6 16v-5M12 16V4M18 16V8',
    shuffle: 'M3 5h3l12 14h3M17 15l4 4-4 3M3 19h3l4-5M14 9l4-4h3M17 1l4 4-4 4',
  };
</script>
<svg width="21" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name] || paths.analyze} /></svg>
