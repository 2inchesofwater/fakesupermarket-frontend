const productLibraryDataElement = document.getElementById('fs-productLibrary-data');
const productLibrary = JSON.parse(productLibraryDataElement.textContent);

const productCardTemplate = document.getElementById('fs-productCard-template');
const productLibraryList = document.querySelector('.fs-productLibrary-list');
const emptyState = document.querySelector('.fs-productLibrary-emptyState');
const resultsTitle = document.querySelector('.fs-productLibrary-resultsTitle');
const resultsCount = document.querySelector('.fs-productLibrary-resultsCount');

const collectionFilterButtons = document.querySelectorAll(
  '.fs-filterButton[data-filter-group="collections"]'
);

const filterCheckboxes = document.querySelectorAll(
  'input[name="productReality"], input[name="portfolioRelationship"], input[name="productStatus"]'
);

function renderProducts(products) {
  productLibraryList.innerHTML = '';

  if (!products.length) {
    emptyState.hidden = false;
    resultsCount.textContent = '0';
    return;
  }

  emptyState.hidden = true;
  resultsCount.textContent = products.length;

  const fragment = document.createDocumentFragment();

  for (const product of products) {
    const productCardClone = productCardTemplate.content.cloneNode(true);

    const productCardContent = productCardClone.querySelector('.fs-productCard-content');
    const productCardLink = productCardClone.querySelector('.fs-productCard-link');
    const productImage = productCardClone.querySelector('.fs-productCard-image');
    const productBrand = productCardClone.querySelector('.fs-productCard-brand');
    const productTitle = productCardClone.querySelector('.fs-productCard-title');

    productCardContent.dataset.collections = product.ugcCollections.join(' ');
    productCardContent.dataset.productReality = product.productReality;
    productCardContent.dataset.portfolioRelationship = product.portfolioRelationship;
    productCardContent.dataset.productStatus = product.productStatus;

    if (product.productUrl) {
      productCardLink.href = product.productUrl;
    }

    const productThumbnail = product.images?.[0]?.productThumbnail;

    if (productThumbnail) {
      productImage.src = '  /images/' + product.folderID + '/' + product.images[0].productThumbnail;
      productImage.alt = '';
    } else {
      productImage.remove();
    }

    productBrand.textContent = product.brandName;
    productTitle.textContent = product.productTitle;

    fragment.appendChild(productCardClone);
  }

  productLibraryList.appendChild(fragment);
}

function getActiveFilters() {
  const activeCollectionButton = document.querySelector(
    '.fs-filterButton[data-filter-group="collections"].is-active'
  );

  const checkedProductReality = Array.from(
    document.querySelectorAll('input[name="productReality"]:checked')
  ).map((input) => input.value);

  const checkedPortfolioRelationships = Array.from(
    document.querySelectorAll('input[name="portfolioRelationship"]:checked')
  ).map((input) => input.value);

  const checkedProductStatuses = Array.from(
    document.querySelectorAll('input[name="productStatus"]:checked')
  ).map((input) => input.value);

  return {
    collection: activeCollectionButton ? activeCollectionButton.dataset.filterValue : 'all',
    collectionLabel: activeCollectionButton ? activeCollectionButton.textContent.trim() : 'All',
    productReality: checkedProductReality,
    portfolioRelationship: checkedPortfolioRelationships,
    productStatus: checkedProductStatuses
  };
}

function filterProducts(products, filters) {
  return products.filter((product) => {
    const matchesCollection =
      filters.collection === 'all' ||
      product.ugcCollections.includes(filters.collection);

    const matchesProductReality =
      !filters.productReality.length ||
      filters.productReality.includes(product.productReality);

    const matchesPortfolioRelationship =
      !filters.portfolioRelationship.length ||
      filters.portfolioRelationship.includes(product.portfolioRelationship);

    const matchesProductStatus =
      !filters.productStatus.length ||
      filters.productStatus.includes(product.productStatus);

    return (
      matchesCollection &&
      matchesProductReality &&
      matchesPortfolioRelationship &&
      matchesProductStatus
    );
  });
}

function updateProductLibraryView() {
  const activeFilters = getActiveFilters();
  const filteredProducts = filterProducts(productLibrary, activeFilters);

  resultsTitle.textContent = activeFilters.collectionLabel;
  renderProducts(filteredProducts);
}

function resetCollectionFilter() {
  for (const button of collectionFilterButtons) {
    const isAllButton = button.dataset.filterValue === 'all';

    button.classList.toggle('is-active', isAllButton);
    button.setAttribute('aria-pressed', isAllButton ? 'true' : 'false');
  }
}

function bindCollectionFilterButtons() {
  for (const button of collectionFilterButtons) {
    button.addEventListener('click', () => {
      for (const otherButton of collectionFilterButtons) {
        otherButton.classList.remove('is-active');
        otherButton.setAttribute('aria-pressed', 'false');
      }

      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');

      updateProductLibraryView();
    });
  }
}

function bindFilterCheckboxes() {
  for (const checkbox of filterCheckboxes) {
    checkbox.addEventListener('change', updateProductLibraryView);
  }
}

function bindFilterReset() {
  const filterForm = document.querySelector('.fs-productLibrary-filters-form');

  if (!filterForm) {
    return;
  }

  filterForm.addEventListener('reset', () => {
    requestAnimationFrame(() => {
      resetCollectionFilter();
      updateProductLibraryView();
    });
  });
}

function initProductLibrary() {
  bindCollectionFilterButtons();
  bindFilterCheckboxes();
  bindFilterReset();
  updateProductLibraryView();
}

initProductLibrary();