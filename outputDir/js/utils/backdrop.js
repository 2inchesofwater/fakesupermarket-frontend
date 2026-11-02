const backdrop = document.getElementById('modalBackdrop');

window.addEventListener('show-backdrop', () => {
  backdrop.hidden = false;
  backdrop.classList.remove('show', 'hide', 'show-slow');

  requestAnimationFrame(() => {
    backdrop.classList.add('show');
  });
});

window.addEventListener('show-backdrop-slow', () => {
  backdrop.hidden = false;
  backdrop.classList.remove('show', 'hide', 'show-slow');

  requestAnimationFrame(() => {
    backdrop.classList.add('show-slow');
  });
});

window.addEventListener('hide-backdrop', () => {
  backdrop.classList.remove('show', 'show-slow');
  backdrop.classList.add('hide');

  backdrop.addEventListener('transitionend', () => {
    backdrop.hidden = true;
  }, { once: true });
});



// Listen for transition end to actually hide
backdrop.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'opacity' && backdrop.classList.contains('hide')) {
    backdrop.classList.remove('hide');
    backdrop.hidden = true;
  }
});

