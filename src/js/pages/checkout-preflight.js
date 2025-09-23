
const orderSummaryEl = document.getElementById('orderSummary');
const errorSummaryEl = document.getElementById('paymentFlow-error-summary');
const placeOrderBtn = document.getElementById('paymentFlow-CTA-placeOrder');

const stepIds = [
  'paymentFlow-review',
  'paymentFlow-delivery',
  'paymentFlow-payment'
];
// Map: step ID → display name (for error messages)
const stepDisplayNames = {
  'paymentFlow-review': 'Is your Cart correct?',
  'paymentFlow-delivery': 'Confirm the (fake) Where and when options',
  'paymentFlow-payment': 'Confirm the (fake) Payment options'
};
  // Mental note: There is duplication within stepIds and stepCompletion; merging them could introduce complexity for localisation down the track. 

const stepCompletion = Object.fromEntries(stepIds.map(id => [id, false]));

export function checkoutPreflight() {
  stepIds.forEach(stepId => {
    const detailsEl = document.getElementById(stepId);
    if (!detailsEl) return;

    const confirmBtn = detailsEl.querySelector('.btn-primary.btn-icon');
    const summary = detailsEl.querySelector('summary');
    const badge = summary.querySelector('.step-review-status');
    if (!confirmBtn || !badge) return;

    confirmBtn.addEventListener('click', () => {
      confirmBtn.setAttribute('aria-pressed', 'true');
      badge.removeAttribute('hidden');
      setTimeout(() => { detailsEl.open = false; }, 200);

      stepCompletion[stepId] = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      checkIfAllStepsComplete();
      // hideErrorSummary();
    });
  });
}

if (placeOrderBtn) {
  placeOrderBtn.addEventListener('click', (e) => {
    if (!allStepsComplete()) {
      e.preventDefault();
      showErrorSummary();
      // Optionally, scroll error summary into view:
      errorSummaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      errorSummaryEl.focus();
    }
  });
}

function allStepsComplete() {
  return Object.values(stepCompletion).every(Boolean);
}

function checkIfAllStepsComplete() {
  if (allStepsComplete() && orderSummaryEl) {
    orderSummaryEl.classList.remove('incomplete');
    hideErrorSummary();
  }
}

function showErrorSummary() {
  const list = errorSummaryEl.querySelector('.error-summary__list');
  list.innerHTML = '';
  stepIds.forEach(stepId => {
    if (!stepCompletion[stepId]) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${stepId}`;
      a.dataset.step = stepId;
      a.textContent = stepDisplayNames[stepId];
      a.addEventListener('click', function(ev) {
        ev.preventDefault();
        const targetDetails = document.getElementById(stepId);
        if (targetDetails) {
          targetDetails.open = true;
          // Focus the Confirm button
          const btn = targetDetails.querySelector('.btn-primary.btn-icon');
          if (btn) btn.focus();
        }
      });
      li.appendChild(a);
      list.appendChild(li);
    }
  });
  errorSummaryEl.hidden = false;
  errorSummaryEl.setAttribute('tabindex', '-1');
  errorSummaryEl.focus();
}

function hideErrorSummary() {
  errorSummaryEl.hidden = true;
}

const closeLink = errorSummaryEl.querySelector('.error-close');
if (closeLink) {
  closeLink.addEventListener('click', function(event) {
    event.preventDefault();         // Prevent the default anchor behavior
    hideErrorSummary();             // Hide the error summary block
  });
}