import { shouldPlayIntro } from './lib/intro.js';

const intro = document.getElementById('site-intro');

if (intro) {
  const storageKey = 'texta.intro-seen.v1';
  const replayRequested = new URLSearchParams(window.location.search).has('intro');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let alreadySeen = false;

  try {
    alreadySeen = sessionStorage.getItem(storageKey) === 'true';
  } catch {
    // The entrance can still play when session storage is unavailable.
  }

  if (!shouldPlayIntro({ reducedMotion, alreadySeen, replayRequested })) {
    intro.remove();
  } else {
    document.documentElement.classList.add('intro-playing');

    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // The entrance remains functional without persistence.
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      document.documentElement.classList.remove('intro-playing');
      intro.remove();
    };

    intro.addEventListener('animationend', event => {
      if (event.target === intro && event.animationName === 'texta-intro-exit') finish();
    }, { once: true });

    window.setTimeout(finish, 2400);
  }
}
