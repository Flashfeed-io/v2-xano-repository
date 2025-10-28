import "/node_modules/flatpickr/dist/flatpickr.min.css";
import "/src/styles/custom-datepicker.css";
import flatpickr from "flatpickr";

/**
 * Initialize a datepicker with enhanced features
 * @param {string} selector - CSS selector for the datepicker element
 * @param {Object} customOptions - Override default options
 * @param {Object} store - Store object to update on date change
 * @returns {Object} Flatpickr instance
 */
export function initDatepicker(selector = '[cc_data-datepicker="true"]', customOptions = {}, store = null) {
  console.log('🔍 Initializing datepicker with selector:', selector);
  
  // Check if elements exist
  const elements = document.querySelectorAll(selector);
  console.log('🎯 Found elements:', elements.length, elements);

  if (elements.length === 0) {
    console.warn('⚠️ No elements found with selector:', selector);
    return null;
  }

  // Get today's date and format it as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate max date (1 year from today)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const defaultOptions = {
    // Basic Settings
    dateFormat: "F j, Y",
    defaultDate: today,
    altInput: false,
    animate: true,
    
    // UX Enhancements
    allowInput: false,
    clickOpens: true,
    closeOnSelect: true,
    static: false,
    
    // Visual Settings
    showMonths: 1,
    position: "auto",
    minDate: today,
    maxDate: maxDateStr,
    monthSelectorType: "static",
    disableMobile: true,
    
    // Callbacks
    onOpen: function(selectedDates, dateStr, instance) {
      console.log('🔓 Datepicker opened', instance.element);
      instance.element.blur(); // Ensure mobile keyboard doesn't pop up
    },
    
    onChange: function(selectedDates, dateStr, instance) {
      console.log('📅 Date changed:', { selectedDates, dateStr });
      // Update store if provided - convert to YYYY-MM-DD format
      if (store?.sync && selectedDates.length > 0) {
        const isoDate = selectedDates[0].toISOString().split('T')[0];
        console.log('Updating store with date:', isoDate);
        store.sync.due_date = isoDate;
      }
      console.log('Triggering change event');
      // Trigger change event for Webflow compatibility
      instance.element.dispatchEvent(new Event('change', { bubbles: true }));
      instance.element.dispatchEvent(new Event('input', { bubbles: true }));
    },

    onReady: function(selectedDates, dateStr, instance) {
      console.log('✨ Datepicker ready on element:', instance.element);
      // Update the element's text content with formatted date
      if (selectedDates.length > 0) {
        instance.element.textContent = dateStr;
      }
    },

    onClose: function(selectedDates, dateStr, instance) {
      console.log('🔒 Datepicker closed');
    }
  };

  // Merge default options with custom options
  const options = { ...defaultOptions, ...customOptions };
  console.log('⚙️ Final options:', options);

  try {
    const instance = flatpickr(selector, options);
    console.log('✅ Datepicker initialized successfully:', instance);
    return instance;
  } catch (error) {
    console.error('❌ Error initializing datepicker:', error);
    throw error;
  }
}

/**
 * Initialize a range datepicker
 * @param {string} selector - CSS selector for the datepicker element
 * @param {Object} customOptions - Override default options
 * @returns {Object} Flatpickr instance
 */
export function initRangeDatepicker(selector, customOptions = {}) {
  console.log('🔍 Initializing range datepicker with selector:', selector);
  console.log('📋 Custom options received:', customOptions);
  return initDatepicker(selector, {
    mode: "range",
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",
    ...customOptions
  });
}

/**
 * Initialize a time-enabled datepicker
 * @param {string} selector - CSS selector for the datepicker element
 * @param {Object} customOptions - Override default options
 * @returns {Object} Flatpickr instance
 */
export function initDateTimePicker(selector, customOptions = {}) {
  console.log('🔍 Initializing datetime datepicker with selector:', selector);
  console.log('📋 Custom options received:', customOptions);
  return initDatepicker(selector, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    altFormat: "F j, Y at h:i K",
    time_24hr: false,
    ...customOptions
  });
}
