function initLoosenCriteria() {
  const items = document.querySelectorAll('.fs-loosencriteria-item');

  items.forEach((item) => {
    const initialRemaining = item.querySelector('.fs-loosencriteria-item-remaining');
    const template = item.querySelector('#loosencriteria-row-template');
    const actionArea = item.querySelector('.fs-loosencriteria-item-action');
    const loosenButton = item.querySelector('.btn-secondary');
    const undoButton = item.querySelector('.btn-link');

    if (!initialRemaining || !template || !actionArea || !loosenButton || !undoButton) {
      return;
    }

    const initialPercentageElement = initialRemaining.querySelector('.percentage');
    const initialPeopleElement = initialRemaining.querySelector('.real');

    const initialPercentage = extractNumber(initialPercentageElement.textContent);
    const initialPeople = extractNumber(initialPeopleElement.textContent);

    const state = {
      history: []
    };

    function getCurrentQuota() {
      if (!state.history.length) {
        return {
          percentage: initialPercentage,
          people: initialPeople
        };
      }

      return state.history[state.history.length - 1];
    }

    function createNextQuota() {
      const currentQuota = getCurrentQuota();

      return {
        percentage: Math.round(currentQuota.percentage / 2),
        people: Math.round(currentQuota.people / 2)
      };
    }

    function getRenderedRows() {
      return item.querySelectorAll('.fs-loosencriteria-row');
    }

    function syncRowLabels() {
      const rows = getRenderedRows();

      rows.forEach((row, index) => {
        const label = row.querySelector('.label');
        const isLast = index === rows.length - 1;

        label.innerHTML = isLast ? 'New target' : '&nbsp;';
      });
    }

    function syncUndoButton() {
      const hasHistory = state.history.length > 0;
      undoButton.hidden = !hasHistory;
      undoButton.disabled = !hasHistory;
    }

    function renderNewRow(quota) {
      const fragment = template.content.cloneNode(true);
      const row = fragment.querySelector('.fs-loosencriteria-row');
      const label = fragment.querySelector('.label');
      const percentage = fragment.querySelector('.percentage');
      const real = fragment.querySelector('.real');

      label.textContent = 'New target';
      percentage.textContent = `${quota.percentage}%`;
      real.textContent = `(${quota.people} people)`;

      item.querySelector('.fs-loosencriteria-item-content').insertBefore(row, actionArea);

      syncRowLabels();
    }

    loosenButton.addEventListener('click', () => {
      const nextQuota = createNextQuota();

      state.history.push(nextQuota);
      renderNewRow(nextQuota);
      syncUndoButton();
    });

    undoButton.addEventListener('click', () => {
      if (!state.history.length) {
        return;
      }

      state.history.pop();

      const rows = getRenderedRows();
      const lastRow = rows[rows.length - 1];

      if (lastRow) {
        lastRow.remove();
      }

      syncRowLabels();
      syncUndoButton();
    });

    syncUndoButton();
  });
}

function extractNumber(value) {
  return Number(String(value).replace(/[^\d.-]/g, ''));
}

document.addEventListener('DOMContentLoaded', initLoosenCriteria);