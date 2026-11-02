
  export function availableTimeSlots(containerId, slots, cartInstance) {


  const container = document.getElementById(containerId);
  if (!container) return;

  // Begin fieldset
  let html = `<fieldset role="radiogroup" class="radiogroup" aria-label="Available time slots for the selected day">`;

  let radioIdx = 0;
  slots.forEach((section) => {
    // Heading
    html += `
      <h3>${section.heading}</h3><div class="radio-subgroup">
    `;
    section.times.forEach((slot) => {
      radioIdx++;
      const radioId = `slotRadio${radioIdx}`;
      html += `
          <label for="${radioId}" class="radio">
            <input type="radio" name="time-slot" id="${radioId}" value="${slot.value}" ${radioIdx === 1 ? "checked" : ""}>
              <span class="slot">${slot.label}</span>
              <span class="cost">${cartInstance.formatPrice(slot.cost)}</span>
          </label>
      `;
    });
    html += `</div>`;
  });

  html += `</fieldset>`;
  container.innerHTML = html;
}