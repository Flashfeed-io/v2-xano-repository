// Custom Dropdown Implementation
export const initCustomDropdown = () => {
  console.log('[DEBUG] Starting custom dropdown initialization');
  
  // Get DOM elements
  const dropdownButtonWrap = document.querySelector('[cc_data="dropdown-button-wrap"]');
  const dropdownButton = document.querySelector('[cc_data="dropdown-button"]');
  const dropdownList = document.querySelector('.cc_option-dropdown__list-custom');
  const filterTabs = document.querySelectorAll('.ad-library_filter-tab');

  // Debug element existence and classes
  console.log('[DEBUG] Dropdown elements found:', {
    buttonWrap: {
      exists: !!dropdownButtonWrap,
      classes: dropdownButtonWrap?.classList?.toString(),
      html: dropdownButtonWrap?.outerHTML
    },
    button: {
      exists: !!dropdownButton,
      classes: dropdownButton?.classList?.toString(),
      html: dropdownButton?.outerHTML
    },
    list: {
      exists: !!dropdownList,
      classes: dropdownList?.classList?.toString(),
      html: dropdownList?.outerHTML
    },
    filterTabs: {
      count: filterTabs.length,
      classes: Array.from(filterTabs).map(tab => tab.classList.toString())
    }
  });

  if (!dropdownButtonWrap || !dropdownButton || !dropdownList) {
    console.warn('[DEBUG] Custom dropdown elements not found');
    return;
  }

  // Toggle dropdown visibility
  const toggleDropdown = (show) => {
    console.log('[DEBUG] Toggling dropdown:', show);
    console.log('[DEBUG] Current classes:', {
      list: dropdownList.classList.toString(),
      buttonWrap: dropdownButtonWrap.classList.toString()
    });
    
    if (show === undefined) {
      dropdownList.classList.toggle('cc_is--active');
      dropdownButtonWrap.classList.toggle('cc_is--active');
    } else {
      if (show) {
        dropdownList.classList.add('cc_is--active');
        dropdownButtonWrap.classList.add('is--active');
      } else {
        dropdownList.classList.remove('cc_is--active');
        dropdownButtonWrap.classList.remove('cc_is--active');
      }
    }

    console.log('[DEBUG] Classes after toggle:', {
      list: dropdownList.classList.toString(),
      buttonWrap: dropdownButtonWrap.classList.toString()
    });
  };

  // Handle dropdown button click
  dropdownButton.addEventListener('click', (e) => {
    console.log('[DEBUG] Dropdown button clicked');
    e.stopPropagation();
    toggleDropdown();
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownButtonWrap.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  // Handle filter tab selection
  filterTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      console.log('[DEBUG] Filter tab clicked:', index);
      // Update active tab styling
      filterTabs.forEach(t => t.classList.remove('is--cc_active'));
      tab.classList.add('is--cc_active');
    });
  });

  console.log('[DEBUG] Custom dropdown initialization complete');
};
