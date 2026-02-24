// demo-recruitmentRows.js

function makeCharId(prefix = "char") {
  // short base36 token; good enough for UI identity
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getGroupSlug(detailsEl) {
  // details name="fs-recruitGroup-gender" => "gender"
  const name = detailsEl.getAttribute("name") || "";
  return name.replace(/^fs-recruitGroup-/, "") || "group";
}

function nextIndex(detailsEl) {
  const items = detailsEl.querySelectorAll(".fs-recruitGroup-items .fs-recruitGroup-item[data-item-index]");
  let max = 0;
  items.forEach(el => {
    const n = Number(el.getAttribute("data-item-index"));
    if (Number.isFinite(n)) max = Math.max(max, n);
  });
  return max + 1;
}

function rewriteSegmentIds(segmentEl, groupSlug, charId) {
  // Your template currently has ids like:
  // recruitSegment__criteria, recruitSegment___percentage, recruitSegment___expand, etc. :contentReference[oaicite:1]{index=1}
  // We’ll stamp them to something stable + unique.

  const base = `recruitSegment_${groupSlug}_${charId}`;

  // Wrapper
  segmentEl.id = `${base}_criteria`;

  // Title + explanation
  const titleEl = segmentEl.querySelector(".fs-recruitSegment-title");
  if (titleEl) titleEl.id = base;

  const explEl = segmentEl.querySelector(".fs-recruitSegment-explanation");
  if (explEl) explEl.id = `${base}_explanation`;

  // Percentage input
  const pctEl = segmentEl.querySelector("input.fs-recruitSegment-percentage");
  if (pctEl) pctEl.id = `${base}_percentage`;

  // Buttons
  const expandBtn = segmentEl.querySelector(".fs-recruitSegment-expand-wrapper button");
  if (expandBtn) {
    expandBtn.id = `${base}_expand`;
    expandBtn.setAttribute("aria-expanded", "false");
    // In your markup, aria-controls points at the title id. Keep that behaviour.
    expandBtn.setAttribute("aria-controls", base);
  }

  const editBtn = segmentEl.querySelector(".fs-recruitSegment-edit-wrapper button");
  if (editBtn) editBtn.id = `${base}_edit`;

  const lockBtn = segmentEl.querySelector(".fs-recruitSegment-lock-wrapper button");
  if (lockBtn) {
    lockBtn.id = `${base}_lock`;
    lockBtn.setAttribute("aria-pressed", "false");
  }

  const delBtn = segmentEl.querySelector(".fs-recruitSegment-delete-wrapper button");
  if (delBtn) delBtn.id = `${base}_delete`;
}

function normaliseNewRow(rowEl) {
  // Clear visible content
  const titleEl = rowEl.querySelector(".fs-recruitSegment-title");
  if (titleEl) titleEl.textContent = "";

  const explEl = rowEl.querySelector(".fs-recruitSegment-explanation");
  if (explEl) explEl.textContent = "";

  // Clear value (your template already uses 0) :contentReference[oaicite:2]{index=2}
  const pctEl = rowEl.querySelector("input.fs-recruitSegment-percentage");
  if (pctEl) pctEl.value = "0";

  // Reset any “edit” state you might be toggling
  const editBtn = rowEl.querySelector(".fs-recruitSegment-edit-wrapper button");
  if (editBtn) editBtn.hidden = true;
}

function addCharacteristic(detailsEl) {
  const groupSlug = getGroupSlug(detailsEl);
  const index = nextIndex(detailsEl);
  const charId = makeCharId();

  const templateRoot = document.querySelector("#fs-recruitGroup-template details.fs-recruitGroup");
  if (!templateRoot) return;

  const rowProto = templateRoot.querySelector(".fs-recruitGroup-items .fs-recruitGroup-item[data-item-index]");
  const chartProto = templateRoot.querySelector(".fs-recruitGroup-chart .fs-recruitGroup-chart-item[data-item-index]");
  if (!rowProto || !chartProto) return;

  // Clone prototypes
  const newRow = rowProto.cloneNode(true);
  const newChart = chartProto.cloneNode(true);

  // Stamp pairing/index
  newRow.setAttribute("data-item-index", String(index));
  newChart.setAttribute("data-item-index", String(index));

  // Stamp machine identity (your CSS/JS can treat this as “temp id”)
  newRow.setAttribute("data-item-id", charId);
  newChart.setAttribute("data-item-id", charId);

  // Fix IDs inside the segment
  const seg = newRow.querySelector(".fs-recruitSegment");
  if (seg) rewriteSegmentIds(seg, groupSlug, charId);

  normaliseNewRow(newRow);

  // Insert into this group
  const itemsHost = detailsEl.querySelector(".fs-recruitGroup-items");
  const chartHost = detailsEl.querySelector(".fs-recruitGroup-chart");
  if (!itemsHost || !chartHost) return;

  itemsHost.appendChild(newRow);
  chartHost.appendChild(newChart);

  // Kick into “edit mode” (for now: focus percentage; later: focus label input)
  const pctEl = newRow.querySelector("input.fs-recruitSegment-percentage");
  pctEl?.focus();

  // Let your other scripts respond (rebalance, chart hover bindings, etc.)
  detailsEl.dispatchEvent(new CustomEvent("rows:changed", { bubbles: true }));
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".fs-recruitGroup .fs-btnGroup .fs-btn");
  if (!btn) return;

  // Your buttons are currently just "Add another" without an attribute. :contentReference[oaicite:3]{index=3}
  // This keeps it scoped and avoids false positives elsewhere.
  if (btn.textContent.trim() !== "Add another") return;

  const detailsEl = btn.closest("details.fs-recruitGroup");
  if (!detailsEl) return;

  addCharacteristic(detailsEl);
});
