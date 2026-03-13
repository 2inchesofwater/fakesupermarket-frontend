document.addEventListener('DOMContentLoaded', () => {
  const expandButtons = Array.from(
    document.querySelectorAll('.fs-completionSegment-expand-wrapper button')
  );

  expandButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const segment = button.closest('.fs-completionSegment');
      if (!segment) return;

      const isOpen = segment.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });
});