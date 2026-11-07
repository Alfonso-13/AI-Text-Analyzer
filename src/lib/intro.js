export function shouldPlayIntro({ reducedMotion, alreadySeen, replayRequested }) {
  return !reducedMotion && (!alreadySeen || replayRequested);
}
