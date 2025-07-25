const backdrop = document.getElementById('modalBackdrop');

window.addEventListener('show-backdrop', () => {
  backdrop.hidden = false;
  backdrop.classList.remove('hide');
  backdrop.classList.add('show');
});
window.addEventListener('hide-backdrop', () => {
  backdrop.classList.remove('show');
  backdrop.classList.add('hide');
});

// Listen for transition end to actually hide
backdrop.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'opacity' && backdrop.classList.contains('hide')) {
    backdrop.classList.remove('hide');
    backdrop.hidden = true;
  }
});