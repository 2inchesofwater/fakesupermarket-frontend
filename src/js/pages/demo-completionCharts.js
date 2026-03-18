document.addEventListener('DOMContentLoaded', () => {
  const completionGroups = document.querySelectorAll('.fs-completionGroup');

  completionGroups.forEach((group) => {
    updateCompletionGroupChartHeights(group);
    updateCompletionGroupChartStatuses(group);
  });
});

function updateCompletionGroupChartHeights(groupElement) {
  const chartElement = groupElement.querySelector('.fs-completionGroup-chart');
  if (!chartElement) return;

  const chartItems = Array.from(
    chartElement.querySelectorAll('.fs-completionGroup-chart-item-height')
  );
  if (!chartItems.length) return;

  const targetCounts = chartItems
    .map((item) => {
      const progressElement = item.querySelector('progress');
      return Number(progressElement?.getAttribute('max'));
    })
    .filter((count) => Number.isFinite(count) && count >= 0);

  const largestTargetCount = Math.max(...targetCounts);
  if (!largestTargetCount) return;

  const localMaxElement = groupElement.querySelector(
    '.fs-completionGroup-chart-localmax'
  );
  if (localMaxElement) {
    localMaxElement.textContent = largestTargetCount;
    localMaxElement.setAttribute(
      'aria-label',
      `Target: ${largestTargetCount} completions`
    );
  }

  chartItems.forEach((item) => {
    const progressElement = item.querySelector('progress');
    const targetCount = Number(progressElement?.getAttribute('max'));

    if (!Number.isFinite(targetCount) || targetCount < 0) return;

    const normalisedHeight = (targetCount / largestTargetCount) * 100;
    item.style.height = `${normalisedHeight}%`;

    const completedCount = Number(progressElement?.getAttribute('value'));
    if (!Number.isFinite(completedCount) || completedCount < 0) return;

    const fallbackTextElement = progressElement?.querySelector(
      '.progress-bar span'
    );
    if (!fallbackTextElement) return;

    const completionPercentage = (completedCount / targetCount) * 100;
    fallbackTextElement.textContent = `Progress: ${Math.round(
      completionPercentage
    )}%`;
  });
}

function updateCompletionGroupChartStatuses(groupElement) {
  const completionItems = Array.from(
    groupElement.querySelectorAll('.fs-completionGroup-item[data-item-id]')
  );

  const chartItems = Array.from(
    groupElement.querySelectorAll('.fs-completionGroup-chart-item[data-item-id]')
  );

  chartItems.forEach((chartItem) => {
    const itemId = chartItem.dataset.itemId;
    const matchingCompletionItem = completionItems.find(
      (item) => item.dataset.itemId === itemId
    );

    if (!matchingCompletionItem) return;

    const status = matchingCompletionItem.dataset.status;
    if (!status) return;

    chartItem.dataset.status = status;
  });
}