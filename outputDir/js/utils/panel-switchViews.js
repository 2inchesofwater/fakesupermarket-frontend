export function panelSwitchViews(panelIdA, panelIdB) {
  const panelA = document.getElementById(panelIdA);
  const panelB = document.getElementById(panelIdB);

  if (!panelA || !panelB) return;

  function switchPanel(show, hide) {
    show.removeAttribute('hidden');
    hide.setAttribute('hidden', 'hidden');
  }

  // Attach event listeners to links/buttons within each panel
  panelA.querySelectorAll('.panel-overview a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchPanel(panelB, panelA);
    });
  });
  panelB.querySelectorAll('.panel-overview a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchPanel(panelA, panelB);
    });
  });
}