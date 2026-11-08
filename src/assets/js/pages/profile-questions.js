// Profile-specific adaptation of utils/stepper.js. Answers stay in this form;
// required answers are checked separately from custom rules and account saving.
const form = document.getElementById('profile-questions');

if (form) {
  const rail = form.querySelector('.fs-stepper-rail');
  const panes = Array.from(form.querySelectorAll('.fs-stepper-pane'));
  const questions = panes.filter(pane => pane.hasAttribute('data-profile-question'));
  const next = form.querySelector('#fs-stepper-next');
  const previous = form.querySelector('#fs-stepper-previous');
  const confirm = form.querySelector('#fs-stepper-submit');
  const progress = form.querySelector('.fs-stepper-progressBar');
  let current = panes[0];
  let available = [];

  function answerFor(pane) {
    const selected = pane.querySelector('input[type="radio"]:checked');
    if (selected) {
      const label = selected.closest('.fs-input-radio').querySelector('.fs-input-radio-modern-label');
      return Array.from(label.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent).join('').trim();
    }
    const dateParts = Array.from(pane.querySelectorAll('[data-date-part]'));
    if (dateParts.length) {
      return dateParts.some(input => input.value.trim())
        ? dateParts.map(input => input.value.trim() || '—').join(' / ')
        : '';
    }
    return pane.querySelector('input[type="text"]')?.value.trim() || '';
  }

  function refresh(focus = false) {
    available = panes.filter(pane => {
      const dependency = pane.dataset.dependsOn;
      const eligible = !dependency || form.elements.namedItem(dependency)?.value === pane.dataset.dependsValue;
      pane.hidden = !eligible;
      pane.querySelectorAll('input').forEach(input => { input.disabled = !eligible; });
      return eligible;
    });
    if (!available.includes(current)) current = available[0];
    const index = available.indexOf(current);

    panes.forEach(pane => {
      const active = pane === current;
      pane.toggleAttribute('inert', !active);
      pane.setAttribute('aria-hidden', String(!active));
    });
    rail.style.transform = `translateX(-${index * 100}%)`;
    previous.disabled = index === 0;
    next.hidden = index === available.length - 1;
    confirm.hidden = !next.hidden;
    if (progress) {
      progress.max = available.length;
      progress.value = index + 1;
    }
    questions.forEach(pane => {
      const row = Array.from(form.querySelectorAll('[data-profile-review]'))
        .find(item => item.dataset.profileReview === pane.dataset.profileQuestion);
      if (row) {
        row.hidden = pane.hidden;
        row.querySelector('dd').textContent = answerFor(pane) || 'Not answered';
      }
    });
    if (focus) {
      const field = current.querySelector('input:not(:disabled)');
      (field || current).focus({ preventScroll: true });

      const heading = current.querySelector('.fs-input-pane-title') || current;
      const headingTop = heading.getBoundingClientRect().top;
      const headerBottom = document.getElementById('header-positioning')?.getBoundingClientRect().bottom ?? 0;
      if (headingTop < headerBottom || headingTop >= window.innerHeight ||
          (field && field.getBoundingClientRect().bottom > window.innerHeight)) {
        rail.parentElement.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }
  }

  function missingRequiredInputs(pane) {
    if (pane.hidden) return [];
    return Array.from(pane.querySelectorAll('input, select, textarea'))
      .filter(field => field.willValidate && field.validity.valueMissing);
  }

  function requireAnswer(pane) {
    const field = missingRequiredInputs(pane)[0];
    return !field || field.reportValidity();
  }

  function move(offset) {
    if (offset > 0 && !requireAnswer(current)) return;
    const target = available[available.indexOf(current) + offset];
    if (!target) return;
    current = target;
    refresh(true);
  }

  function confirmProfile() {
    refresh();
    const incomplete = available.find(pane => missingRequiredInputs(pane).length);
    if (incomplete) {
      current = incomplete;
      refresh(true);
      requireAnswer(current);
      return;
    }
    // A cancelable event lets the eventual account integration take over saving.
    const event = new CustomEvent('profile:confirm', {
      bubbles: true,
      cancelable: true,
      detail: new FormData(form)
    });
    if (form.dispatchEvent(event)) {
      window.location.assign(form.dataset.profileConfirmUrl);
    }
  }

  previous.addEventListener('click', () => move(-1));
  form.addEventListener('input', () => refresh());
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (current === available[available.length - 1]) confirmProfile();
    else move(1);
  });
  refresh();
}
