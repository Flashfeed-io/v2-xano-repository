// Load Toastify CSS
const loadToastifyCSS = () => {
  if (!document.querySelector('link[href*="toastify"]')) {
    const toastifyCss = document.createElement('link');
    toastifyCss.rel = 'stylesheet';
    toastifyCss.href = 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css';
    document.head.appendChild(toastifyCss);
  }
};

// Load Toastify JS
const loadToastifyJS = async () => {
  if (!window.Toastify) {
    await import('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.js');
  }
  return window.Toastify;
};

// Initialize Toastify
const initToastify = async () => {
  loadToastifyCSS();
  await loadToastifyJS();
};

// Toast configuration defaults
const defaultConfig = {
  duration: 3000,
  gravity: "top",
  position: "center",
  stopOnFocus: true,
  className: "cc_sonner-toast",
  escapeMarkup: false,
  onClick: () => {  // Use an arrow function
    console.log("onClick context:", this); // Log the context of 'this'
    if (toast.hideToast) {  // Access the toast instance directly
        toast.hideToast();
    } else {
        console.error("hideToast is not a function");
    }
  },
  offset: {
    x: 0,
    y: 16
  },
  oldestFirst: true
};

// Toast types with their specific configurations
const toastTypes = {
  success: {
    style: {
      background: "#F0FDF4",
      color: "#16A34A",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.08)",
      border: "1px solid rgba(22, 163, 74, 0.1)",
      cursor: "pointer"
    },
    text: (message) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM6.4 12L2.4 8L3.528 6.872L6.4 9.736L12.472 3.664L13.6 4.8L6.4 12Z" fill="#16A34A"/>
    </svg>${message}`
  },
  error: {
    style: {
      background: "#FEF2F2",
      color: "#DC2626",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.06)",
      border: "1px solid rgba(220, 38, 38, 0.1)",
      cursor: "pointer"
    },
    text: (message) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V10.4H8.8V12ZM8.8 8.8H7.2V4H8.8V8.8Z" fill="#DC2626"/>
    </svg>${message}`
  },
  info: {
    style: {
      background: "#FFFFFF",
      color: "#6B7280",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      cursor: "pointer"
    },
    text: (message) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V6.4H8.8V12ZM8.8 4.8H7.2V3.2H8.8V4.8Z" fill="#6B7280"/>
    </svg>${message}`
  },
  warning: {
    style: {
      background: "#FFFFFF",
      color: "#F59E0B",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.06)",
      border: "1px solid rgba(245, 158, 11, 0.1)",
      cursor: "pointer"
    },
    text: (message) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V6.4H8.8V12ZM8.8 4.8H7.2V3.2H8.8V4.8Z" fill="#F59E0B"/>
    </svg>${message}`
  }
};

// Toast manager class
class ToastManager {
  constructor() {
    this.initialized = false;
    this.currentToast = null; // Store the current toast instance
  }

  async init() {
    if (!this.initialized) {
      await initToastify();
      this.initialized = true;
    }
  }

  async show(message, type = 'info', customConfig = {}) {
    await this.init();

    if (!window.Toastify) {
      console.error('Toastify not loaded');
      return;
    }

    const config = {
      ...defaultConfig,
      ...toastTypes[type],
      ...customConfig,
      text: toastTypes[type].text(message),
      onClose: () => {
        this.currentToast = null; // Clear the reference when toast is closed
      }
    };

    this.currentToast = window.Toastify(config).showToast(); // Store the toast instance
  }

  async hideToast() {
    console.log("hideToast called"); // Log when hideToast is called
    if (this.currentToast) {
      console.log("Hiding toast:", this.currentToast); // Log the current toast instance
      this.currentToast.hideToast(); // Call hideToast on the current instance
      this.currentToast = null; // Clear the reference
    } else {
      console.log("No current toast to hide"); // Log if there is no toast to hide
    }
  }

  // Convenience methods for different toast types
  async success(message, config = {}) {
    return this.show(message, 'success', config);
  }

  async error(message, config = {}) {
    return this.show(message, 'error', config);
  }

  async info(message, config = {}) {
    return this.show(message, 'info', config);
  }

  async warning(message, config = {}) {
    return this.show(message, 'warning', config);
  }
}

// Create and export a singleton instance
const toast = new ToastManager();

// Export for use in other files
export { toast };

// Add to window for global access
window.toast = toast;
