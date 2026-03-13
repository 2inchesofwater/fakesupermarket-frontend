document.addEventListener('DOMContentLoaded', () => {
  const completionWrapper = document.querySelector('.fs-allCompletionGroups');
  if (!completionWrapper) return;

  const daysRemaining = Number(completionWrapper.dataset.demoDaysRemaining);
  const averageCompletionsPerDay = Number(
    completionWrapper.dataset.demoAverageCompletionsPerDay
  );

  const items = completionWrapper.querySelectorAll('.fs-completionGroup-item');

  items.forEach((item) => {
    const targetCount = Number(item.dataset.itemTargetCount);
    const completedCount = Number(item.dataset.itemCompletedCount);
    const availableCount = Number(item.dataset.itemAvailableCount);

    const remainingCount = Math.max(0, targetCount - completedCount);

    const completedPercent = targetCount > 0
      ? Math.round((completedCount / targetCount) * 100)
      : 0;

    const feasibilityRatio = remainingCount > 0
      ? availableCount / remainingCount
      : Infinity;

    const requiredPerDay = daysRemaining > 0
      ? remainingCount / daysRemaining
      : remainingCount;

    const paceRatio = averageCompletionsPerDay > 0
      ? requiredPerDay / averageCompletionsPerDay
      : Infinity;

    const status = getCompletionStatus({
      targetCount,
      completedCount,
      availableCount,
      daysRemaining,
      remainingCount,
      feasibilityRatio,
      paceRatio
    });

    updateCompletionItem(item, {
      completedPercent,
      remainingCount,
      status
    });
  });
});

function getCompletionStatus({
  targetCount,
  completedCount,
  availableCount,
  daysRemaining,
  remainingCount,
  feasibilityRatio,
  paceRatio
}) {
  if (targetCount === 0) return 'Excluded';
  if (completedCount >= targetCount) return 'Completed';
  if (daysRemaining <= 0) return 'Critical';
  if (availableCount < remainingCount) return 'Critical';

  if (feasibilityRatio < 1.1) return 'Critical';
  if (feasibilityRatio < 1.5) return 'At risk';

  if (paceRatio > 1.25) return 'Critical';
  if (paceRatio > 0.8) return 'At risk';

  return 'On track';
}

function updateCompletionItem(item, { completedPercent, remainingCount, status }) {
  const percentageNode = item.querySelector('.fs-completionSegment-percentage-data');
  const quotaValueNode = item.querySelector('.fs-inputGroup-quota-value');

  if (percentageNode) {
    percentageNode.textContent = completedPercent;
  }

  if (quotaValueNode) {
    quotaValueNode.textContent = remainingCount;
  }

  applyItemStatus(item, status);
  toggleExcludedPercentageDisplay(item, status);
  renderStatusBadge(item, status);
}

function applyItemStatus(item, status) {
  item.dataset.status = slugifyStatus(status);
}

function toggleExcludedPercentageDisplay(item, status) {
  const percentageWrapper = item.querySelector('.fs-completionSegment-percentage-wrapper');
  if (!percentageWrapper) return;

  if (status === 'Excluded') {
    percentageWrapper.innerHTML = '';
  }
}

function renderStatusBadge(item, status) {
  const badge = item.querySelector('.fs-completionSegment-status-wrapper .fs-badge');
  if (!badge) return;

  badge.textContent = status;
  //badge.dataset.status = slugifyStatus(status);
  badge.setAttribute('aria-label', `Status: ${status}`);
}

function slugifyStatus(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
}