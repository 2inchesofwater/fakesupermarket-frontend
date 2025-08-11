
import {
  startScrollAnimation,
  stopScrollAnimation,
  setAnimationConsent,
  hasAnimationConsent
} from '../pages/onboarding-animation.js';


document.addEventListener('DOMContentLoaded', function() {
  // Affirm whether the user has already been through the current research task onboarding
  const modalBackdrop = document.getElementById('fs-modalBackdrop');
  const onboardingDialog = document.getElementById('fs-onboarding');
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // ms

  const affirmedRaw = localStorage.getItem('onboardingAffirmed');
  const affirmedAt = affirmedRaw ? parseInt(affirmedRaw, 10) : null;

  if (!affirmedAt || (Date.now() - affirmedAt >= TWENTY_FOUR_HOURS)) {
    // User has NOT affirmed, or the affirmation expired; show onboarding
    modalBackdrop?.classList.remove('fs-pre_hidden');
    onboardingDialog?.classList.remove('fs-pre_hidden');
    localStorage.removeItem('onboardingAffirmed'); // clean up if expired
  } else {
    // User has affirmed; No action needed, elements stay hidden
  }
});
