function initStarRating(questionId) {
  const container = document.getElementById(questionId);
  if (!container) return;

  const stars = Array.from(container.querySelectorAll('button.star'));
  const select = container.querySelector('select');
  const adjectiveLis = container.querySelectorAll('.fs-interview-LikertQuestion-adjectives li');


  let committedRating = parseInt(select.value, 10) || 0;


  // Render stars based on select value (authoritative truth)
  function updateStars(rating) {
    stars.forEach((star, idx) => {
      if (rating > 0 && idx < rating) {
        star.classList.add('selected');
        star.setAttribute('aria-pressed', 'true');
      } else {
        star.classList.remove('selected');
        star.setAttribute('aria-pressed', 'false');
      }
      star.classList.remove('hovered'); // Reset hover
    });
    showAdjective(rating);
  }

  function showAdjective(index) {
    adjectiveLis.forEach((li, i) => {
      li.hidden = (i !== index - 1 || index < 1);
    });
  }

  updateStars(committedRating);

  // Mouse events
  stars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => {
      //console.log('Hovering star', i + 1);
      stars.forEach((s, idx) => {
        if (idx >= i) {
          s.classList.add('hovered');
          s.classList.remove('selected');
        } else {
          s.classList.remove('hovered');
          s.classList.remove('selected');
        }
      });
      showAdjective(i + 1);
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach((s) => s.classList.remove('hovered'));
      updateStars(committedRating);
    });
    star.addEventListener('click', () => {
      committedRating = i + 1;
      select.value = committedRating;
      updateStars(committedRating);
    });
    // Keyboard support
    star.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        committedRating = i + 1;
        select.value = committedRating;
        updateStars(committedRating);
        e.preventDefault();
      }
    });
  });

  // Sync UI if select changes (screen reader, programmatic)
  select.addEventListener('change', () => {
    committedRating = parseInt(select.value, 10) || 0;
    updateStars(committedRating);
  });
}

// Usage example (call for each question on page)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.fs-interview-ratings').forEach(container => {
    initStarRating(container.id);
  });
});