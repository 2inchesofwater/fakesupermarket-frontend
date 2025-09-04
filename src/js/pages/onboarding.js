import { startScrollAnimation, stopScrollAnimation, setAnimationConsent, hasAnimationConsent } from '../pages/onboarding-animation.js';
const playBtn = document.getElementById("onboarding-animationControls-play");
const pauseBtn = document.getElementById("onboarding-animationControls-pause");

document.addEventListener('DOMContentLoaded', function() {
  const affirmBtn = document.getElementById('onboarding-action-affirm');
  // const modalBackdrop = document.getElementById('fs-modalBackdrop');
  const onboardingDialog = document.getElementById('fs-onboarding');
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // ms

  // Get timestamp from localStorage
  const affirmedRaw = localStorage.getItem('onboardingAffirmed');
  const affirmedAt = affirmedRaw ? parseInt(affirmedRaw, 10) : null;
  const onboardingExpired = !affirmedAt || (Date.now() - affirmedAt >= TWENTY_FOUR_HOURS);


  if (onboardingExpired) {
    // Show onboarding UI
    // modalBackdrop?.classList.remove('fs-pre_hidden');
    window.dispatchEvent(new Event('show-backdrop'));
    onboardingDialog?.classList.remove('fs-pre_hidden');
    localStorage.removeItem('onboardingAffirmed');

    // Onboarding can trigger animation if consent present
    if (hasAnimationConsent()) {
      updateButtonStates(true);
      startScrollAnimation();
    } else {
      updateButtonStates(false);
    }

    // Play & Pause event listeners (user can control animation during onboarding)
    playBtn?.addEventListener("click", function() {
      updateButtonStates(true);
      startScrollAnimation();
      setAnimationConsent(true);
    });

    pauseBtn?.addEventListener("click", function() {
      updateButtonStates(false);
      stopScrollAnimation();
      setAnimationConsent(false);
    });

    // Affirmation button stops animation and hides onboarding
    affirmBtn?.addEventListener('click', function() {
      stopScrollAnimation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      updateButtonStates(false);

      window.dispatchEvent(new Event('hide-backdrop'));
      onboardingDialog?.remove();
      localStorage.setItem('onboardingAffirmed', Date.now().toString());
      // DO NOT revoke animation consent!
    });

  } else {
    // Do NOT start animation!
    stopScrollAnimation();
    // DO NOT call setAnimationConsent(false) here!
    updateButtonStates(false);
  }
});


function updateButtonStates(isPlaying) {
  if (isPlaying) {
    playBtn?.setAttribute("hidden", true);
    pauseBtn?.removeAttribute("hidden");
  } else {
    playBtn?.removeAttribute("hidden");
    pauseBtn?.setAttribute("hidden", true);
  }
}