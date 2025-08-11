const scrollDuration = 30000; // 30 seconds
let animationFrameId = null;
let direction = 1;
const consentKey = "onboardingAnimationConsent";

export function startScrollAnimation() {
  let startTimestamp = null;
  let startScroll = window.scrollY;
  let maxScroll = document.body.scrollHeight - window.innerHeight;

  function animateScroll(timestamp) {
    if (!startTimestamp) startTimestamp = timestamp;
    let elapsed = timestamp - startTimestamp;
    let progress = Math.min(elapsed / scrollDuration, 1);

    let targetScroll = direction === 1
      ? startScroll + (maxScroll - startScroll) * progress
      : startScroll - startScroll * progress;

    window.scrollTo(0, targetScroll);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animateScroll);
    } else {
      direction *= -1;
      startScroll = window.scrollY;
      startTimestamp = null;
      animationFrameId = requestAnimationFrame(animateScroll);
    }
  }

  animationFrameId = requestAnimationFrame(animateScroll);
}

export function stopScrollAnimation() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// --- Consent Functions ---
export function setAnimationConsent(granted) {
  if (granted) {
    localStorage.setItem(consentKey, 'true');
  } else {
    localStorage.removeItem(consentKey);
  }
}

export function hasAnimationConsent() {
  return localStorage.getItem(consentKey) === 'true';
}
