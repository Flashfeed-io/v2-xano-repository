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

    // Add config element if it doesn't exist
    let config = document.querySelector('uc-config[ctx-name="ff-uploader"]');
    if (!config) {
      config = document.createElement('uc-config');
      config.setAttribute('ctx-name', 'ff-uploader');
      config.setAttribute('pubkey', 'cdf8f29ff35c6292f1f0');
      config.setAttribute('multiple', 'false');
      config.setAttribute('accept', 'image/*');
      document.body.appendChild(config);
    }

    // Create or get uploader element
    let uploader = document.querySelector('uc-file-uploader-regular[ctx-name="ff-uploader"]');
    if (!uploader) {
      uploader = document.createElement('uc-file-uploader-regular');
      uploader.setAttribute('ctx-name', 'ff-uploader');
      
      // Replace old uploader if it exists
      const oldUploader = document.querySelector('[role="uploadcare-uploader"]');
      if (oldUploader) {
        oldUploader.parentNode.replaceChild(uploader, oldUploader);
      }
    }

    // Handle file upload events
    uploader.addEventListener('change', (e) => {
      console.log('Change event:', e);
      const fileInfo = e.detail;
      if (fileInfo?.cdnUrl) {
        store.sync.selectedProfile.image = fileInfo.cdnUrl;
      }
    });

    // Handle successful uploads (both from computer and URL)
    uploader.addEventListener('common-upload-success', (e) => {
      console.log('Upload success:', e);
      const files = e.detail.successEntries;
      if (files && files.length > 0) {
        const fileInfo = files[0];
        if (fileInfo?.cdnUrl) {
          store.sync.selectedProfile.image = fileInfo.cdnUrl;
        }
      }
    });

    // Handle URL changes (for transformations)
    uploader.addEventListener('file-url-changed', (e) => {
      console.log('URL changed:', e);
      const fileInfo = e.detail;
      if (fileInfo?.cdnUrl) {
        if (store.fields) {
          store.fields.attachments = fileInfo.cdnUrl;
        } else {
          store.attachments = fileInfo.cdnUrl;
        }
      }
    });

    return uploader;
  } catch (error) {
    console.error('Failed to initialize File Uploader:', error);
    throw error;
  }
};
