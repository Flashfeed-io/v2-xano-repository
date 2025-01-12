import "/node_modules/flatpickr/dist/flatpickr.min.css";
import "/src/styles/custom-datepicker.css";
import flatpickr from "flatpickr";

/**
 * Initialize a datepicker with enhanced features
 * @param {string} selector - CSS selector for the datepicker element
 * @param {Object} customOptions - Override default options
 * @returns {Object} Flatpickr instance
 */
export function initDatepicker(selector = '[cc_data-datepicker="true"]', customOptions = {}) {
  console.log('🔍 Initializing datepicker with selector:', selector);
  
  // Check if elements exist
  const elements = document.querySelectorAll(selector);
  console.log('🎯 Found elements:', elements.length, elements);

  if (elements.length === 0) {
    console.warn('⚠️ No elements found with selector:', selector);
    return null;
  }

  const defaultOptions = {
    // Basic Settings
    dateFormat: "m/d/Y",
    defaultDate: "2025-01-12",
    altInput: true,
    altFormat: "F Y",
    animate: true,
    
    // UX Enhancements
    allowInput: true,
    clickOpens: true,
    closeOnSelect: true,
    static: true,
    
    // Visual Settings
    showMonths: 1,
    position: "auto",
    minDate: "2025-01-12",
    monthSelectorType: "static",
    
    // Callbacks
    onOpen: function(selectedDates, dateStr, instance) {
      console.log('🔓 Datepicker opened', instance.element);
      instance.element.blur(); // Ensure mobile keyboard doesn't pop up
    },
    
    onChange: function(selectedDates, dateStr, instance) {
      console.log('📅 Date changed:', { selectedDates, dateStr });
      // Update store
      if (window.store && window.store.sync) {
        window.store.sync.due_date = dateStr;
      }
      // Trigger change event for Webflow compatibility
      instance.element.dispatchEvent(new Event('change', { bubbles: true }));
      instance.element.dispatchEvent(new Event('input', { bubbles: true }));
    },

    onReady: function(selectedDates, dateStr, instance) {
      console.log('✨ Datepicker ready on element:', instance.element);
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
