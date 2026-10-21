import samples from '../data/sample-texts.json' with { type: 'json' };

export const sampleKinds = [
  { id: 'articles', label: 'Artículos y noticias' },
  { id: 'posts', label: 'Posts y tweets' },
  { id: 'ideas', label: 'Ideas y párrafos' },
  { id: 'places', label: 'Lugares' },
];

export function pickSample(kind = 'all', currentText = '', random = Math.random) {
  const pool = samples.filter(item => (kind === 'all' || item.kind === kind) && item.text !== currentText);
  if (!pool.length) return null;
  return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))].text;
}
