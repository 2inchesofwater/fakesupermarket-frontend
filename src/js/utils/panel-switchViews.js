export function panelSwitchViews(panelIdA, panelIdB) {
  const panelA = document.getElementById(panelIdA);
  const panelB = document.getElementById(panelIdB);

  if (!panelA || !panelB) return;

  // Helper to show one panel, hide the other
  function showPanel(show, hide) {
    show.removeAttribute('hidden');
    hide.setAttribute('hidden', 'hidden');
  }

  // Attach event listeners to links/buttons within each panel
  // Assumes the toggle trigger has class "toggle-panel"
  panelA.querySelectorAll('.panel-overview').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPanel(panelB, panelA);
    });
  });
  panelB.querySelectorAll('.panel-overview').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPanel(panelA, panelB);
    });
  });
}