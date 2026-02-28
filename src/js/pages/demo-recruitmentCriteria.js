(function () {
  // =========================
  // Constants
  // =========================
  const POPULATION_INPUT_ID = 'fs-populationSize';
  const POPULATION_VALUE_ID = 'fs-populationSize-value';

  const GROUP_SEL = '.fs-recruitGroup';
  const SEGMENT_SEL = '.fs-recruitSegment';

  const BTN_EXPAND_SEL = 'button[id$="_expand"][aria-controls]';
  const BTN_LOCK_SEL = 'button[id$="_lock"]';


  // =========================
  // Derived population bindings
  // =========================
  const GROUP_NAME_PREFIX = 'fs-recruitGroup-';

  const ATTR_USE_POP = 'data-use-population';
  const ATTR_USE_GROUP = 'data-use-anothergroup';
  const ATTR_USE_SEGMENT = 'data-use-anothersegment';

  const GROUP_ITEM_SEL = '.fs-recruitGroup-item';
  const GROUP_ITEM_ID_ATTR = 'data-item-id';

  const DERIVED_P_CLASS = 'fs-recruitGroup-derivedPopulation';

  function getGroupSlug(groupEl) {
    const name = groupEl?.getAttribute('name') || '';
    return name.startsWith(GROUP_NAME_PREFIX) ? name.slice(GROUP_NAME_PREFIX.length) : '';
  }

  function findGroupBySlug(slug) {
    if (!slug) return null;
    return document.querySelector(
      `${GROUP_SEL}[name="${CSS.escape(GROUP_NAME_PREFIX + slug)}"]`
    );
  }

  function findSegmentInputByItemId(groupEl, itemId) {
    const item = groupEl?.querySelector(
      `${GROUP_ITEM_SEL}[${GROUP_ITEM_ID_ATTR}="${CSS.escape(itemId)}"]`
    );
    return item?.querySelector('input.fs-recruitSegment-percentage') || null;
  }

  function getGroupTitle(groupEl) {
    const h = groupEl?.querySelector(':scope > summary h3');
    return h ? h.textContent.trim() : getGroupSlug(groupEl);
  }

  function getSegmentTitleByItemId(groupEl, itemId) {
    const item = groupEl?.querySelector(
      `${GROUP_ITEM_SEL}[${GROUP_ITEM_ID_ATTR}="${CSS.escape(itemId)}"]`
    );
    if (!item) return itemId;
    const t = item.querySelector('.fs-recruitSegment-title');
    return t ? t.textContent.trim() : itemId;
  }

  function ensureDerivedPopulationElement(groupEl) {
    const summary = groupEl?.querySelector(':scope > summary .fs-recruitGroup-summary');
    if (!summary) return null;

    let p = summary.querySelector(`:scope > p.${DERIVED_P_CLASS}`);
    if (!p) {
      p = document.createElement('p');
      p.className = DERIVED_P_CLASS;
      summary.appendChild(p);
    }
    return p;
  }

  function removeDerivedPopulationElement(groupEl) {
    const summary = groupEl?.querySelector(':scope > summary');
    const p = summary?.querySelector(`:scope > p.${DERIVED_P_CLASS}`);
    if (p) p.remove();
  }

  function getGroupTotalParticipants(groupEl, cache = new Map(), stack = new Set()) {
    const slug = getGroupSlug(groupEl);
    if (slug && cache.has(slug)) return cache.get(slug);
    if (!groupEl) return 0;

    if (slug && stack.has(slug)) return 0; // circular guard

    const usePopAttr = groupEl.getAttribute(ATTR_USE_POP);
    const usePopulation = (usePopAttr == null) ? true : (usePopAttr === 'true');

    let total = 0;

    if (usePopulation) {
      total = totalParticipants;
    } else {
      const srcGroupSlug = groupEl.getAttribute(ATTR_USE_GROUP) || '';
      const srcSegmentId = groupEl.getAttribute(ATTR_USE_SEGMENT) || '';

      const srcGroup = findGroupBySlug(srcGroupSlug);
      if (!srcGroup) {
        total = 0;
      } else {
        if (slug) stack.add(slug);

        const srcTotal = getGroupTotalParticipants(srcGroup, cache, stack);
        const srcInput = findSegmentInputByItemId(srcGroup, srcSegmentId);
        const pct = srcInput ? getPercentInt(srcInput) : 0;

        total = (pct / 100) * srcTotal;

        if (slug) stack.delete(slug);
      }
    }

    // Derived totals should behave like a count of people (integer)
    total = clampInt(Math.round(total), 0, Number.MAX_SAFE_INTEGER);

    if (slug) cache.set(slug, total);
    return total;
  }

  function updateDerivedPopulationUI(groupEl, cache) {
    const usePopAttr = groupEl.getAttribute(ATTR_USE_POP);
    const usePopulation = (usePopAttr == null) ? true : (usePopAttr === 'true');

    if (usePopulation) {
      removeDerivedPopulationElement(groupEl);
      return;
    }

    const srcGroupSlug = groupEl.getAttribute(ATTR_USE_GROUP) || '';
    const srcSegmentId = groupEl.getAttribute(ATTR_USE_SEGMENT) || '';
    const srcGroup = findGroupBySlug(srcGroupSlug);

    const derivedTotal = getGroupTotalParticipants(groupEl, cache);

    const p = ensureDerivedPopulationElement(groupEl);
    if (!p) return;

    if (!srcGroup) {
      p.textContent = `Derived population: ${derivedTotal} people`;
      return;
    }

    const srcTitle = getGroupTitle(srcGroup);
    const segTitle = getSegmentTitleByItemId(srcGroup, srcSegmentId);
    const srcInput = findSegmentInputByItemId(srcGroup, srcSegmentId);
    const pct = srcInput ? getPercentInt(srcInput) : 0;

    p.textContent = `Derived population: ${derivedTotal} people (from ${srcTitle} → ${segTitle} at ${pct}%)`;
  }

  // Dependency graph: source group slug -> dependent group slugs
  let dependentsByGroup = new Map();

  function rebuildDependencyGraph() {
    const next = new Map();

    document.querySelectorAll(GROUP_SEL).forEach((group) => {
      const usePopAttr = group.getAttribute(ATTR_USE_POP);
      const usePopulation = (usePopAttr == null) ? true : (usePopAttr === 'true');
      if (usePopulation) return;

      const dependentSlug = getGroupSlug(group);
      const srcGroupSlug = group.getAttribute(ATTR_USE_GROUP) || '';
      if (!dependentSlug || !srcGroupSlug) return;

      if (!next.has(srcGroupSlug)) next.set(srcGroupSlug, new Set());
      next.get(srcGroupSlug).add(dependentSlug);
    });

    dependentsByGroup = next;
  }

  function collectDownstreamGroupSlugs(rootSlug) {
    const out = new Set();
    const queue = [];

    if (rootSlug) {
      out.add(rootSlug);
      queue.push(rootSlug);
    }

    while (queue.length) {
      const slug = queue.shift();
      const deps = dependentsByGroup.get(slug);
      if (!deps) continue;

      deps.forEach((depSlug) => {
        if (!out.has(depSlug)) {
          out.add(depSlug);
          queue.push(depSlug);
        }
      });
    }

    return Array.from(out);
  }

  function refreshAllocationsFromGroupSlug(rootSlug) {
    rebuildDependencyGraph();

    const slugs = collectDownstreamGroupSlugs(rootSlug);
    const cache = new Map();

    slugs.forEach((slug) => {
      const group = findGroupBySlug(slug);
      if (!group) return;

      updateDerivedPopulationUI(group, cache);

      const segments = getSegmentsInGroup(group);
      const groupTotal = getGroupTotalParticipants(group, cache);
      allocatePeopleExactly(segments, groupTotal);
    });
  }

  function refreshAllAllocations() {
    rebuildDependencyGraph();

    const cache = new Map();
    document.querySelectorAll(GROUP_SEL).forEach((group) => {
      updateDerivedPopulationUI(group, cache);

      const segments = getSegmentsInGroup(group);
      const groupTotal = getGroupTotalParticipants(group, cache);
      allocatePeopleExactly(segments, groupTotal);
    });
  }

  const INPUT_PERCENT_SEL = 'input.fs-recruitSegment-percentage';
  const COUNT_VALUE_SEL = '.fs-inputGroup-quota-value';

  let totalParticipants = 0;
  let _rafRefreshScheduled = false;

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

  function getPopulationInput() {
    return document.getElementById(POPULATION_INPUT_ID);
  }  

  function setPopulationUI(value) {
    const span = document.getElementById(POPULATION_VALUE_ID);
    if (span) span.textContent = String(value);
  }

  function readPopulationFromUI() {
    const input = getPopulationInput();
    if (!input) return 0;

    return input.valueAsNumber || Number(input.value) || 0;
  }

  // =========================
  // People allocation (exact total)
  // =========================
  function allocatePeopleExactly(segments, groupTotal) {
    // Largest remainder method:
    // - compute raw = percent/100 * TOTAL
    // - take floor for each
    // - distribute remaining +1 to the biggest fractional parts
    const total = clampInt(groupTotal, 0, Number.MAX_SAFE_INTEGER);

    const rows = segments
      .map((segment, index) => {
        const input = getInput(segment);
        const percent = input ? getPercentInt(input) : 0;

        const raw = (percent / 100) * total;
        const base = Math.floor(raw);
        const frac = raw - base;

        return { segment, index, percent, raw, base, frac, people: base };
      });

    const baseSum = rows.reduce((sum, r) => sum + r.base, 0);
    let remainder = total - baseSum;

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
      refreshAllocationsFromGroupSlug(getGroupSlug(group));
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

    // Finally: allocate people across all groups (derived populations may depend on this group)
    refreshAllocationsFromGroupSlug(getGroupSlug(group));
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
        refreshAllocationsFromGroupSlug(getGroupSlug(group));
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

  
// Live update derived populations as the user types.
// Note: We do NOT rebalance percentages here (that remains on focusout),
// but we do refresh people/derived totals so dependants respond immediately.
function onDocumentInput(e) {
  const input = e.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.id === POPULATION_INPUT_ID) return; // handled separately
  if (!input.matches(INPUT_PERCENT_SEL)) return;
  if (input.disabled) return;

  const group = input.closest(GROUP_SEL);
  const rootSlug = group ? getGroupSlug(group) : '';

  // If we can’t resolve a slug, fall back to the safe option.
  if (!rootSlug) {
    if (_rafRefreshScheduled) return;
    _rafRefreshScheduled = true;
    requestAnimationFrame(() => {
      _rafRefreshScheduled = false;
      refreshAllAllocations();
    });
    return;
  }

  if (_rafRefreshScheduled) return;
  _rafRefreshScheduled = true;
  requestAnimationFrame(() => {
    _rafRefreshScheduled = false;
    refreshAllocationsFromGroupSlug(rootSlug);
  });
}


  function onPopulationInput() {
    totalParticipants = readPopulationFromUI();
    setPopulationUI(totalParticipants);

    // Recalculate allocations across every group (derived populations included)
    refreshAllAllocations();
  }

  function init() {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('focusout', onDocumentFocusOut);
    document.addEventListener('input', onDocumentInput);


    totalParticipants = readPopulationFromUI();
    if (totalParticipants) setPopulationUI(totalParticipants);

    const popInput = getPopulationInput();
    if (popInput) popInput.addEventListener('input', onPopulationInput);
    
    // Initial: normalise people counts (including derived populations), and sync lock UI
    refreshAllAllocations();

    document.querySelectorAll(GROUP_SEL).forEach((group) => {
      const segments = getSegmentsInGroup(group);
      segments.forEach(syncLockUI);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
