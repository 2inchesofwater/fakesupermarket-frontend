export function unavailableRipple() {
  document.querySelectorAll('.fs-unavailable').forEach(element => {
    element.addEventListener('click', function(e) {
      // Prevent default actions (optional)
      e.preventDefault();

      // 1. Blur Pulse
      element.classList.add('blur-pulse');
      setTimeout(() => element.classList.remove('blur-pulse'), 250);

      // 2. Ripple Effect
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const size = 120; // fixed ripple size in px

    const ripple = document.createElement('span');
    ripple.className = 'fs-forcefield-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;

      // Insert into the element
      element.appendChild(ripple);

      // Remove the ripple after animation completes
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}