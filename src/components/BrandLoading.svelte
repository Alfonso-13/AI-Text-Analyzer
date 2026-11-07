<script>
  let { title = 'Connecting the ideas…', detail = 'This may take a few seconds.', compact = false } = $props();
</script>

<div class:compact class="brand-loading" role="status" aria-live="polite">
  <div class="brand-loader" aria-hidden="true"><span>✳</span><i></i><i></i><i></i></div>
  <h3>{title}</h3>
  <p>{detail}</p>
  <div class="brand-progress" aria-hidden="true"><span></span></div>
</div>
