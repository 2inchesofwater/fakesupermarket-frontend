/* demo-recruitmentCriteria-charts.js
   Keeps .fs-recruitGroup-chart swatches in sync with the current input percentages.

   Listens for:
   - initial DOMContentLoaded (render all)
   - custom event: "quota:group-updated" (Option A)
   - focusout on percentage inputs (fallback safety net)
*/
(function () {
  // =========================
  // Constants / selectors
  // =========================
  const GROUP_SEL = '.fs-recruitGroup';
  const GROUP_ITEMS_SEL = '.fs-recruitGroup-items';
  const GROUP_CHART_SEL = '.fs-recruitGroup-chart';

  const ITEM_SEL = '.fs-recruitGroup-item';
  const INPUT_PERCENT_SEL = 'input.fs-recruitSegment-percentage';

  const CHART_SWATCH_SEL = '.fs-recruitGroup-chart-item';

  // Custom event name (Option A)
  const EVT_GROUP_UPDATED = 'quota:group-updated';

  // =========================
  // Helpers
  // =========================
  function clampInt(n, min, max) {
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  function getPercentInt(input) {
    // <input type="number" step="1">, so we treat this as an integer.
    const raw = input.valueAsNumber;
    if (Number.isFinite(raw)) return clampInt(raw, 0, 100);

    const parsed = Number(String(input.value).trim());
    return clampInt(parsed, 0, 100);
  }

  function getGroupFromNode(node) {
    if (!node) return null;
    if (node instanceof Element) return node.closest(GROUP_SEL);
    return null;
  }

  function setSwatchHeight(swatchEl, percent) {
    swatchEl.style.height = `${clampInt(percent, 0, 100)}%`;
  }

  // =========================
  // Core: sync one group chart
  // =========================
  function syncGroupChart(groupEl) {
    if (!groupEl) return;

    const itemsWrap = groupEl.querySelector(GROUP_ITEMS_SEL);
    const chartWrap = groupEl.querySelector(GROUP_CHART_SEL);
    if (!itemsWrap || !chartWrap) return;

    const itemEls = Array.from(itemsWrap.querySelectorAll(ITEM_SEL));
    const swatchEls = Array.from(chartWrap.querySelectorAll(CHART_SWATCH_SEL));

    // Defensive: sync by index, but also allow `.item-N` targeting when present.
    const n = Math.min(itemEls.length, swatchEls.length);

    for (let i = 0; i < n; i += 1) {
      const itemEl = itemEls[i];
      const input = itemEl.querySelector(INPUT_PERCENT_SEL);
      const percent = input ? getPercentInt(input) : 0;

      // Prefer matching by `.item-N` if it exists, otherwise fall back to index.
      const itemClass = `item-${i + 1}`;
      const swatchByClass = chartWrap.querySelector(`${CHART_SWATCH_SEL}.${itemClass}`);
      const swatchEl = swatchByClass || swatchEls[i];

      if (swatchEl) setSwatchHeight(swatchEl, percent);
    }

    // If there are extra swatches (shouldn’t happen, but just in case), zero them.
    for (let i = n; i < swatchEls.length; i += 1) {
      setSwatchHeight(swatchEls[i], 0);
    }
  }

  function syncAllCharts() {
    document.querySelectorAll(GROUP_SEL).forEach(syncGroupChart);
  }

  // =========================
  // Option A: event listener
  // =========================
  function onGroupUpdated(e) {
    // Support a few payload styles so file #1 can stay flexible:
    // 1) dispatched on the group element itself (best): e.target.closest(GROUP_SEL)
    // 2) dispatched on document with detail.groupEl
    // 3) dispatched on document with detail.group (alias)
    const detail = e.detail || {};
    const groupEl =
      detail.groupEl ||
      detail.group ||
      getGroupFromNode(e.target);

    if (!groupEl) return;
    syncGroupChart(groupEl);
  }

  // =========================
  // Fallback: listen for focusout on inputs
  // =========================
  // This means file #2 works even before you wire up the custom event in file #1.
  function onDocumentFocusOut(e) {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.matches(INPUT_PERCENT_SEL)) return;

    const groupEl = getGroupFromNode(input);
    if (!groupEl) return;

    // By the time focusout bubbles, your file #1 handler should have rebalanced values.
    // So we simply re-read and paint the chart.
    syncGroupChart(groupEl);
  }

  // =========================
  // Init
  // =========================
  function init() {
    // Initial render (page load)
    syncAllCharts();

    // Option A listener
    document.addEventListener(EVT_GROUP_UPDATED, onGroupUpdated);

    // Fallback safety net
    document.addEventListener('focusout', onDocumentFocusOut);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();










(function () {
  const GROUP_SEL = '.fs-recruitGroup';
  const INDEX_ATTR = 'data-item-index';
  const ACTIVE_CLASS = 'is-pairedActive';

  function getIndexFromEl(el) {
    const host = el.closest(`[${INDEX_ATTR}]`);
    if (!host) return null;

    const idx = host.getAttribute(INDEX_ATTR);
    // Allow "1", "2", etc. Treat empty as null.
    return idx && idx.trim() ? idx.trim() : null;
  }

  function clearActive(groupEl) {
    groupEl.querySelectorAll(`.${ACTIVE_CLASS}`).forEach((el) => {
      el.classList.remove(ACTIVE_CLASS);
    });
  }

  function setActive(groupEl, index) {
    if (!index) return;
    groupEl.querySelectorAll(`[${INDEX_ATTR}="${CSS.escape(index)}"]`).forEach((el) => {
      el.classList.add(ACTIVE_CLASS);
    });
  }

  function bindGroupInteractivity(groupEl) {
    if (groupEl.__pairedHoverBound) return;
    groupEl.__pairedHoverBound = true;

    // Pointer hover (covers mouse + pen)
    groupEl.addEventListener('pointerover', (e) => {
      const index = getIndexFromEl(e.target);
      if (!index) return;

      clearActive(groupEl);
      setActive(groupEl, index);
    });

    groupEl.addEventListener('pointerout', (e) => {
      // If we’re moving within the same group, only clear if we’ve left any indexed element.
      const related = e.relatedTarget;
      if (related instanceof Element && groupEl.contains(related)) {
        // Still inside the group; if we’re still over an indexed element, keep it.
        const index = getIndexFromEl(related);
        if (index) {
          clearActive(groupEl);
          setActive(groupEl, index);
          return;
        }
      }
      clearActive(groupEl);
    });

    // Keyboard focus pairing:
    // - focusin sets active for the row you're in
    // - focusout clears if focus leaves the group
    groupEl.addEventListener('focusin', (e) => {
      const index = getIndexFromEl(e.target);
      if (!index) return;

      clearActive(groupEl);
      setActive(groupEl, index);
    });

    groupEl.addEventListener('focusout', (e) => {
      const next = e.relatedTarget;
      if (next instanceof Element && groupEl.contains(next)) return; // focus still inside group
      clearActive(groupEl);
    });
  }

  function initPairedHover() {
    document.querySelectorAll(GROUP_SEL).forEach(bindGroupInteractivity);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPairedHover);
  } else {
    initPairedHover();
  }
})();