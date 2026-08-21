//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here

  // DfE rebranding JS
  document.addEventListener('DOMContentLoaded', function() {
    const navigationToggle = document.getElementById('super-navigation-menu-toggle');
    const searchToggle = document.getElementById('super-search-menu-toggle');
    const navigationMenu = document.getElementById('super-navigation-menu');
    const searchMenu = document.getElementById('super-search-menu');

    // Function to close all menus and reset button states
    function closeAllMenus() {
        // Close navigation
        if (navigationToggle && navigationMenu) {
            navigationToggle.setAttribute('aria-expanded', 'false');
            navigationMenu.setAttribute('hidden', 'hidden');
            navigationToggle.classList.remove('gem-c-layout-super-navigation-header__open-button');
        }

        // Close search
        if (searchToggle && searchMenu) {
            searchToggle.setAttribute('aria-expanded', 'false');
            searchMenu.setAttribute('hidden', 'hidden');
            searchToggle.classList.remove('gem-c-layout-super-navigation-header__open-button');
        }
    }

    // Toggle navigation menu
    if (navigationToggle && navigationMenu) {
        navigationToggle.addEventListener('click', function() {
            const isExpanded = navigationToggle.getAttribute('aria-expanded') === 'true';
            const isHidden = navigationMenu.hasAttribute('hidden');

            if (isHidden) {
                // Open navigation menu
                navigationToggle.setAttribute('aria-expanded', 'true');
                navigationMenu.removeAttribute('hidden');
                navigationToggle.classList.add('gem-c-layout-super-navigation-header__open-button');

                // Close search if open
                if (searchToggle && searchMenu) {
                    searchToggle.setAttribute('aria-expanded', 'false');
                    searchMenu.setAttribute('hidden', 'hidden');
                    searchToggle.classList.remove('gem-c-layout-super-navigation-header__open-button');
                }
            } else {
                // Close navigation menu
                navigationToggle.setAttribute('aria-expanded', 'false');
                navigationMenu.setAttribute('hidden', 'hidden');
                navigationToggle.classList.remove('gem-c-layout-super-navigation-header__open-button');
            }
        });
    }

    // Toggle search panel
    if (searchToggle && searchMenu) {
        searchToggle.addEventListener('click', function() {
            const isExpanded = searchToggle.getAttribute('aria-expanded') === 'true';
            const isHidden = searchMenu.hasAttribute('hidden');

            if (isHidden) {
                // Open search menu
                searchToggle.setAttribute('aria-expanded', 'true');
                searchMenu.removeAttribute('hidden');
                searchToggle.classList.add('gem-c-layout-super-navigation-header__open-button');

                // Close navigation if open
                if (navigationToggle && navigationMenu) {
                    navigationToggle.setAttribute('aria-expanded', 'false');
                    navigationMenu.setAttribute('hidden', 'hidden');
                    navigationToggle.classList.remove('gem-c-layout-super-navigation-header__open-button');
                }
            } else {
                // Close search menu
                searchToggle.setAttribute('aria-expanded', 'false');
                searchMenu.setAttribute('hidden', 'hidden');
                searchToggle.classList.remove('gem-c-layout-super-navigation-header__open-button');
            }
        });
    }

    // Handle search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = searchForm.querySelector('.gem-c-search__input');
            if (searchInput && searchInput.value.trim()) {
                // Implement your search functionality here
                console.log('Searching for:', searchInput.value.trim());
            }
        });
    }

    // Close panels on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllMenus();
        }
    });
  });

  // Significant changes project list – search, Assigned to filter, pagination
  const projectListTable = document.querySelector('[data-cy="significant-changes-project-list"]');

  if (projectListTable) {
    const projectSearchInput = document.getElementById('Title');
    const projectRows = Array.from(document.querySelectorAll('[data-cy="select-projectlist-filter-row"]'));
    const projectCount = document.querySelector('[data-cy="select-projectlist-filter-count"]');
    const filterForm = projectSearchInput && projectSearchInput.closest('form');
    const paginationNav = document.querySelector('[data-cy="project-pagination"]');
    const paginationList = document.getElementById('project-pagination-list');
    const pageSize = Number(projectListTable.getAttribute('data-page-size')) || 10;
    let currentPage = 1;

    function normalizeOfficerName(name) {
      const value = (name || '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (!value || value === 'unassigned' || value === 'not assigned') {
        return 'not assigned';
      }
      return value;
    }

    function getRowAssignedOfficer(row) {
      const assignedBlock = row.querySelector('[id^="assigned-to-"]') || row.querySelector('.do');
      if (!assignedBlock) {
        return '';
      }
      if (assignedBlock.querySelector('.empty')) {
        return 'not assigned';
      }
      const spans = assignedBlock.querySelectorAll('span');
      for (let i = 0; i < spans.length; i++) {
        if (!spans[i].classList.contains('empty')) {
          return normalizeOfficerName(spans[i].textContent);
        }
      }
      return normalizeOfficerName(assignedBlock.textContent.replace(/Assigned to:/i, ''));
    }

    function updateProjectCount(totalCount) {
      if (!projectCount) {
        return;
      }
      const label = totalCount === 1 ? 'project' : 'projects';
      projectCount.textContent = totalCount + ' ' + label + ' found';
    }

    function getRowSearchText(row) {
      const school = row.querySelector('[id^="school-name-"]');
      const urn = row.querySelector('[id^="urn-"]');
      const trust = row.querySelector('[id^="trust-"]');
      const type = row.querySelector('[id^="route-"]');

      return [school, urn, trust, type]
        .map(function(element) {
          return element ? element.textContent : '';
        })
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    }

    function getRowTier(row) {
      const tierBlock = row.querySelector('[id^="tier-"]');
      if (!tierBlock) {
        return '';
      }
      const span = tierBlock.querySelector('span');
      return (span ? span.textContent : tierBlock.textContent.replace(/Tier:/i, ''))
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    }

    function getRowType(row) {
      const typeBlock = row.querySelector('[id^="route-"]');
      if (!typeBlock) {
        return '';
      }
      const span = typeBlock.querySelector('span');
      return (span ? span.textContent : typeBlock.textContent.replace(/Type:/i, ''))
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    }

    function getMatchingRows() {
      const query = projectSearchInput ? projectSearchInput.value.trim().toLowerCase() : '';
      const selectedOfficers = Array.from(
        document.querySelectorAll('input[name="selectedOfficers"]:checked')
      ).map(function(input) {
        return normalizeOfficerName(input.value);
      });
      const selectedTiers = Array.from(
        document.querySelectorAll('input[name="selectedTiers"]:checked')
      ).map(function(input) {
        return input.value.trim();
      });
      const selectedTypes = Array.from(
        document.querySelectorAll('input[name="selectedTypes"]:checked')
      ).map(function(input) {
        return input.value.toLowerCase().replace(/\s+/g, ' ').trim();
      });

      return projectRows.filter(function(row) {
        const searchText = getRowSearchText(row);
        const matchesSearch = !query || searchText.includes(query);
        const rowOfficer = getRowAssignedOfficer(row);
        const matchesOfficer = !selectedOfficers.length || selectedOfficers.indexOf(rowOfficer) !== -1;
        const rowTier = getRowTier(row);
        const matchesTier = !selectedTiers.length || selectedTiers.indexOf(rowTier) !== -1;
        const rowType = getRowType(row);
        const matchesType = !selectedTypes.length || selectedTypes.indexOf(rowType) !== -1;
        return matchesSearch && matchesOfficer && matchesTier && matchesType;
      });
    }

    function renderPagination(totalPages) {
      if (!paginationNav || !paginationList) {
        return;
      }

      if (totalPages <= 1) {
        paginationNav.style.display = 'none';
        paginationList.innerHTML = '';
        return;
      }

      paginationNav.style.display = '';
      let html = '';

      if (currentPage > 1) {
        html += '<li class="moj-pagination__item moj-pagination__item--prev">' +
          '<a class="moj-pagination__link" href="#" data-page="prev">Previous<span class="govuk-visually-hidden"> page</span></a>' +
          '</li>';
      }

      for (let page = 1; page <= totalPages; page++) {
        const isActive = page === currentPage;
        html += '<li class="moj-pagination__item' + (isActive ? ' moj-pagination__item--active' : '') + '">' +
          '<a class="moj-pagination__link" href="#" data-page="' + page + '"' +
          (isActive
            ? ' aria-label="Current page, page ' + page + '" aria-current="page"'
            : ' aria-label="Go to page ' + page + '"') +
          '>' + page + '</a></li>';
      }

      if (currentPage < totalPages) {
        html += '<li class="moj-pagination__item moj-pagination__item--next">' +
          '<a class="moj-pagination__link" href="#" data-page="next" test-id="nextPage">Next<span class="govuk-visually-hidden"> page</span></a>' +
          '</li>';
      }

      paginationList.innerHTML = html;
    }

    function renderProjectList() {
      const matchingRows = getMatchingRows();
      const totalPages = Math.max(1, Math.ceil(matchingRows.length / pageSize) || 1);

      if (currentPage > totalPages) {
        currentPage = totalPages;
      }
      if (currentPage < 1) {
        currentPage = 1;
      }

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;

      projectRows.forEach(function(row) {
        row.style.display = 'none';
      });

      matchingRows.forEach(function(row, index) {
        if (index >= start && index < end) {
          row.style.display = '';
          row.hidden = false;
        }
      });

      updateProjectCount(matchingRows.length);
      renderPagination(matchingRows.length === 0 ? 0 : totalPages);
    }

    function applyProjectSearchFilter() {
      currentPage = 1;
      renderProjectList();
    }

    function clearProjectFilters(e) {
      if (e) {
        e.preventDefault();
      }

      if (!filterForm) {
        return;
      }

      filterForm.querySelectorAll('input[type="text"]').forEach(function(input) {
        input.value = '';
      });

      filterForm.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
        checkbox.checked = false;
      });

      filterForm.querySelectorAll('.govuk-checkboxes__item').forEach(function(item) {
        item.style.display = '';
      });

      currentPage = 1;
      renderProjectList();
    }

    if (filterForm) {
      filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        applyProjectSearchFilter();
      });

      filterForm.addEventListener('click', function(e) {
        const applyButton = e.target.closest('[data-cy="select-projectlist-filter-apply"]');
        const clearLink = e.target.closest('[data-cy="select-projectlist-filter-clear"]');

        if (applyButton) {
          e.preventDefault();
          applyProjectSearchFilter();
        }

        if (clearLink) {
          clearProjectFilters(e);
        }
      });
    }

    if (paginationList) {
      paginationList.addEventListener('click', function(e) {
        const link = e.target.closest('a[data-page]');
        if (!link) {
          return;
        }

        e.preventDefault();
        const action = link.getAttribute('data-page');
        const matchingRows = getMatchingRows();
        const totalPages = Math.max(1, Math.ceil(matchingRows.length / pageSize) || 1);

        if (action === 'prev') {
          currentPage = Math.max(1, currentPage - 1);
        } else if (action === 'next') {
          currentPage = Math.min(totalPages, currentPage + 1);
        } else {
          const pageNumber = Number(action);
          if (!Number.isNaN(pageNumber)) {
            currentPage = Math.min(totalPages, Math.max(1, pageNumber));
          }
        }

        renderProjectList();
        if (projectCount) {
          projectCount.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    renderProjectList();
  }

  // Filter checkbox lists by typing (Assigned to, Tier, Type, etc.)
  document.querySelectorAll('.govuk-accordion__section-content .govuk-input[placeholder^="Type to filter"]').forEach(function(searchInput) {
    const checkboxItems = searchInput
      .closest('.govuk-accordion__section-content')
      .querySelectorAll('.govuk-checkboxes__item');

    searchInput.addEventListener('input', function() {
      const query = searchInput.value.trim().toLowerCase();

      checkboxItems.forEach(function(item) {
        const label = item.querySelector('label');
        const text = label ? label.textContent.toLowerCase().replace(/\s+/g, ' ').trim() : '';
        const matches = !query || text.includes(query);
        item.style.display = matches ? '' : 'none';
      });
    });
  });
  
})
