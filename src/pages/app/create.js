import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData, logout, verifyAuth, checkAndGetToken } from "/src/utils/userData.js";
import { injectStyles } from "@/utils/injectStyles.js";
import Quill from "quill";
import { getHeaders, getCurrentXanoUrl } from '/src/utils/constants.js';
import { initUploadcare } from "/src/utils/uploadcare.js";
import { initDatepicker } from "/src/utils/datepicker.js";

/*--quill----------------------------------------------------------*/
const quillOptions = {
  theme: "snow",
  modules: {
    toolbar: [
      ["bold", "italic"], // Bold and italic
      [{ list: "ordered" }, { list: "bullet" }], // Ordered and bullet lists
    ],
  },
  // placeholder: 'This is a placeholder', // You can set a default or leave this out
};

// create quill editor
function createQuillEditor(selector, placeholderText) {
  // Clone the quillOptions to avoid mutations
  const options = { ...quillOptions, placeholder: placeholderText };
  return new Quill(selector, options);
}

const quillCustomPrompt = createQuillEditor(
  "#quillCustomPrompt",
  `e.g. Apple sells premium phones and computers. It is known for a high attention to detail, polish, and user experience. The target audience is consumers who value style and simplicity in their tech, including young adults and professionals willing to pay more for top-notch quality.`
);



/*--store----------------------------------------------------------*/
const store = reactive({
  user: {},
  token: (() => {
    console.log('All cookies:', document.cookie);
    const authCookie = document.cookie.split(';')
      .find(c => c.trim().startsWith('ff_auth='));
    return authCookie ? authCookie.split('=')[1] : '';
  })(),
  isSaving: false,
  isImporting: false,
  api: {
    profiles: [
      {
        id: "1",
        brand: "Nike",
        product: "Air Max 2024"
      },
      {
        id: "2",
        brand: "Adidas",
        product: "Ultra Boost"
      },
      {
        id: "3",
        brand: "Puma",
        product: "RS-X"
      }
    ]
  },
  sync: {
    //main
    id: "",
    title: "",
    folder_id: "",
    status: "To Do",
    due_date: new Date().toISOString().split('T')[0],
    video_budget: 0,
    description: "",
    //helpers
    helpers: {
      toggle_show_profile: false,
      toggle_generate_script: true,
      toggle_generate_action_description: true,
      toggle_generate_text_on_screen: false,
      toggle_script_language: "English",
      toggle_visibility_source_script: true,
      toggle_visibility_script: true,
      toggle_visibility_action_description: true,
      toggle_visibility_text_on_screen: false,
      toggle_visibility_seconds: true,
    },
    //profiles
    selectedProfile: {
      toogle_summary: true,
      toggle_key_highlights: true,
      id: "",
      image: "",
      brand: "",
      product: "",
      import_link: "",
      summary: "",
      key_highlights: "",
      toggle_custom_prompt: false,
      customPrompt: "",
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      linkedin: "",
      asset_files: [],
      notes: ""
    },
    //inspiration
    selectedInspiration: {
      id: "",
      script: [],
    },
    importedInspirationList: [],
    //script
    script: [],
    //copilot
    copilot: {
      virality: 0,
      direct_response: 0,
      suggestions: {}
    }
  },
});




/*--main code----------------------------------------------------------*/
//import from url
async function importFromUrl(url) {
  store.isImporting = true;
  
  try {
    const token = checkAndGetToken(store);
    if (!token) return;

    const requestUrl = `${getCurrentXanoUrl()}/import_url`;
    const requestBody = { inputUrl: url };
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[DEBUG] Error response:', errorData);
      if (response.status === 401 || response.status === 403) {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = "/login";
        return;
      }
      toast.error('Failed to import from URL: ' + (errorData.message || 'Unknown error'));
      throw new Error(errorData.message || 'Failed to import from URL');
    }

    const data = await response.json();
    console.log('[DEBUG] Success response:', data);
    return data;
  } catch (error) {
    console.error('[DEBUG] Error in importFromUrl:', error);
    toast.error('Error importing from URL: ' + error.message);
    throw error;
  } finally {
    store.isImporting = false;
  }
}


//load or new profile
async function handleProfile(action) {
  console.log('[DEBUG] Starting handleProfile with action:', action);
  
  if (action === "new") {
    try {
      const token = checkAndGetToken(store);
      if (!token) return;

      const requestUrl = `${getCurrentXanoUrl()}/profile/new`;
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[DEBUG] Error response:', errorData);
        toast.error('Failed to create new profile: ' + (errorData.message || 'Unknown error'));
        throw new Error(errorData.message || 'Failed to create new profile');
      }

      const data = await response.json();
      console.log('[DEBUG] Success response:', data);
    } catch (error) {
      console.error('[DEBUG] Error in handleProfile:', error);
      toast.error('Error handling profile: ' + error.message);
      throw error;
    }
  } else if (action === "load") {
    console.log('[DEBUG] Load profile action triggered');
  }
  store.sync.helpers.toggle_show_profile = true;
  
  const inputs = document.querySelectorAll('.cc_contenteditable-input');
  inputs.forEach(input => {
    input.classList.add('default-hover-state');
    
    const removeHoverState = () => {
      input.classList.remove('default-hover-state');
      input.removeEventListener('mouseenter', removeHoverState);
    };
    
    input.addEventListener('mouseenter', removeHoverState);
  });
}

/*--reactivity functions----------------------------------------------------------*/

//script
const calculateStartTime = () => {
  if (!store.sync.script || store.sync.script.length === 0) return 0;
  const lastSection = store.sync.script[store.sync.script.length - 1];
  return lastSection.startTime + lastSection.duration;
};

const getDefaultTitle = () => {
  return (!store.sync.script || store.sync.script.length === 0) ? "Hook" : "Body";
};

const addScriptSection = () => {
  if (!Array.isArray(store.sync.script)) {
      store.sync.script = [];
  }
  store.sync.script.push({
    copilot: "green",                 // Copilot-generated color
    title: getDefaultTitle(),         // Hook for first, Body for rest
    startTime: calculateStartTime(), // Auto-calculated from previous section
    duration: 3.0,               // Default duration in seconds
    script: "",                   // Script/dialogue content
    visualDescription: "",        // Visual description and actions
    textOnScreen: "",            // Any text overlays or captions
    viralityRatings: [],         // Array to store virality ratings
    directResponseRatings: []    // Array to store direct response ratings
  });
};

const syncGenerateToVisibility = (type, value) => {
  // If setting generate to true, also set visibility to true
  if (value === true) {
    switch(type) {
      case 'script':
        store.sync.helpers.toggle_visibility_script = true;
        break;
      case 'action':
        store.sync.helpers.toggle_visibility_action_description = true;
        break;
      case 'text':
        store.sync.helpers.toggle_visibility_text_on_screen = true;
        break;
    }
  }
};

const updateGenerateScript = (value) => {
  store.sync.helpers.toggle_generate_script = value;
  syncGenerateToVisibility('script', value);
};

const updateGenerateAction = (value) => {
  store.sync.helpers.toggle_generate_action_description = value;
  syncGenerateToVisibility('action', value);
};

const updateGenerateText = (value) => {
  store.sync.helpers.toggle_generate_text_on_screen = value;
  syncGenerateToVisibility('text', value);
};

//profiles
const addAssetFile = () => {
    store.sync.selectedProfile.asset_files.push("");
};

const removeAssetFile = (index) => {
    store.sync.selectedProfile.asset_files.splice(index, 1);
};

const initCheckboxStates = () => {
    console.log('[DEBUG] Init checkbox states');
    // Set initial checkbox states
    document.querySelectorAll('input[type="checkbox"][cc_data="startAsChecked"]').forEach(checkbox => {
        checkbox.checked = true;
        const checkboxDiv = checkbox.previousElementSibling;
        if (checkboxDiv) {
            checkboxDiv.classList.add('w--redirected-checked');
        }
        console.log('[DEBUG] Checkbox checked:', checkbox);
    });
};


quillCustomPrompt.on(
  "text-change",
  function (delta, oldDelta, source) {
    store.fields.brand_service_or_product =
      quillCustomPrompt.container.children[0].innerHTML;

    console.log(
      "Checking -> : inside textchange of brandserviceorproduct quill",
      quillCustomPrompt.container.children[0].innerHTML
    );
    // Assuming you want to count text length, not HTML length:
    const textLength = quillCustomPrompt.getText().trim().length; // trim() to remove trailing spaces/newlines

    // Calculate width based on text length (customize this logic as needed)
    let widthPercentage = Math.min(100, (textLength / 250) * 100); // Caps at 100%

    // Determine color based on text length
    let color = textLength > 250 ? "#2cc32c" : "#f56780"; // Uses hex codes for green and red

    const lengthBar = document.querySelector(
      '[cc_data="brandInformationLengthBar"]'
    );
    if (lengthBar) {
      lengthBar.style.width = widthPercentage + "%";
      lengthBar.style.backgroundColor = color;
    }
    handleWriterValidation();
  }
);

console.log(
  "Checking -> : quill editor of brandserviceorproduct",
  quillCustomPrompt
);

/*--initializers----------------------------------------------------------*/
const debugStore = StoreDebugger.init(store);

// Initial auth check
if (store.token) {
  const isAuthenticated = await verifyAuth(store);
  if (!isAuthenticated) {
    window.location.href = "/";
  }
}

await toast.init();

/*--masonry----------------------------------------------------------*/
function initMasonry() {
  console.log('[DEBUG] Render event - Start');
  const hitsList = document.querySelector(".webflow-hits-list");
  if (!hitsList) {
    console.error('[DEBUG] Hits list container not found');
    return;
  }

  // Wait for all videos to load
  const videos = hitsList.querySelectorAll('video');
  Promise.all(Array.from(videos).map(video => {
    return new Promise((resolve) => {
      if (video.readyState >= 3) {
        resolve();
      } else {
        video.addEventListener('loadeddata', () => resolve());
      }
    });
  })).then(() => {
    const masonry = new Masonry(hitsList, {
      itemSelector: ".webflow-hit-item",
      percentPosition: true,
      columnWidth: ".webflow-hit-item",
      horizontalOrder: true,
      initLayout: true
    });
    
    // Force layout update
    setTimeout(() => {
      masonry.layout();
    }, 100);
    
    return masonry;
  });
}

/*--mount----------------------------------------------------------*/
const app = createApp({
  store,
  editableContent: '',
  
  updateContent(event) {
    console.log('Content updated:', event.target.textContent);
    this.editableContent = event.target.textContent;
  },
  
  WebflowFormComponent(props) {
    return WebflowFormComponent({
      ...props,
      store,
      fields: store.fields,
      requiresAuth: false
    });
  },
  async getUserData() {
    return getUserData(store);
  },
  logout() {
    return logout(store);
  },
  debugStore,
  handleStatusClick(status) {
    console.log('Previous status:', store.sync.status);
    Object.assign(store.sync, { status });
    console.log('Status clicked:', status);
    console.log('New status:', store.sync.status);
    console.log('Full sync object:', store.sync);
  },
  handleContentEditable($el) {
    console.log('handleContentEditable called');
    if (!$el) return;
    
    // Only set up the input listener once
    if (!$el._effectSetup) {
      $el._effectSetup = true;
      $el.addEventListener('input', (e) => {
        if (this.store.sync.selectedProfile) {
          this.store.sync.selectedProfile.brand = e.target.textContent;
        }
      });
    }

    // Sync from store to element (like v-model)
    $el.textContent = this.store.sync.selectedProfile?.brand || '';
  },
  mounted() {
    // Initialize Uploadcare with proper configuration
    initUploadcare({
      contextName: 'create-attachments',
      multiple: true,
      selector: '[role="uploadcare-uploader"]',
      onUpload: (fileInfo) => {
        console.log('Upload completed:', fileInfo);
        if (fileInfo?.cdnUrl) {
          store.fields.attachments = fileInfo.cdnUrl;
        }
      }
    }).catch(error => {
      console.error('Uploadcare initialization failed:', error);
      toast.error('Failed to initialize file uploader');
    });

    // Initialize masonry
    injectStyles();
    initMasonry();

    initCheckboxStates();
    setTimeout(() => {
      const elements = document.querySelectorAll('[cc_data-datepicker="true"]');
      console.log('🔍 About to initialize datepicker');
      console.log('Found elements:', elements);
      
      if (elements.length > 0) {
        initDatepicker('[cc_data-datepicker="true"]', {
          dateFormat: "m/d/Y",
          altFormat: "m/d/Y",
          allowInput: true,
          clickOpens: true,
          static: true
        });
      } else {
        console.warn('No datepicker elements found');
      }
    }, 0);
  },
  addAssetFile,
  removeAssetFile,
  addScriptSection,
  updateGenerateScript,
  updateGenerateAction,
  updateGenerateText,
  importFromUrl,
  handleProfile,
});

export { app };