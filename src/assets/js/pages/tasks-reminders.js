const dialog = document.getElementById('fs-tasks-reminders');
const currentTask = dialog?.querySelector('a[aria-current="page"]');

currentTask?.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  event.preventDefault();
  dialog.close();
});
