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
  duration: 4000,
  gravity: "bottom",
  position: "center",
  stopOnFocus: true,
  className: "cc_sonner-toast",
  escapeMarkup: false,
  onClick: function() { 
    this.hideToast();
  },
  style: {
    background: "white",
    color: "#222",
    padding: "16px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    margin: "8px",
    minWidth: "320px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  },
  offset: {
    x: 0,
    y: 16
  },
  oldestFirst: true,
  destination: "body"
};

// Toast types with their specific configurations
const toastTypes = {
  success: {
    style: {
      background: "white",
      color: "#222",
      borderLeft: "4px solid #10B981"
    }
  },
  error: {
    style: {
      background: "#FEF2F2",
      color: "#DC2626",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    text: (message) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM8.8 12H7.2V10.4H8.8V12ZM8.8 8.8H7.2V4H8.8V8.8Z" fill="#DC2626"/>
    </svg>${message}`
  },
  info: {
    style: {
      background: "white",
      color: "#222",
      borderLeft: "4px solid #3B82F6"
    }
  },
  warning: {
    style: {
      background: "white",
      color: "#222",
      borderLeft: "4px solid #F59E0B"
    }
  }
};

// Toast manager class
class ToastManager {
  constructor() {
    this.initialized = false;
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
      text: message
    };

    window.Toastify(config).showToast();
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
