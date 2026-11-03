/* There's one Next button, with a class of .fs-btn-next. There's also a Submit button, with a class of .fs-btn-submit

This gets a little trickier to explain when we get to the interview/carousel...
There's an arbitrary number of interview questions, and there is one slide per question. There's also one additional post-interview slide.

The wrapper div for interview question slides carry the selector .fs-carousel-slide.fs-interview-question; the post-interview slide is #fs-interview-complete.fs-carousel-slide

Most (ie, n-1) interview questions display the Next button. The final interview question hides (ie, using the hidden attribute) the Next button, and removes the hidden attribute from the Submit button.

There is no button on the post-interview slide. 

Before the Next button or Submit button cause the carousel slides to animate, they should call some kind of validation/pre-flight function. This function will be a stub for now; the real developers just need to know to have the conversation about it with me later on.  
*/


const track = document.querySelector('.fs-carousel-track');
const slides = Array.from(document.querySelectorAll('.fs-carousel-slide.fs-interview-question'));
const postSlide = document.querySelector('#fs-interview-complete.fs-carousel-slide');

const progressBar = document.querySelector('.fs-progressBar');
const nextBtn = document.querySelector('.fs-btn-next');
const submitBtn = document.querySelector('.fs-btn-submit');

const totalSlides = 1 + slides.length + 1; // interview questions + welcome + post-interview slide
let currentSlide = 0; 

export function updateInterviewCarouselUI() {
  const offset = currentSlide * -100;
  if (track) {
    track.style.transform = `translateX(${offset}%)`;
  }

  if (progressBar) {
    progressBar.value = currentSlide + 1; // 1-based for progress bar
    progressBar.max = totalSlides;
    progressBar.setAttribute('aria-valuenow', currentSlide + 1);
    progressBar.setAttribute('aria-valuemax', totalSlides);
  }

  if (currentSlide < slides.length) {
    // Welcome slide and all interview questions except the last show 'Next'
    nextBtn.hidden = false;
    submitBtn.hidden = true;
  } else if (currentSlide === slides.length) {
    // Last interview question: Show 'Submit', hide 'Next'
    nextBtn.hidden = true;
    submitBtn.hidden = false;
  } else {
    // Post-interview slide: hide both
    nextBtn.hidden = true;
    submitBtn.hidden = true;
  }
}

export function resetInterviewCarousel() {
  currentSlide = 0;
  updateInterviewCarouselUI();
}


function validateCurrentSlide(slideIdx) {
  // TODO: Implement real validation logic!
  // For now, always passes.
  return true;
}

nextBtn?.addEventListener('click', () => {
  if (!validateCurrentSlide(currentSlide)) return;
  if (currentSlide < slides.length) {
    currentSlide += 1;
    updateInterviewCarouselUI();
  }
});

// Submit button handler
submitBtn?.addEventListener('click', () => {
  if (!validateCurrentSlide(currentSlide)) return;
  if (currentSlide === slides.length) {
    currentSlide += 1; // Move to post-interview slide
    updateInterviewCarouselUI();
  }
});


document.addEventListener('DOMContentLoaded', resetInterviewCarousel);
