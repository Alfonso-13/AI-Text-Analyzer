import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { categoryName, DEFAULT_LANGUAGE, normalizeLanguage, sentimentName, translate } from '../src/lib/i18n.js';
import { shouldPlayIntro } from '../src/lib/intro.js';

test('English is the default interface language and Spanish remains available', () => {
  assert.equal(DEFAULT_LANGUAGE, 'en');
  assert.equal(normalizeLanguage(undefined), 'en');
  assert.equal(normalizeLanguage('invalid'), 'en');
  assert.equal(normalizeLanguage('es'), 'es');
  assert.equal(translate('en', 'nav.analyze'), 'Analyzer');
  assert.equal(translate('es', 'nav.analyze'), 'Analizador');
  assert.equal(categoryName('tecnología', 'en'), 'Technology');
  assert.equal(categoryName('tecnología', 'es'), 'Tecnología');
  assert.equal(sentimentName('positive', 'en'), 'Positive');
});

test('The entrance plays once per session, supports replay, and respects reduced motion', () => {
  assert.equal(shouldPlayIntro({ reducedMotion: false, alreadySeen: false, replayRequested: false }), true);
  assert.equal(shouldPlayIntro({ reducedMotion: false, alreadySeen: true, replayRequested: false }), false);
  assert.equal(shouldPlayIntro({ reducedMotion: false, alreadySeen: true, replayRequested: true }), true);
  assert.equal(shouldPlayIntro({ reducedMotion: true, alreadySeen: false, replayRequested: true }), false);
});

test('The initial document is English and includes the cinematic entrance before the app', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /id="site-intro"/);
  assert.ok(html.indexOf('id="site-intro"') < html.indexOf('id="app"'));
  assert.match(html, /<div id="app"><\/div>/);
  assert.doesNotMatch(html, /presentation-fallback/);
  assert.ok(html.indexOf('.site-intro {') < html.indexOf('<body>'));
  assert.match(html, /src="\/src\/intro\.js"/);
});
