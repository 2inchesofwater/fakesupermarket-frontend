document.addEventListener('DOMContentLoaded', () => {
  const completionGroups = Array.from(document.querySelectorAll('.fs-completionGroup'));

  completionGroups.forEach((group) => {
    const pairedTriggers = Array.from(
      group.querySelectorAll('.fs-completionGroup-item, .fs-completionGroup-chart-item')
    );

    const setPairedState = (itemId, isActive) => {
      if (!itemId) return;

      const pairedItems = group.querySelectorAll(`[data-item-id="${itemId}"]`);

      pairedItems.forEach((item) => {
        item.classList.toggle('isPaired-active', isActive);
      });
    };

    pairedTriggers.forEach((item) => {
      const itemId = item.dataset.itemId;
      if (!itemId) return;

      item.addEventListener('pointerenter', () => {
        setPairedState(itemId, true);
      });

      item.addEventListener('pointerleave', () => {
        setPairedState(itemId, false);
      });

      item.addEventListener('focusin', () => {
        setPairedState(itemId, true);
      });

      item.addEventListener('focusout', () => {
        setPairedState(itemId, false);
      });
    });
  });
});