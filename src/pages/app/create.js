import { createApp, reactive } from "petite-vue";
import { effect } from "@vue/reactivity";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData, logout, verifyAuth, checkAndGetToken } from "/src/utils/userData.js";
import { injectStyles } from "@/utils/injectStyles.js";
import Quill from "quill";
import { getHeaders } from '/src/utils/constants.js';
import { initUploadcare } from "/src/utils/uploadcare.js";
import { initDatepicker } from "/src/utils/datepicker.js";
import { initCleave } from "/src/utils/cleave.js";
import { loadD3 } from "/src/utils/importedD3.js";
import { initRadarCharts } from "/src/utils/initRadarCharts.js";
import { createGaugeChart } from "/src/utils/copilot-gauge.js";

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
  `e.g. Rewrite the video with a different hook that is more engaging.`
);

const handleBriefURL = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const uuid = urlParams.get('uuid');
  
  if (!uuid) {
    console.error('No UUID provided in URL');
    toast.error('Invalid brief URL');
    return;
  }

  return initializeBrief(uuid);
};

const initializeBrief = async (uuid) => {
  try {
    const token = checkAndGetToken(store);
    if (!token) return;

    const response = await fetch(`https://x6c9-ohwk-nih4.n7d.xano.io/api:9W6GA8Qw/brief/me/${uuid}`, {
      method: 'GET',
      headers: getHeaders(token)
    });

    if (!response.ok) {
      throw new Error('Failed to load brief');
    }

    const briefData = await response.json();
    store.sync = briefData;
    
    // Initialize checkboxes after brief data is loaded
    initCheckboxStates();
    
    // Fetch source script if we have an ad_id
    if (briefData.ad_id) {
      await store.fetchSourceScript();
    }
    
    return briefData;
  } catch (error) {
    console.error('Error initializing brief:', error);
    toast.error('Error loading brief: ' + error.message);
    throw error;
  }
};

/*--store----------------------------------------------------------*/
const store = reactive({
  user: {},
  token: (() => {
    console.log('All cookies:', document.cookie);
    const authCookie = document.cookie.split(';')
      .find(c => c.trim().startsWith('ff_auth='));
    const token = authCookie ? decodeURIComponent(authCookie.split('=')[1].trim()) : '';
    console.log('Auth token:', token);
    return token;
  })(),
  isSaving: false,
  isImporting: false,
  toggle_radar: "Direct Response",
  toggle_tabs: 'Script',
  gaugeElement: null,
  new_import_link: "",
  async updateGauge() {
    console.log('updateGauge called, element:', store.gaugeElement);
    const gaugeElement = document.querySelector('[cc_data="copilot-gauge"]');
    console.log('Found gauge element:', gaugeElement);
    if (!gaugeElement) {
      console.log('No gauge element found with [cc_data="copilot-gauge"] selector');
      return;
    }
    
    const score = store.sync?.copilot?.score;
    console.log('Current score:', score);
    if (score === undefined || score === null) {
      console.log('No score available');
      return;
    }
    
    console.log('Creating gauge with:', {
      score: Number(score),
      avgScore: store.sync?.copilot?.avgScore || 75,
      topScore: store.sync?.copilot?.topScore || 79
    });
    
    await createGaugeChart(
      gaugeElement,
      Number(score),
      store.sync?.copilot?.avgScore || 75,
      store.sync?.copilot?.topScore || 79
    );
  },
  //for copilot reactivity on gauge.
  dataToSync: new Proxy({}, {
    set(target, property, value) {
      target[property] = value;
      // If copilot score changes, update the gauge
      if (property === 'copilot' && value?.score !== undefined && store.gaugeElement) {
        setTimeout(() => store.updateGauge(), 0);
      }
      return true;
    }
  }),
  api: {
    profiles: [],
    isLoadingProfiles: false,
    boards: [],
    isLoadingBoards: false,
    users_swipefeed: [],
    isLoadingSwipefeed: false
  },
  //profile sync info
  syncSelectedProfile: {
    id: "",
    image: "",
    brand_name: "Brand",
    product: "",
    import_link: "",
    summary: "asdfasd",
    customPrompt: "",
    helpers: {
      toggle_custom_prompt: false,
      toggle_generate_script: true,
      toggle_generate_action_description: true,
      toggle_generate_text_on_screen: false,
      toggle_script_language: "English",
    },
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    linkedin: "",
    asset_files: [],
    notes: ""
  },
  selectedInspiration: {
    script: [],
    loading: false
  },
  sync: {
    //main brief info
    id: null,
    uuid: null,
    ad_id: null,
    profile_id: null, 
    updated_at: new Date().toISOString().split('T')[0],
    title: "",
    status: "To Do",
    due_date: new Date().toISOString().split('T')[0],
    video_budget: 0,
    description: "",
    //script
    script: [],
    //imported inspiration list
    imported_inspiration_list: [],
    //copilot
    copilot: {
      score: 0,
      virality: 0,
      virality_radar: [
        { category: 'Laughter', value: 0 },
        { category: 'Shock', value: 0 },
        { category: 'Amazement', value: 0 },
        { category: 'Sentimental', value: 0 },
        { category: 'Agitation', value: 0 },
        { category: 'Intrigue', value: 0 }
      ],
      direct_response: 0,
      direct_response_radar: [
        { category: 'Urgency', value: 0 },
        { category: 'Trust', value: 0 },
        { category: 'Clarity', value: 0 },
        { category: 'Desire', value: 0 },
        { category: 'Value', value: 0 },
        { category: 'Relevance', value: 0 }
      ],
      suggestions: []
    },
    //helpers
    helpers: {
      toggle_visibility_source_script: true,
      toggle_visibility_script: true,
      toggle_visibility_action_description: true,
      toggle_visibility_text_on_screen: false,
      toggle_visibility_seconds: true,
    }
  },


  watchBriefTimeout: null,
  watchProfileTimeout: null,
  lastSavedProfileId: null,

  // Watch brief changes (store.sync)
  watchBrief() {
    return effect(() => {
      // Access brief data to track it
      const briefData = JSON.stringify(this.sync);
      
      if (this.watchBriefTimeout) {
        clearTimeout(this.watchBriefTimeout);
      }

      this.watchBriefTimeout = setTimeout(async () => {
        console.log("Brief data changed:", briefData);
        
        try {
          await fetch("https://x6c9-ohwk-nih4.n7d.xano.io/api:9W6GA8Qw/brief/edit", {
            method: "PATCH",
            headers: getHeaders(this.token),
            body: JSON.stringify({ payload: JSON.parse(briefData) })
          });
          toast.success("Brief saved successfully");
        } catch (error) {
          console.error("Error saving brief:", error);
          toast.error("Failed to save brief");
        }
      }, 2500);
    });
  },

  // Watch profile changes (store.syncSelectedProfile)
  watchProfile() {
    return effect(() => {
      // Access profile data to track it
      const profileData = JSON.stringify(this.syncSelectedProfile);
      
      if (this.watchProfileTimeout) {
        clearTimeout(this.watchProfileTimeout);
      }

      this.watchProfileTimeout = setTimeout(async () => {
        console.log("Profile data changed:", profileData);
        
        try {
          await fetch("https://x6c9-ohwk-nih4.n7d.xano.io/api:WPrn5YFa/profiles/edit", {
            method: "PATCH",
            headers: getHeaders(this.token),
            body: JSON.stringify({ payload: JSON.parse(profileData) })
          });
          toast.success("Profile saved successfully");
        } catch (error) {
          console.error("Error saving profile:", error);
          toast.error("Failed to save profile");
        }
      }, 2500);
    });
  },

  // Helper method to save profile
  async saveProfile(profileId) {
    console.log("Saving profile:", profileId);
    try {
      const profileData = profileId === this.syncSelectedProfile.id ? 
        this.syncSelectedProfile : 
        this.api.profiles.find(p => p.id === profileId);

      if (!profileData) {
        console.warn("Profile not found:", profileId);
        return;
      }

      /*await fetch("/api/profiles/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });*/
      toast.success("Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    }
  },

  // Method to switch profiles safely
  async switchProfile(newProfileId) {
    // First, save current profile if it exists
    if (this.syncSelectedProfile?.id) {
      await this.saveProfile(this.syncSelectedProfile.id);
    }

    // Then load the new profile
    const newProfile = this.api.profiles.find(p => p.id === newProfileId);
    if (newProfile) {
      this.syncSelectedProfile = { ...newProfile };
      this.sync.profile_id = newProfileId;
    }
  },


  // Add method to fetch user's profile
  async fetchUserProfiles() {
    try {
      store.api.isLoadingProfiles = true;
      console.log('Fetching profile with token:', store.token);
      const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:WPrn5YFa/profiles/me', {
        method: 'GET',
        headers: getHeaders(store.token)
      });

      console.log('Profile response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Profile response data:', data);
      
      store.api.profiles = data;
      toast.success('Profiles loaded successfully');
      
      console.log('[DEBUG] Fetched profile:', {
        profiles: store.api.profiles
      });
      return true;
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error('Failed to load your profile');
      store.api.profiles = []; // Reset to empty array on error
      return false;
    } finally {
      store.api.isLoadingProfiles = false;
    }
  },

  // Add method to delete a profile
  async deleteProfile(id) {
    console.log('Deleting profile with id:', id);
    try {
      const response = await fetch(`https://x6c9-ohwk-nih4.n7d.xano.io/api:WPrn5YFa/profiles/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders(store.token)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete profile: ${response.status}`);
      }

      // Refresh profiles list from backend
      await store.fetchUserProfiles();
      toast.success('Profile deleted successfully');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  },

  // Method to handle going back to profile list
  async showProfileList() {
    // Refresh profiles list
    await store.fetchUserProfiles();
    // Toggle view back to profile list
    store.sync.profile_id = null;
  },

  // Add method to fetch source script
  async fetchSourceScript() {
    if (!this.sync.ad_id) return;
    
    try {
      this.selectedInspiration.loading = true;
      const token = checkAndGetToken(store);
      if (!token) return;

      const response = await fetch(`https://x6c9-ohwk-nih4.n7d.xano.io/api:9W6GA8Qw/ad/${this.sync.ad_id}/script`, {
        method: 'GET',
        headers: getHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch source script');
      }

      const data = await response.json();
      this.selectedInspiration.script = data.script || [];
      
    } catch (error) {
      console.error('Error fetching source script:', error);
      toast.error('Error loading source script: ' + error.message);
    } finally {
      this.selectedInspiration.loading = false;
    }
  },
});

//end store

/*--main code----------------------------------------------------------*/
//import from url
async function importFromUrl(url) {
  store.isImporting = true;
  
  try {
    const token = checkAndGetToken(store);
    if (!token) return;

    const requestUrl = 'https://x6c9-ohwk-nih4.n7d.xano.io/api:9W6GA8Qw/import_url';
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
async function handleProfile(action, profileId) {
  console.log('[DEBUG] Starting handleProfile with action:', action, 'profileId:', profileId);
  
  if (action === "new") {
    try {
      const token = checkAndGetToken(store);
      if (!token) return;

      const requestUrl = 'https://x6c9-ohwk-nih4.n7d.xano.io/api:WPrn5YFa/profiles/new';
      
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
      store.syncSelectedProfile = data;
      store.sync.profile_id = data.id;
      
      // Refresh the profiles list
      await store.fetchUserProfiles();
    } catch (error) {
      console.error('[DEBUG] Error in handleProfile:', error);
      toast.error('Error handling profile: ' + error.message);
      throw error;
    }
  } else if (action === "load") {
    try {
      const token = checkAndGetToken(store);
      if (!token) return;

      const requestUrl = `https://x6c9-ohwk-nih4.n7d.xano.io/api:WPrn5YFa/profiles/me/${profileId}`;
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: getHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[DEBUG] Error response:', errorData);
        toast.error('Failed to load profile: ' + (errorData.message || 'Unknown error'));
        throw new Error(errorData.message || 'Failed to load profile');
      }

      const data = await response.json();
      console.log('[DEBUG] Success response:', data);
      store.syncSelectedProfile = data;
      store.sync.profile_id = data.id;
    } catch (error) {
      console.error('[DEBUG] Error in handleProfile:', error);
      toast.error('Error loading profile: ' + error.message);
      throw error;
    }
  }
  

  // Content editable inputs
  const inputs = document.querySelectorAll('.cc_contenteditable-input');
  inputs.forEach(input => {
    console.log('Setting up input:', input);
    
    // Set initial text length
    const initialText = input.textContent;
    const initialLength = initialText ? initialText.length + 1 : 1;
    console.log('Initial text:', initialText, 'length:', initialLength);
    input.style.setProperty('--text-length', initialLength);
    
    // Update text length and store on input
    input.addEventListener('input', (e) => {
      const newText = e.target.textContent;
      const newLength = newText ? newText.length + 1 : 1;
      console.log('Input changed. New text:', newText, 'new length:', newLength);
      input.style.setProperty('--text-length', newLength);

      // Update store based on input id or placeholder
      if (this.store.syncSelectedProfile) {
        if (e.target.placeholder === 'Brand Name' || e.target.dataset.name === 'Brand') {
          console.log('Updating brand in store:', newText);
          this.store.syncSelectedProfile.brand_name = newText;
        } else if (e.target.placeholder === 'Product' || e.target.dataset.name === 'Product') {
          console.log('Updating product in store:', newText);
          this.store.syncSelectedProfile.product = newText;
        }
      }
    });
  });
}

/*--reactivity functions----------------------------------------------------------*/

// Background image style
const getBackgroundStyle = (url) => {
  let styles = {};
  if (url !== "") {
    styles = { backgroundImage: `url(${url})` };
  }
  return styles;
};

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
  if (!Array.isArray(store.sync.script) || store.sync.script.length === 0) {
      store.sync.script = [];
  }
  
  store.sync.script.push({
    copilot: "green",                 // Copilot-generated color
    title: getDefaultTitle(),         // Hook for first, Body for rest
    startTime: calculateStartTime(), // Auto-calculated from previous section
    duration: 3.0,               // Default duration in seconds
    script: "",                   // Script/dialogue content
    action_description: "",        // Visual description and actions
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
    store.syncSelectedProfile.asset_files.push("");
};

const setProductVisible = (triggerElement) => {
  // Get the parent container based on the custom attribute
  const parentContainers = document.querySelectorAll('[cc_data-parent="true"]');

  // Toggle visibility for all instances
  parentContainers.forEach((container) => {
    const productElement = container.querySelector('[data-name="Product"]');
    const addProductElement = container.querySelector('[cc_data="add-product"]');

    if (productElement && addProductElement) {
      // Make all product elements visible
      productElement.style.display = 'block';

      // Hide all add-product elements
      addProductElement.style.display = 'none';
    }
  });

  // Focus the sibling product element in the same parent container as the clicked button
  const parentContainer = triggerElement.closest('[cc_data-parent="true"]');
  if (parentContainer) {
    const siblingProductElement = parentContainer.querySelector('[data-name="Product"]');
    if (siblingProductElement) {
      siblingProductElement.focus();
    } else {
      console.error('Sibling product element not found');
    }
  } else {
    console.error('Parent container not found');
  }
};

// Example usage: add event listeners for each "add-product" button
document.querySelectorAll('[cc_data="add-product"]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    setProductVisible(button);
  });
});

const removeAssetFile = (index) => {
    store.syncSelectedProfile.asset_files.splice(index, 1);
};

const initCheckboxStates = () => {
    console.log('[DEBUG] Init checkbox states');
    
    const checkboxMappings = [
        // Visibility toggles (store.sync.helpers)
        {
            selector: 'toggle_visibility_script',
            value: () => store.sync.helpers.toggle_visibility_script
        },
        {
            selector: 'toggle_visibility_action_description',
            value: () => store.sync.helpers.toggle_visibility_action_description
        },
        {
            selector: 'toggle_visibility_text_on_screen',
            value: () => store.sync.helpers.toggle_visibility_text_on_screen
        },
        {
            selector: 'toggle_visibility_source_script',
            value: () => store.sync.helpers.toggle_visibility_source_script
        },
        // Generate toggles (store.syncSelectedProfile.helpers)
        {
            selector: 'toggle_generate_script',
            value: () => store.syncSelectedProfile.helpers.toggle_generate_script
        },
        {
            selector: 'toggle_generate_action_description',
            value: () => store.syncSelectedProfile.helpers.toggle_generate_action_description
        },
        {
            selector: 'toggle_generate_text_on_screen',
            value: () => store.syncSelectedProfile.helpers.toggle_generate_text_on_screen
        }
    ];

    // Single loop to handle all checkbox types
    checkboxMappings.forEach(mapping => {
        document.querySelectorAll(`input[type="checkbox"][cc_data="${mapping.selector}"]`)
            .forEach(checkbox => {
                checkbox.checked = mapping.value();
                const checkboxDiv = checkbox.previousElementSibling;
                if (checkboxDiv) {
                    checkboxDiv.classList.toggle('w--redirected-checked', checkbox.checked);
                }
            });
    });
};

quillCustomPrompt.on(
  "text-change",
  function (delta, oldDelta, source) {
    store.syncSelectedProfile.customPrompt =
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
  
  // Fetch 
  toast.success('Would fetch things now after auth');
  await store.fetchUserProfiles();
}

if (store.token) {
  toast.success('Getting user data...');
  await getUserData(store);
}

await toast.init();

/*--masonry----------------------------------------------------------*/
// Make initMasonry globally accessible
window.initMasonry = function() {
  console.log('[DEBUG] Render event - Start');
  const hitsList = document.querySelector(".webflow-hits-list");
  if (!hitsList) {
    console.error('[DEBUG] Hits list container not found');
    return;
  }

  let masonryInstance = null;

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
    masonryInstance = new Masonry(hitsList, {
      itemSelector: ".webflow-hit-item",
      percentPosition: true,
      columnWidth: ".webflow-hit-item",
      horizontalOrder: true,
      initLayout: true,
      transitionDuration: 0, // Disable animations completely
      resize: false // Prevent auto-layout on resize
    });
    
    // Handle resize manually without animations
    window.addEventListener('resize', () => {
      if (masonryInstance) masonryInstance.layout();
    });

    // Create a MutationObserver to watch for style changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          // Target the specific modal using the combo class
          const modalElement = document.querySelector('.modal_initiate.is--import-videos-modal');
          if (modalElement && window.getComputedStyle(modalElement).display === 'block') {
            console.log('[DEBUG] Import videos modal visible - Recalculating masonry layout');
            setTimeout(() => {
              if (masonryInstance) masonryInstance.layout();
            }, 50);
          }
        }
      });
    });

    // Find and observe the modal
    const modalElement = document.querySelector('.modal_initiate.is--import-videos-modal');
    if (modalElement) {
      observer.observe(modalElement, {
        attributes: true,
        attributeFilter: ['style']
      });
    }
    
    return masonryInstance;
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
    Object.assign(store.sync, { status });
  },
  updateInputWidth($el) {
    if (!$el) return;
    const text = $el.textContent;
    if (!text || text === '') {
      $el.style.width = '3rem';
    } else {
      $el.style.setProperty('--text-length', text.length + 1);
    }
  },
  updateCheckboxStyle(event) {
    console.log('Checkbox state changed:', event);
    // Get the checkbox input element
    const checkbox = event.target;
    console.log('Checkbox element:', checkbox);
    // Get its previous sibling (the div)
    const checkboxDiv = checkbox.previousElementSibling;
    console.log('Checkbox div:', checkboxDiv);
    
    if (checkboxDiv && checkboxDiv.classList.contains('w-checkbox-input')) {
      console.log('Checkbox div found:', checkboxDiv);
      if (checkbox.checked) {
        console.log('Checkbox checked, adding w--redirected-checked');
        checkboxDiv.classList.add('w--redirected-checked');
      } else {
        console.log('Checkbox unchecked, removing w--redirected-checked');
        checkboxDiv.classList.remove('w--redirected-checked');
      }
    }
  },
  mounted() {
    // Initialize both watchers
    store.watchBrief();
    store.watchProfile();
    
    console.log('Mounting component...');
    
    // Initialize Uploadcare with proper configuration
    initUploadcare(store).catch(error => {
        console.error('Uploadcare initialization failed:', error);
    });

    // Initialize datepicker
    initDatepicker('[cc_data-datepicker="true"]', {}, store);

    // Initialize Cleave.js formatting
    initCleave().catch(error => {
        console.error('Cleave initialization failed:', error);
    });

    console.log('Starting D3 initialization...');
    loadD3().then(async () => {
        console.log('D3 loaded successfully');
        // Initialize gauge chart
        const gaugeElement = document.querySelector('[cc_data="copilot-gauge"]');
        console.log('Found gauge element:', gaugeElement);
        
        if (gaugeElement) {
            store.gaugeElement = gaugeElement;
            console.log('Attempting to update gauge...');
            await store.updateGauge();
            
            // Set up proxy for copilot object
            if (store.sync && !store.sync.copilot) {
                console.log('Initializing copilot object');
                store.sync.copilot = {};
            }
            
            store.sync.copilot = new Proxy(store.sync.copilot || {}, {
                set(target, property, value) {
                    console.log(`Setting copilot.${property}:`, value);
                    target[property] = value;
                    if (property === 'score') {
                        console.log('Score changed, updating gauge');
                        store.updateGauge();
                    }
                    return true;
                }
            });
        } else {
            console.warn('Gauge element not found');
        }

        // Initialize radar charts
        console.log('Initializing radar charts...');
        initRadarCharts(
            store.sync.copilot.virality_radar,
            store.sync.copilot.direct_response_radar
        );
    }).catch(error => {
        console.error('Failed to initialize D3 charts:', error);
    });

    // Initialize masonry
    injectStyles();
    setTimeout(() => {
      console.log('[DEBUG] masonry set timeout start');
      window.initMasonry();
    }, 1000);
    


    setTimeout(() => {
      const elements = document.querySelectorAll('[cc_data-datepicker="true"]');
      console.log('🔍 About to initialize datepicker');
      console.log('Found elements:', elements);
      
      if (elements.length > 0) {
        initDatepicker('[cc_data-datepicker="true"]', {}, store);
      } else {
        console.warn('No datepicker elements found');
      }
    }, 50);

    // Initialize Cleave.js for budget formatting
    const budgetInput = document.querySelector('[cc_data="cleave-currency"]');
    if (budgetInput && window.Cleave) {
        new window.Cleave(budgetInput, {
            numeral: true,
            numeralThousandsGroupStyle: 'thousand'
        });
    }

    // Initialize brief based on URL
    handleBriefURL().catch(error => {
      console.error('Error handling brief URL:', error);
      toast.error('Error initializing brief');
    });
  },
  addAssetFile,
  removeAssetFile,
  addScriptSection,
  updateGenerateScript,
  updateGenerateAction,
  updateGenerateText,
  importFromUrl,
  handleProfile,
  getBackgroundStyle,
  setProductVisible,
  handleBriefURL,
  initializeBrief
});

export { app };