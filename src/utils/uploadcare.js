// Set public key globally
window.UPLOADCARE_PUBLIC_KEY = 'cdf8f29ff35c6292f1f0';

// Import the File Uploader dynamically
const loadFileUploader = () => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.UC) {
      resolve(window.UC);
      return;
    }

    // Add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@uploadcare/file-uploader@v1/web/uc-file-uploader-regular.min.css';
    document.head.appendChild(link);

    // Load the IIFE bundle (more compatible than ES modules)
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@uploadcare/file-uploader@v1/web/file-uploader.iife.min.js';
    script.async = true;

    script.onload = () => {
      if (window.UC) {
        // Initialize components
        window.UC.defineComponents(window.UC);
        resolve(window.UC);
      } else {
        reject(new Error('File Uploader failed to load'));
      }
    };

    script.onerror = () => reject(new Error('Failed to load File Uploader script'));
    document.head.appendChild(script);
  });
};

// Initialize File Uploader
export const initUploadcare = async (store) => {
  try {
    const UC = await loadFileUploader();

    // Get the context provider
    const ctx = document.querySelector('uc-upload-ctx-provider[ctx-name="ff-uploader"]');
    if (!ctx) {
      throw new Error('Upload context provider not found');
    }

    // Handle file selection/change
    ctx.addEventListener('change', (e) => {
      console.log('Files selected:', e.detail);
      const fileInfo = e.detail;
      if (fileInfo.cdnUrl) {
        if (store?.sync?.selectedProfile) {
          store.sync.selectedProfile.image = fileInfo.cdnUrl;
        }
      }
    });

    // Handle successful upload
    ctx.addEventListener('file-upload-success', (e) => {
      console.log('Upload completed:', e);
      const fileInfo = e.detail;
      if (fileInfo.cdnUrl) {
        if (store?.sync?.selectedProfile) {
          store.sync.selectedProfile.image = fileInfo.cdnUrl;
        }
      }
    });


    // Handle file removal
    ctx.addEventListener('file-removed', (e) => {
      console.log('File removed:', e.detail);
          store.sync.selectedProfile.image = "";
    });

    return ctx;
  } catch (error) {
    console.error('Failed to initialize File Uploader:', error);
    throw error;
  }
};