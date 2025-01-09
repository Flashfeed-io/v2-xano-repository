import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData, logout, verifyAuth, checkAndGetToken } from "/src/utils/userData.js";
import { injectStyles } from "@/utils/injectStyles.js";
import Quill from "quill";
import { getHeaders, getCurrentBaseUrl } from '/src/utils/constants.js';

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

// Function to create a new Quill editor with a custom placeholder
function createQuillEditor(selector, placeholderText) {
  // Clone the quillOptions to avoid mutations
  const options = { ...quillOptions, placeholder: placeholderText };
  return new Quill(selector, options);
}

const editorBrandServiceOrProduct = createQuillEditor(
  "#editorBrandServiceOrProduct",
  `e.g. Apple sells premium phones and computers. It is known for a high attention to detail, polish, and user experience. The target audience is consumers who value style and simplicity in their tech, including young adults and professionals willing to pay more for top-notch quality.`
);

console.log(
  "Checking -> : quill editor of brandserviceorproduct at top",
  editorBrandServiceOrProduct
);


/*--main code----------------------------------------------------------*/
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
      script: {},
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

async function importFromUrl(url) {
  store.isImporting = true;
  console.log('[DEBUG] Starting importFromUrl with URL:', url);
  
  try {
    const token = checkAndGetToken(store);
    if (!token) return;

    const requestUrl = `${getCurrentBaseUrl()}/import_url`;
    const requestBody = { inputUrl: url };
    console.log('[DEBUG] Making request to:', requestUrl);
    console.log('[DEBUG] Request body:', requestBody);
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(requestBody)
    });

    console.log('[DEBUG] Response status:', response.status);
    console.log('[DEBUG] Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[DEBUG] Error response:', errorData);
      if (response.status === 401 || response.status === 403) {
        alert('Your session has expired. Please log in again.');
        window.location.href = "/login";
        return;
      }
      alert('Failed to import from URL: ' + (errorData.message || 'Unknown error'));
      throw new Error(errorData.message || 'Failed to import from URL');
    }

    const data = await response.json();
    console.log('[DEBUG] Success response:', data);
    return data;
  } catch (error) {
    console.error('[DEBUG] Error in importFromUrl:', error);
    alert('Error importing from URL: ' + error.message);
    throw error;
  } finally {
    store.isImporting = false;
  }
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


editorBrandServiceOrProduct.on(
  "text-change",
  function (delta, oldDelta, source) {
    store.fields.brand_service_or_product =
      editorBrandServiceOrProduct.container.children[0].innerHTML;

    console.log(
      "Checking -> : inside textchange of brandserviceorproduct quill",
      editorBrandServiceOrProduct.container.children[0].innerHTML
    );
    // Assuming you want to count text length, not HTML length:
    const textLength = editorBrandServiceOrProduct.getText().trim().length; // trim() to remove trailing spaces/newlines

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
  editorBrandServiceOrProduct
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
  WebflowFormComponent(props) {
    return WebflowFormComponent({
      ...props,
      store,
      fields: store.fields,
      requiresAuth: true
    });
  },
  async getUserData() {
    return getUserData(store);
  },
  logout() {
    return logout(store);
  },
  debugStore,
  mounted() {
    // Initialize masonry
    injectStyles();
    initMasonry();
    // Initialize checkbox states
    initCheckboxStates();
  },
  addAssetFile,
  removeAssetFile,
  addScriptSection,
  updateGenerateScript,
  updateGenerateAction,
  updateGenerateText,
  importFromUrl
});

export { app };