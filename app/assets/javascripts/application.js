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

  // Significant changes project list – search, Project owner filter, pagination
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
      return normalizeOfficerName(assignedBlock.textContent.replace(/Project owner:/i, ''));
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

    function normalizeProposedDecisionDate(value) {
      const text = (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (!text || text === 'unconfirmed') {
        return 'unconfirmed';
      }

      // Already in filter form, e.g. "jan 26"
      if (/^[a-z]{3} \d{2}$/.test(text)) {
        return text;
      }

      const monthMap = {
        january: 'jan',
        february: 'feb',
        march: 'mar',
        april: 'apr',
        may: 'may',
        june: 'jun',
        july: 'jul',
        august: 'aug',
        september: 'sep',
        october: 'oct',
        november: 'nov',
        december: 'dec'
      };

      const match = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i);
      if (!match) {
        return text;
      }

      return monthMap[match[1].toLowerCase()] + ' ' + match[2].slice(-2);
    }

    function getRowProposedDecisionDate(row) {
      const dateBlock = row.querySelector('[id^="proposed-decision-date-"]');
      if (!dateBlock) {
        return '';
      }
      if (dateBlock.querySelector('.empty')) {
        return 'unconfirmed';
      }
      const span = dateBlock.querySelector('span');
      const raw = span ? span.textContent : dateBlock.textContent.replace(/Proposed decision date:/i, '');
      return normalizeProposedDecisionDate(raw);
    }

    function getRowRegion(row) {
      const regionBlock = row.querySelector('[id^="region-"]');
      if (!regionBlock) {
        return '';
      }
      const span = regionBlock.querySelector('span');
      return (span ? span.textContent : regionBlock.textContent.replace(/Region:/i, ''))
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    }

    function getRowLocalAuthority(row) {
      const laBlock = row.querySelector('[id^="local-authority-"]');
      if (!laBlock) {
        return '';
      }
      const span = laBlock.querySelector('span');
      return (span ? span.textContent : laBlock.textContent.replace(/Local authority:/i, ''))
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
      const selectedRegions = Array.from(
        document.querySelectorAll('input[name="selectedRegions"]:checked')
      ).map(function(input) {
        return input.value.toLowerCase().replace(/\s+/g, ' ').trim();
      });
      const selectedLocalAuthorities = Array.from(
        document.querySelectorAll('input[name="selectedLocalAuthorities"]:checked')
      ).map(function(input) {
        return input.value.toLowerCase().replace(/\s+/g, ' ').trim();
      });
      const selectedTiers = Array.from(
        document.querySelectorAll('input[name="selectedTiers"]:checked')
      ).map(function(input) {
        return input.value.trim();
      });
      const selectedProposedDecisionDates = Array.from(
        document.querySelectorAll('input[name="SelectedProposedDecisionDates"]:checked')
      ).map(function(input) {
        return normalizeProposedDecisionDate(input.value);
      });

      return projectRows.filter(function(row) {
        const searchText = getRowSearchText(row);
        const matchesSearch = !query || searchText.includes(query);
        const rowOfficer = getRowAssignedOfficer(row);
        const matchesOfficer = !selectedOfficers.length || selectedOfficers.indexOf(rowOfficer) !== -1;
        const rowRegion = getRowRegion(row);
        const matchesRegion = !selectedRegions.length || selectedRegions.indexOf(rowRegion) !== -1;
        const rowLocalAuthority = getRowLocalAuthority(row);
        const matchesLocalAuthority = !selectedLocalAuthorities.length || selectedLocalAuthorities.indexOf(rowLocalAuthority) !== -1;
        const rowTier = getRowTier(row);
        const matchesTier = !selectedTiers.length || selectedTiers.indexOf(rowTier) !== -1;
        const rowProposedDecisionDate = getRowProposedDecisionDate(row);
        const matchesProposedDecisionDate = !selectedProposedDecisionDates.length || selectedProposedDecisionDates.indexOf(rowProposedDecisionDate) !== -1;
        return matchesSearch && matchesOfficer && matchesRegion && matchesLocalAuthority && matchesTier && matchesProposedDecisionDate;
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

    const selectedFiltersPanel = document.getElementById('project-selected-filters');
    const selectedFiltersList = document.getElementById('project-selected-filters-list');
    const filteredBanner = document.getElementById('projects-filtered-banner');

    function showFilteredBanner() {
      if (!filteredBanner) {
        return;
      }
      filteredBanner.hidden = false;
      window.scrollTo(0, 0);
    }

    function hideFilteredBanner() {
      if (filteredBanner) {
        filteredBanner.hidden = true;
      }
    }

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    function slugifyFilterLabel(value) {
      return (value || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }

    function getCheckedFilterItems(name) {
      return Array.from(document.querySelectorAll('input[name="' + name + '"]:checked')).map(function(input) {
        const label = filterForm.querySelector('label[for="' + input.id + '"]');
        return {
          id: input.id,
          value: input.value,
          label: label ? label.textContent.replace(/\s+/g, ' ').trim() : input.value
        };
      });
    }

    function getFilterStateFromForm() {
      return {
        title: projectSearchInput ? projectSearchInput.value.trim() : '',
        officers: getCheckedFilterItems('selectedOfficers'),
        regions: getCheckedFilterItems('selectedRegions'),
        localAuthorities: getCheckedFilterItems('selectedLocalAuthorities'),
        tiers: getCheckedFilterItems('selectedTiers'),
        proposedDecisionDates: getCheckedFilterItems('SelectedProposedDecisionDates'),
        statuses: getCheckedFilterItems('selectedStatuses')
      };
    }

    function filterStateHasValues(state) {
      return !!(
        state.title ||
        state.officers.length ||
        state.regions.length ||
        state.localAuthorities.length ||
        state.tiers.length ||
        state.proposedDecisionDates.length ||
        state.statuses.length
      );
    }

    function buildFilterUrl(state, showBanner) {
      const params = new URLSearchParams();

      if (state.title) {
        params.set('Title', state.title);
      }

      state.officers.forEach(function(item) {
        params.append('selectedOfficers', item.value);
      });
      state.regions.forEach(function(item) {
        params.append('selectedRegions', item.value);
      });
      state.localAuthorities.forEach(function(item) {
        params.append('selectedLocalAuthorities', item.value);
      });
      state.tiers.forEach(function(item) {
        params.append('selectedTiers', item.value);
      });
      state.proposedDecisionDates.forEach(function(item) {
        params.append('SelectedProposedDecisionDates', item.value);
      });
      state.statuses.forEach(function(item) {
        params.append('selectedStatuses', item.value);
      });

      if (showBanner && filterStateHasValues(state)) {
        params.set('filtered', '1');
      }

      const query = params.toString();
      return window.location.pathname + (query ? '?' + query : '');
    }

    function setCheckedValues(name, values) {
      Array.from(document.querySelectorAll('input[name="' + name + '"]')).forEach(function(input) {
        input.checked = values.indexOf(input.value) !== -1;
      });
    }

    function restoreFiltersFromUrl() {
      const params = new URLSearchParams(window.location.search);

      if (projectSearchInput) {
        projectSearchInput.value = params.get('Title') || '';
      }

      setCheckedValues('selectedOfficers', params.getAll('selectedOfficers'));
      setCheckedValues('selectedRegions', params.getAll('selectedRegions'));
      setCheckedValues('selectedLocalAuthorities', params.getAll('selectedLocalAuthorities'));
      setCheckedValues('selectedTiers', params.getAll('selectedTiers'));
      setCheckedValues('SelectedProposedDecisionDates', params.getAll('SelectedProposedDecisionDates'));
      setCheckedValues('selectedStatuses', params.getAll('selectedStatuses'));

      return params.get('filtered') === '1';
    }

    function stateWithoutFilter(state, removeValue) {
      const nextState = {
        title: state.title,
        officers: state.officers.slice(),
        regions: state.regions.slice(),
        localAuthorities: state.localAuthorities.slice(),
        tiers: state.tiers.slice(),
        proposedDecisionDates: state.proposedDecisionDates.slice(),
        statuses: state.statuses.slice()
      };

      if (removeValue === 'search') {
        nextState.title = '';
        return nextState;
      }

      nextState.officers = nextState.officers.filter(function(item) { return item.id !== removeValue; });
      nextState.regions = nextState.regions.filter(function(item) { return item.id !== removeValue; });
      nextState.localAuthorities = nextState.localAuthorities.filter(function(item) { return item.id !== removeValue; });
      nextState.tiers = nextState.tiers.filter(function(item) { return item.id !== removeValue; });
      nextState.proposedDecisionDates = nextState.proposedDecisionDates.filter(function(item) { return item.id !== removeValue; });
      nextState.statuses = nextState.statuses.filter(function(item) { return item.id !== removeValue; });
      return nextState;
    }

    function renderSelectedFilters() {
      if (!selectedFiltersPanel || !selectedFiltersList || !filterForm) {
        return;
      }

      const state = getFilterStateFromForm();
      const groups = [];

      if (state.title) {
        groups.push({
          heading: 'Search',
          items: [{
            removeValue: 'search',
            display: slugifyFilterLabel(state.title) || state.title,
            href: buildFilterUrl(stateWithoutFilter(state, 'search'), true)
          }]
        });
      }

      [
        { heading: 'Project owner', items: state.officers },
        { heading: 'Region', items: state.regions },
        { heading: 'Local authority', items: state.localAuthorities },
        { heading: 'Tier', items: state.tiers },
        { heading: 'Proposed decision date', items: state.proposedDecisionDates },
        { heading: 'Project status', items: state.statuses }
      ].forEach(function(group) {
        if (!group.items.length) {
          return;
        }
        groups.push({
          heading: group.heading,
          items: group.items.map(function(item) {
            return {
              removeValue: item.id,
              display: slugifyFilterLabel(item.label),
              href: buildFilterUrl(stateWithoutFilter(state, item.id), true)
            };
          })
        });
      });

      if (!groups.length) {
        selectedFiltersPanel.hidden = true;
        selectedFiltersList.innerHTML = '';
        return;
      }

      selectedFiltersPanel.hidden = false;
      selectedFiltersList.innerHTML = groups.map(function(group) {
        const tags = group.items.map(function(item) {
          return '<li>' +
            '<a class="moj-filter__tag" href="' + item.href + '" data-remove-filter="' + item.removeValue + '">' +
            '<span class="govuk-visually-hidden">Remove this filter</span> ' +
            item.display +
            ' <span class="moj-filter__tag-close" aria-hidden="true">×</span>' +
            '</a>' +
            '</li>';
        }).join('');

        return '<h3 class="govuk-heading-s govuk-!-margin-bottom-0">' + group.heading + '</h3>' +
          '<ul class="moj-filter-tags">' + tags + '</ul>';
      }).join('');
    }

    function reloadWithCurrentFilters(showBanner) {
      window.location.href = buildFilterUrl(getFilterStateFromForm(), showBanner);
    }

    function applyProjectSearchFilter(options) {
      const showBanner = !!(options && options.showBanner);
      reloadWithCurrentFilters(showBanner);
    }

    function clearProjectFilters(e) {
      if (e) {
        e.preventDefault();
      }
      window.location.href = window.location.pathname;
    }

    if (filterForm) {
      filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        applyProjectSearchFilter({ showBanner: true });
      });

      filterForm.addEventListener('click', function(e) {
        const applyButton = e.target.closest('[data-cy="select-projectlist-filter-apply"]');
        const clearLink = e.target.closest('[data-cy="select-projectlist-filter-clear"]');

        if (applyButton) {
          e.preventDefault();
          applyProjectSearchFilter({ showBanner: true });
        }

        if (clearLink) {
          clearProjectFilters(e);
        }
      });
    }

    const filterRoot = document.querySelector('.moj-filter');
    if (filterRoot) {
      filterRoot.addEventListener('click', function(e) {
        const clearLink = e.target.closest('[data-cy="select-projectlist-filter-clear"]');
        const removeTag = e.target.closest('[data-remove-filter]');

        if (clearLink && filterForm && !filterForm.contains(clearLink)) {
          clearProjectFilters(e);
          return;
        }

        if (removeTag) {
          // Allow normal navigation to the tag href so the page reloads with updated filters
          return;
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

    const showBannerFromUrl = restoreFiltersFromUrl();
    renderProjectList();
    renderSelectedFilters();
    if (showBannerFromUrl) {
      showFilteredBanner();
    } else {
      window.scrollTo(0, 0);
    }
  }

  // Filter checkbox lists by typing (Project owner, Region, Tier, etc.)
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
