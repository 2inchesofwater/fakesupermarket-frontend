export function updateUpcomingDates(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;

  // Get all pills in the group
  const pills = group.querySelectorAll('.pill');
  const today = new Date();

  pills.forEach((pill, idx) => {
    const dayEl = pill.querySelector('.day');
    const dateEl = pill.querySelector('.date');

    // Calculate pill date
    const pillDate = new Date(today);
    pillDate.setDate(today.getDate() + idx);

    // Determine day label
    let dayText;
    if (idx === 0) {
      dayText = "Today";
    } else if (idx === 1) {
      dayText = "Tomorrow";
    } else {
      // Localized short weekday name, e.g. "Thu"
      dayText = pillDate.toLocaleDateString(undefined, { weekday: "short" });
    }

    // Localized date string, e.g. "Jul 31"
    const dateText = pillDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    if (dayEl) dayEl.textContent = dayText;
    if (dateEl) dateEl.textContent = dateText;
  });
}