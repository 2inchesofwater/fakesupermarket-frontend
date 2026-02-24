(function () {
  // =========================
  // Constants
  // =========================
  const TOTAL_PARTICIPANTS = 300;

  const GROUP_SEL = '.fs-recruitGroup';
  const SEGMENT_SEL = '.fs-recruitSegment';

  const BTN_EXPAND_SEL = 'button[id$="_expand"][aria-controls]';
  const BTN_LOCK_SEL = 'button[id$="_lock"]';

  const INPUT_PERCENT_SEL = 'input.fs-recruitSegment-percentage';
  const COUNT_VALUE_SEL = '.fs-inputGroup-help-value';

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

  function setPercentInt(input, value) {
    input.value = String(clampInt(value, 0, 100));
  }

  function getGroupFromSegment(segment) {
    return segment.closest(GROUP_SEL);
  }

  function getSegmentsInGroup(group) {
    return Array.from(group.querySelectorAll(SEGMENT_SEL));
  }

  function getInput(segment) {
    return segment.querySelector(INPUT_PERCENT_SEL);
  }

  function getPeopleSpan(segment) {
    return segment.querySelector(COUNT_VALUE_SEL);
  }

  // =========================
  // People allocation (exact total)
  // =========================
  function allocatePeopleExactly(segments) {
    // Largest remainder method:
    // - compute raw = percent/100 * TOTAL
    // - take floor for each
    // - distribute remaining +1 to the biggest fractional parts
    const rows = segments
      .map((segment, index) => {
        const input = getInput(segment);
        const percent = input ? getPercentInt(input) : 0;

        const raw = (percent / 100) * TOTAL_PARTICIPANTS;
        const base = Math.floor(raw);
        const frac = raw - base;

        return { segment, index, percent, raw, base, frac, people: base };
      });

    const baseSum = rows.reduce((sum, r) => sum + r.base, 0);
    let remainder = TOTAL_PARTICIPANTS - baseSum;

    const candidates = rows.filter(r => r.percent > 0);
    candidates
      .slice()
      .sort((a, b) => {
        // Desc by fractional part; stable tie-break by DOM order
        if (b.frac !== a.frac) return b.frac - a.frac;
        return a.index - b.index;
      })
      .forEach((r) => {
        if (remainder <= 0) return;
        r.people += 1;
        remainder -= 1;
      });

    // Write out
    rows.forEach((r) => {
      const out = getPeopleSpan(r.segment);
      if (out) out.textContent = String(r.people);
    });
  }

  // =========================
  // Percentage rebalancing (exact 100%)
  // =========================
  function rebalanceGroup(changedInput) {
    const changedSegment = changedInput.closest(SEGMENT_SEL);
    if (!changedSegment) return;

    const group = getGroupFromSegment(changedSegment);
    if (!group) return;

    const segments = getSegmentsInGroup(group);

    // Identify changed input’s segment, and collect locked/unlocked sets
    const rows = segments
      .map((segment, index) => {
        const input = getInput(segment);
        if (!input) return null;
        return { segment, input, index, locked: input.disabled, value: getPercentInt(input) };
      })
      .filter(Boolean);

    const changedRow = rows.find((r) => r.input === changedInput);
    if (!changedRow || changedRow.locked) return;

    // Locked sum excludes the changed input (because it’s unlocked)
    const lockedSum = rows.reduce((sum, r) => {
      if (r.input === changedInput) return sum;
      return sum + (r.locked ? r.value : 0);
    }, 0);

    const otherUnlocked = rows.filter((r) => r.input !== changedInput && !r.locked);

    // Max the changed value can be, given locked values and minimum 0 for others
    const maxChanged = 100 - lockedSum;
    let changedValue = clampInt(getPercentInt(changedInput), 0, maxChanged);

    // If there are no other unlocked rows, changed must take the remainder exactly
    if (otherUnlocked.length === 0) {
      changedValue = clampInt(maxChanged, 0, 100);
      setPercentInt(changedInput, changedValue);
      allocatePeopleExactly(segments);
      return;
    }

    setPercentInt(changedInput, changedValue);

    // Remaining percent to distribute among other unlocked
    let remaining = 100 - lockedSum - changedValue;
    if (remaining < 0) remaining = 0; // defensive (shouldn’t happen after clamp)

    // Prefer proportional scaling to preserve the existing relative shape
    const currentSum = otherUnlocked.reduce((sum, r) => sum + r.value, 0);

    let allocations = [];

    if (currentSum <= 0) {
      // Even split
      const n = otherUnlocked.length;
      const base = Math.floor(remaining / n);
      let extra = remaining - base * n;

      allocations = otherUnlocked.map((r) => {
        const add = extra > 0 ? 1 : 0;
        if (extra > 0) extra -= 1;
        return { row: r, newValue: base + add };
      });
    } else {
      // Proportional + largest remainder for exact integer sum
      const rawAlloc = otherUnlocked.map((r) => {
        const raw = (r.value / currentSum) * remaining;
        const base = Math.floor(raw);
        const frac = raw - base;
        return { row: r, base, frac };
      });

      const baseSum = rawAlloc.reduce((sum, a) => sum + a.base, 0);
      let extra = remaining - baseSum;

      rawAlloc
        .slice()
        .sort((a, b) => {
          if (b.frac !== a.frac) return b.frac - a.frac;
          return a.row.index - b.row.index;
        })
        .forEach((a) => {
          if (extra <= 0) return;
          a.base += 1;
          extra -= 1;
        });

      allocations = rawAlloc.map((a) => ({ row: a.row, newValue: a.base }));
    }

    // Apply allocations
    allocations.forEach(({ row, newValue }) => {
      setPercentInt(row.input, newValue);
    });

    // Finally: allocate people exactly across *all* segments in the group
    allocatePeopleExactly(segments);
  }

  // =========================
  // Lock / Unlock
  // =========================
  function setLockState(segment, locked) {
    const input = getInput(segment);
    const btn = segment.querySelector(BTN_LOCK_SEL);
    if (!input || !btn) return;

    input.toggleAttribute('disabled', locked);
    input.setAttribute('aria-disabled', String(locked));

    btn.setAttribute('aria-pressed', String(locked));
    btn.setAttribute('aria-label', locked ? 'Unlock values' : 'Lock values');

    const label = btn.querySelector('.label');
    if (label) label.textContent = locked ? 'Unlock' : 'Lock';
  }

  function syncLockUI(segment) {
    const input = getInput(segment);
    if (!input) return;
    setLockState(segment, input.disabled);
  }

  // =========================
  // Accordion behaviour
  // =========================
  function setOpenState(segment, isOpen) {
    segment.classList.toggle('open', isOpen);

    const btn = segment.querySelector(BTN_EXPAND_SEL);
    if (btn) btn.setAttribute('aria-expanded', String(isOpen));

    const controlsId = btn && btn.getAttribute('aria-controls');
    if (controlsId) {
      const region = document.getElementById(controlsId);
      if (region) region.setAttribute('aria-expanded', String(isOpen));
    }
  }

  function closeOtherOpenSegments(currentSegment) {
    document.querySelectorAll(`${SEGMENT_SEL}.open`).forEach((seg) => {
      if (seg !== currentSegment) setOpenState(seg, false);
    });
  }

  // =========================
  // Event handlers
  // =========================
  function onDocumentClick(e) {
    // Expand/collapse
    const expandBtn = e.target.closest(BTN_EXPAND_SEL);
    if (expandBtn) {
      e.preventDefault();

      const segment = expandBtn.closest(SEGMENT_SEL);
      if (!segment) return;

      const isOpen = segment.classList.contains('open');
      const willOpen = !isOpen;

      if (willOpen) closeOtherOpenSegments(segment);
      setOpenState(segment, willOpen);
      return;
    }

    // Lock/unlock
    const lockBtn = e.target.closest(BTN_LOCK_SEL);
    if (lockBtn) {
      e.preventDefault();

      const segment = lockBtn.closest(SEGMENT_SEL);
      if (!segment) return;

      const input = getInput(segment);
      if (!input) return;

      const willLock = !input.disabled;
      setLockState(segment, willLock);

      // Optional nicety: if someone locks a row and your group isn’t perfectly normalised
      // (e.g. initial content), a quick rebalance pass keeps you honest.
      const group = getGroupFromSegment(segment);
      if (group) {
        const segments = getSegmentsInGroup(group);
        allocatePeopleExactly(segments);
      }
    }
  }

  // Update only when the user leaves the input (blur via bubbling focusout)
  function onDocumentFocusOut(e) {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.matches(INPUT_PERCENT_SEL)) return;
    if (input.disabled) return;

    // Rebalance siblings + allocate people exactly
    rebalanceGroup(input);
  }

  function init() {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('focusout', onDocumentFocusOut);

    // Initial: normalise people counts exactly per group, and sync lock UI
    document.querySelectorAll(GROUP_SEL).forEach((group) => {
      const segments = getSegmentsInGroup(group);
      allocatePeopleExactly(segments);
      segments.forEach(syncLockUI);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
