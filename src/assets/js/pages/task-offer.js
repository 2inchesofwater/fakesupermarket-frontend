document.addEventListener('DOMContentLoaded', function() {
  const dialog = document.getElementById('fs-task-offer');
  if (!dialog) return;

  const acceptButton = document.getElementById('task-offer-accept');
  const declineLink = document.getElementById('task-offer-decline');

  acceptButton.addEventListener('click', function() {
    dialog.close();
    window.scrollTo(0, 0);
  });

  dialog.addEventListener('cancel', function(event) {
    event.preventDefault();
    window.location.assign(declineLink.href);
  });

  dialog.showModal();
});
