// Custom Dropdown Implementation
export const initCustomDropdown = () => {
  console.log('[DEBUG] Starting custom dropdown initialization');
  
  // Wait for a short moment to ensure DOM elements are ready
  setTimeout(() => {
    // Get ALL dropdown elements
    const dropdownSets = document.querySelectorAll('[cc_data="dropdown-button"]');
    
    console.log('[DEBUG] Found dropdown sets:', dropdownSets.length);

    if (!dropdownSets.length) {
      console.warn('[DEBUG] No dropdown elements found - retrying in 500ms');
      setTimeout(initCustomDropdown, 500);  // Retry after 500ms
      return;
    }

    // Track active dropdown
    let activeDropdown = null;

    // Single document click handler for all dropdowns
    const documentClickHandler = (e) => {
      console.log('[DEBUG] Document click - Target:', e.target);
      console.log('[DEBUG] Document click - Target classes:', e.target.className);
      console.log('[DEBUG] Document click - Target parent:', e.target.parentElement);
      
      // Check if clicking on elements that should not close the dropdown
      const isInput = e.target.tagName.toLowerCase() === 'input';
      const isEditableText = e.target.classList.contains('form-field-inline-board') || 
                           e.target.classList.contains('cc_board-name') ||
                           e.target.closest('.vue-for-swipefeed-boards') !== null ||
                           e.target.closest('.cc_option-dropdown__list-custom') !== null;
      
      console.log('[DEBUG] Click target:', e.target);
      console.log('[DEBUG] Click target classes:', e.target.className);
      console.log('[DEBUG] Click target parent:', e.target.parentElement);
      console.log('[DEBUG] Closest vue-for-swipefeed-boards:', e.target.closest('.vue-for-swipefeed-boards'));
      console.log('[DEBUG] Is input:', isInput);
      console.log('[DEBUG] Is editable text:', isEditableText);
      
      const clickedInDropdown = Array.from(dropdownSets).some(button => {
        const wrap = button.closest('[cc_data="dropdown-button-wrap"]');
        const result = wrap && (wrap.contains(e.target) || isInput || isEditableText);
        console.log('[DEBUG] Clicked in dropdown:', result, 'wrap:', wrap);
        return result;
      });

      console.log('[DEBUG] Document click:', {
        target: e.target,
        isInput,
        isEditableText,
        clickedInDropdown,
        classList: e.target.classList.toString()
      });

      if (!clickedInDropdown) {
        // Close all dropdowns
        dropdownSets.forEach(button => {
          const wrap = button.closest('[cc_data="dropdown-button-wrap"]');
          const list = wrap?.querySelector('.cc_option-dropdown__list-custom');
          if (wrap && list) {
            wrap.classList.remove('cc_is--active');
            list.classList.remove('cc_is--active');
          }
        });
        activeDropdown = null;
      }
    };

    // Add single document click handler
    document.addEventListener('click', documentClickHandler);

    // Initialize each dropdown set
    dropdownSets.forEach((dropdownButton, index) => {
      // Find related elements within the closest common parent
      const dropdownButtonWrap = dropdownButton.closest('[cc_data="dropdown-button-wrap"]');
      const dropdownList = dropdownButtonWrap?.querySelector('.cc_option-dropdown__list-custom');
      
      console.log(`[DEBUG] Dropdown set ${index} elements:`, {
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
        }
      });

      if (!dropdownButtonWrap || !dropdownList) {
        console.warn(`[DEBUG] Missing elements for dropdown set ${index}`);
        return;
      }

      // Toggle dropdown visibility
      const toggleDropdown = (show) => {
        console.log(`[DEBUG] Toggling dropdown ${index}:`, show);
        
        // If we're showing this dropdown, close others
        if (show || show === undefined) {
          dropdownSets.forEach((otherButton, otherIndex) => {
            if (otherIndex !== index) {
              const otherWrap = otherButton.closest('[cc_data="dropdown-button-wrap"]');
              const otherList = otherWrap?.querySelector('.cc_option-dropdown__list-custom');
              if (otherWrap && otherList) {
                otherWrap.classList.remove('cc_is--active');
                otherList.classList.remove('cc_is--active');
              }
            }
          });
        }

        const wasActive = dropdownList.classList.contains('cc_is--active');
        
        if (show === undefined) {
          // Toggle current dropdown
          if (!wasActive) {
            dropdownList.classList.add('cc_is--active');
            dropdownButtonWrap.classList.add('cc_is--active');
            activeDropdown = index;
          } else {
            dropdownList.classList.remove('cc_is--active');
            dropdownButtonWrap.classList.remove('cc_is--active');
            activeDropdown = null;
          }
        } else {
          if (show) {
            dropdownList.classList.add('cc_is--active');
            dropdownButtonWrap.classList.add('cc_is--active');
            activeDropdown = index;
          } else {
            dropdownList.classList.remove('cc_is--active');
            dropdownButtonWrap.classList.remove('cc_is--active');
            if (activeDropdown === index) {
              activeDropdown = null;
            }
          }
        }

        console.log(`[DEBUG] Classes after toggle for dropdown ${index}:`, {
          list: dropdownList.classList.toString(),
          buttonWrap: dropdownButtonWrap.classList.toString(),
          wasActive,
          activeDropdown
        });
      };

      // Handle dropdown button click
      dropdownButton.addEventListener('click', (e) => {
        console.log(`[DEBUG] Dropdown ${index} button clicked`);
        e.preventDefault();  // Prevent any default behavior
        e.stopPropagation(); // Stop event from bubbling up
        toggleDropdown();
      });

      // Handle clicks inside the dropdown list
      dropdownList.addEventListener('click', (e) => {
        // Stop propagation for all clicks inside the dropdown list
        e.stopPropagation();
        
        // Only close if clicking a dropdown item
        const dropdownItem = e.target.closest('.cc_dropdown__list-item');
        const isEditArea = e.target.closest('.vue-for-swipefeed-boards') !== null;
        
        console.log('[DEBUG] List item clicked:', e.target);
        console.log('[DEBUG] List item classes:', e.target.className);
        console.log('[DEBUG] List item parent:', e.target.parentElement);
        
        console.log('[DEBUG] Is edit area:', isEditArea);
        
        if (dropdownItem && !isEditArea) {
          // Close dropdown after item click, unless it's in the edit area
          setTimeout(() => toggleDropdown(false), 100);
        }
      });

      // Handle text/input elements
      dropdownList.querySelectorAll('.form-field-inline-board, .cc_board-name').forEach(element => {
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('[DEBUG] Clicked board name element:', e.target);
        });
      });
    });

    console.log('[DEBUG] Custom dropdown initialization complete');
  }, 100); // Initial 100ms delay to ensure DOM is ready
};
