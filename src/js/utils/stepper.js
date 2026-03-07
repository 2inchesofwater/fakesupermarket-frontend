document.addEventListener('DOMContentLoaded', () => {
  const stepper = document.querySelector('.fs-stepper');
  if (!stepper) return;

  const rail = stepper.querySelector('.fs-stepper-rail');
  const panes = Array.from(stepper.querySelectorAll('.fs-stepper-pane'));
  const nextBtn = stepper.querySelector('#fs-stepper-next');
  const previousBtn = stepper.querySelector('#fs-stepper-previous');
  const submitBtn = stepper.querySelector('#fs-stepper-submit');
  const progressBar = stepper.querySelector('.fs-stepper-progressBar');

  if (!rail || panes.length === 0) return;

  let currentIndex = 0;

  init();

  function init() {
    setupProgressBar();
    showPane(currentIndex);
    bindEvents();
  }

  function bindEvents() {
    nextBtn?.addEventListener('click', handleNext);
    previousBtn?.addEventListener('click', handlePrevious);
    submitBtn?.addEventListener('click', handleSubmit);
  }

  function handleNext() {
    const currentPane = panes[currentIndex];

    // Validation stub only.
    // This is where pane-level validation would be called.
    //
    // Example:
    // const isValid = validatePane(currentPane);
    // if (!isValid) {
    //   showPaneError(currentPane);
    //   return;
    // }

    clearPaneError(currentPane);

    if (currentIndex < panes.length - 1) {
      currentIndex += 1;
      showPane(currentIndex);
    }
  }

  function handlePrevious() {
    if (currentIndex === 0) return;

    clearPaneError(panes[currentIndex]);

    currentIndex -= 1;
    showPane(currentIndex);
  }

  function handleSubmit() {
    const currentPane = panes[currentIndex];

    // Validation stub only.
    // This is where final-step validation / submission gating would be called.
    //
    // Example:
    // const isValid = validatePane(currentPane);
    // if (!isValid) {
    //   showPaneError(currentPane);
    //   return;
    // }

    clearPaneError(currentPane);

    // Submission stub only.
    console.log('Stepper form is ready to submit');
  }

  function showPane(indexToShow) {
    panes.forEach((pane, index) => {
      const isActive = index === indexToShow;

      if (isActive) {
        pane.removeAttribute('inert');
        pane.setAttribute('aria-hidden', 'false');
      } else {
        pane.setAttribute('inert', '');
        pane.setAttribute('aria-hidden', 'true');
      }
    });

    updateRailPosition();
    updateControls();
    updateProgressBar();
    focusFirstField(panes[indexToShow]);
  }

  function updateRailPosition() {
    rail.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function updateControls() {
    const isFirstPane = currentIndex === 0;
    const isLastPane = currentIndex === panes.length - 1;

    if (previousBtn) {
      previousBtn.disabled = isFirstPane;
    }

    if (nextBtn) {
      nextBtn.hidden = isLastPane;
    }

    if (submitBtn) {
      submitBtn.hidden = !isLastPane;
    }
  }

  function setupProgressBar() {
    if (!progressBar) return;

    progressBar.max = panes.length;
    progressBar.value = currentIndex + 1;
    progressBar.setAttribute('aria-valuemax', String(panes.length));
    progressBar.setAttribute('aria-valuenow', String(currentIndex + 1));
  }

  function updateProgressBar() {
    if (!progressBar) return;

    const currentStep = currentIndex + 1;
    progressBar.value = currentStep;
    progressBar.setAttribute('aria-valuenow', String(currentStep));
  }

  function showPaneError(pane) {
    const errorEl = pane.querySelector('.fs-error-message');
    if (!errorEl) return;

    errorEl.hidden = false;
  }

  function clearPaneError(pane) {
    const errorEl = pane.querySelector('.fs-error-message');
    if (!errorEl) return;

    errorEl.hidden = true;
  }

  function focusFirstField(pane) {
    if (!pane) return;

    const firstField = pane.querySelector('input, select, textarea');
    if (firstField) {
      firstField.focus({ preventScroll: true });
    }
  }
});