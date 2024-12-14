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
  gravity: "top",
  position: "right",
  stopOnFocus: true,
  className: "sonner-toast",
  style: {
    background: "white",
    color: "rgb(51, 51, 51)",
    padding: "12px",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }
};

// Toast types with their specific configurations
const toastTypes = {
  success: {
    style: {
      background: "rgb(247, 247, 247)",
      color: "rgb(51, 51, 51)"
    }
  },
  error: {
    style: {
      background: "rgb(247, 247, 247)",
      color: "rgb(51, 51, 51)"
    }
  },
  info: {
    style: {
      background: "rgb(247, 247, 247)",
      color: "rgb(51, 51, 51)"
    }
  },
  warning: {
    style: {
      background: "rgb(247, 247, 247)",
      color: "rgb(51, 51, 51)"
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

// Add to window for global access if needed (optional)
window.toast = toast;
