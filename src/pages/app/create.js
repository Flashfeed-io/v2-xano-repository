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
import { initCustomDropdown } from "/src/utils/customDropdown.js";
import { calcAdScores } from "/src/utils/scoreCalculator.js";

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
    toast.error('No UUID provided in URL');
    return;
  }

  await initializeBrief(uuid);
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

    const data = await response.json();
    console.log('initializeBrief data:', data);
    
    // Set brief data
    store.sync = data.briefData;
    
    // Set profile data if it exists
    if (data.profileData) {
      store.syncSelectedProfile = data.profileData;
      // Initialize content editable fields after setting profile data
      initContentEditableFields();
      if (data.profileData.custom_prompt) {
        quillCustomPrompt.root.innerHTML = data.profileData.custom_prompt;
      }
    }
    
    // Set ad data if it exists
    if (data.adData) {
      store.sourceAd = data.adData;
    }
    
    // Initialize checkboxes after brief data is loaded
    initCheckboxStates();

    // Ensure gauge and radar charts update after data is loaded
    if (data.briefData?.copilot) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Update gauge
        store.dataToSync.copilot = data.briefData.copilot;
        
        // Update radar charts
        if (data.briefData.copilot.virality_radar && data.briefData.copilot.direct_response_radar) {
          loadD3().then(() => {
            initRadarCharts(
              data.briefData.copilot.virality_radar,
              data.briefData.copilot.direct_response_radar
            );
          }).catch(error => {
            console.error('Failed to initialize radar charts:', error);
          });
        }
      }, 100);
    }
    
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
      avgScore: store.sync?.copilot?.avgScore || 0,
      topScore: store.sync?.copilot?.topScore || 0
    });
    
    await createGaugeChart(
      gaugeElement,
      Number(score),
      store.sync?.copilot?.avgScore || 0,
      store.sync?.copilot?.topScore || 0
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
  sourceAd: {
    script: [],
  },
  //profile sync info
  syncSelectedProfile: {
    id: "",
    image: "",
    brand_name: "Brand",
    product: "",
    import_link: "",
    summary: "",
    custom_prompt: "",
    helpers: {
      toggle_custom_prompt: false,
      toggle_generate_script: true,
      toggle_generate_visual_description: true,
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
        { category: 'Sentiment', value: 0 },
        { category: 'Pull', value: 0 },
        { category: 'Intrigue', value: 0 }
      ],
      direct_response: 0,
      direct_response_radar: [
        { category: 'Urgency', value: 0 },
        { category: 'Trust', value: 0 },
        { category: 'Clarity', value: 0 },
        { category: 'Desire', value: 0 },
        { category: 'Value', value: 0 },
        { category: 'Concept', value: 0 }
      ],
      suggestions: []
    },
    //helpers
    helpers: {
      toggle_visibility_source_script: true,
      toggle_visibility_script: true,
      toggle_visibility_visual_description: true,
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
      
      // Calculate scores immediately when copilot radar changes
      if (this.sync.copilot?.virality_radar && this.sync.copilot?.direct_response_radar) {
        console.log('[watchBrief] Calculating copilot scores...');
        calcAdScores(this.sync.copilot);
        // Update gauge
        this.updateGauge();
      }
      
      if (this.watchBriefTimeout) {
        clearTimeout(this.watchBriefTimeout);
      }

      this.watchBriefTimeout = setTimeout(async () => {
        console.log("Brief data changed:", briefData);
        
        try {
          const response = await fetch("https://x6c9-ohwk-nih4.n7d.xano.io/api:9W6GA8Qw/brief/edit", {
            method: "PATCH",
            headers: getHeaders(this.token),
            body: JSON.stringify({ payload: JSON.parse(briefData) })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
          }

          toast.success("Brief saved successfully");
        } catch (error) {
          console.error("Error saving brief:", error);
          toast.error("Error. " + error.message);
        }
      }, 1725);
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
      }, 1725);
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
      store.sync.profile_id = null;
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
  languages: [
    'English', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Aymara', 'Azerbaijani',
    'Bambara', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian', 'Burmese', 'Catalan',
    'Chewa', 'Chinese (Cantonese)', 'Chinese (Mandarin)', 'Croatian', 'Czech', 'Danish',
    'Dari', 'Dutch', 'Dzongkha', 'Estonian', 'Fijian', 'Filipino', 'Finnish', 'French',
    'Fulani', 'Georgian', 'German', 'Greek', 'Gujarati', 'Guaraní', 'Haitian Creole',
    'Hausa', 'Hebrew', 'Hindi', 'Hungarian', 'Icelandic', 'Igbo', 'Indonesian', 'Irish',
    'Italian', 'Japanese', 'Kannada', 'Kazakh', 'Khmer', 'Kinyarwanda', 'Korean',
    'Kurdish', 'Kyrgyz', 'Lao', 'Latvian', 'Lingala', 'Lithuanian', 'Macedonian',
    'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Marshallese', 'Moldovan',
    'Mongolian', 'Montenegrin', 'Nepali', 'Norwegian', 'Oromo', 'Pashto', 'Persian',
    'Polish', 'Portuguese', 'Punjabi', 'Quechua', 'Romanian', 'Russian', 'Samoan',
    'Serbian', 'Shona', 'Sinhala', 'Slovak', 'Slovene', 'Somali', 'Spanish', 'Swahili',
    'Swedish', 'Tamil', 'Telugu', 'Thai', 'Tswana', 'Turkish', 'Turkmen', 'Tuvaluan',
    'Ukrainian', 'Urdu', 'Uzbek', 'Vietnamese', 'Xhosa', 'Yoruba', 'Zulu'
  ],
  selectLanguage(language) {
    this.syncSelectedProfile.helpers.toggle_script_language = language;
  },
  // Method to set all radar values to 1 or 2
  setLowRadarValues() {
    console.log('[setLowRadarValues] Setting low values');
    
    // Create new arrays with updated values
    this.sync.copilot.virality_radar = this.sync.copilot.virality_radar.map(item => ({
      ...item,
      value: 1
    }));
    
    this.sync.copilot.direct_response_radar = this.sync.copilot.direct_response_radar.map(item => ({
      ...item,
      value: 2
    }));
    
    console.log('[setLowRadarValues] Values updated');
  
    // Update radar charts after a short delay
    setTimeout(() => {
      initRadarCharts(
        this.sync.copilot.virality_radar,
        this.sync.copilot.direct_response_radar
      );
    }, 100);
  },

    // Method to set all radar values to 5
  setHighRadarValues() {
    console.log('[setHighRadarValues] Setting high values');
    
    // Create new arrays with updated values
    this.sync.copilot.virality_radar = this.sync.copilot.virality_radar.map(item => ({
      ...item,
      value: 5
    }));
    
    this.sync.copilot.direct_response_radar = this.sync.copilot.direct_response_radar.map(item => ({
      ...item,
      value: 5
    }));
    
    console.log('[setHighRadarValues] Values updated');
  
    // Update radar charts after a short delay
    setTimeout(() => {
      initRadarCharts(
        this.sync.copilot.virality_radar,
        this.sync.copilot.direct_response_radar
      );
    }, 100);
  },

  timeEditing: {
    sectionIndex: null,
    isEndTime: false
  },
  formatTimeMMSS: (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },
  formatTimeRange: (startTime, endTime) => {
    return `${store.formatTimeMMSS(startTime)} - ${store.formatTimeMMSS(endTime)}`;
  },
  getDuration: (section) => {
    return section.end_time - section.start_time;
  },
  startTimeEdit: (index) => {
    store.timeEditing.sectionIndex = index;
    // Use setTimeout to ensure the input exists in DOM
    setTimeout(() => {
      const input = document.querySelector(`[data-duration-input="${index}"]`);
      if (input) {
        input.focus();
      }
    }, 0);
  },
  saveTimeEdit: (index, newDurationStr) => {
    const durationInSeconds = parseInt(newDurationStr, 10);
    if (isNaN(durationInSeconds) || durationInSeconds <= 0) return false;

    const section = store.sync.script[index];
    const oldEndTime = section.end_time;
    const newEndTime = section.start_time + durationInSeconds;
    const timeDiff = newEndTime - oldEndTime;

    // Update this section's end time
    section.end_time = newEndTime;

    // Update all subsequent sections
    for (let i = index + 1; i < store.sync.script.length; i++) {
      store.sync.script[i].start_time += timeDiff;
      store.sync.script[i].end_time += timeDiff;
    }

    // Clear editing state
    store.timeEditing.sectionIndex = null;
    return true;
  },
  cancelTimeEdit: () => {
    store.timeEditing.sectionIndex = null;
  },
  handleTimeKeyup: (event, index) => {
    // Handle Enter key
    if (event.key === 'Enter') {
      store.saveTimeEdit(index, event.target.value);
    }
    // Handle Escape key
    else if (event.key === 'Escape') {
      store.cancelTimeEdit();
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


// Initialize content editable fields for brand and product
const initContentEditableFields = () => {
  console.log('[DEBUG] Initializing content editable fields');
  const inputs = document.querySelectorAll('.cc_contenteditable-input');
  inputs.forEach(input => {
    console.log('Setting up input:', input);
    
    // Set initial text length
    const initialText = input.textContent;
    const initialLength = initialText ? initialText.length + 1 : 1;
    console.log('Initial text:', initialText, 'length:', initialLength);
    input.style.setProperty('--text-length', initialLength);
    
    // Prevent Enter key from creating new lines
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log('Enter key blocked on contenteditable input');
      }
    });
    
    // Update text length on input (visual feedback only)
    input.addEventListener('input', (e) => {
      const newText = e.target.textContent;
      const newLength = newText ? newText.length + 1 : 1;
      console.log('Input changed. New text:', newText, 'new length:', newLength);
      input.style.setProperty('--text-length', newLength);
      
      // If field becomes empty, update store immediately to trigger v-show
      if (!newText || newText.trim() === '') {
        if (store.syncSelectedProfile) {
          if (e.target.placeholder === 'Brand Name' || e.target.dataset.name === 'Brand') {
            console.log('Field empty, clearing brand in store');
            store.syncSelectedProfile.brand_name = '';
          } else if (e.target.placeholder === 'Product' || e.target.dataset.name === 'Product') {
            console.log('Field empty, clearing product in store');
            store.syncSelectedProfile.product = '';
          }
        }
      }
    });
    
    // Update store only on blur (when user is done editing)
    // This prevents reactive updates from interfering with cursor position during typing
    input.addEventListener('blur', (e) => {
      const newText = e.target.textContent;
      console.log('Input blur. Saving to store:', newText);
      
      if (store.syncSelectedProfile) {
        if (e.target.placeholder === 'Brand Name' || e.target.dataset.name === 'Brand') {
          console.log('Updating brand in store:', newText);
          store.syncSelectedProfile.brand_name = newText;
        } else if (e.target.placeholder === 'Product' || e.target.dataset.name === 'Product') {
          console.log('Updating product in store:', newText);
          store.syncSelectedProfile.product = newText;
        }
      }
    });

    // Set initial values from store if they exist
    if (store.syncSelectedProfile) {
      if ((input.placeholder === 'Brand Name' || input.dataset.name === 'Brand') && store.syncSelectedProfile.brand_name) {
        input.textContent = store.syncSelectedProfile.brand_name;
        input.style.setProperty('--text-length', store.syncSelectedProfile.brand_name.length + 1);
      } else if ((input.placeholder === 'Product' || input.dataset.name === 'Product') && store.syncSelectedProfile.product) {
        input.textContent = store.syncSelectedProfile.product;
        input.style.setProperty('--text-length', store.syncSelectedProfile.product.length + 1);
      }
    }
  });
};

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
      
      // Initialize content editable fields after setting store data
      initContentEditableFields();
      
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
      
      // Initialize content editable fields after setting store data
      initContentEditableFields();

      if (typeof Webflow !== 'undefined' && Webflow.require('ix2')) {
        Webflow.require('ix2').init();
        console.log('[DEBUG] Webflow and IX2 loaded');
      }

      // Initialize checkboxes after the profile data is loaded
      initCheckboxStates();

    } catch (error) {
      console.error('[DEBUG] Error in handleProfile:', error);
      toast.error('Error loading profile: ' + error.message);
      throw error;
    }
  }
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
const calculateStartTime = (index = -1) => {
  // If there's no script array or it's empty, this must be the first section, so start at 0
  if (!store.sync.script || store.sync.script.length === 0) return 0;

  // Case 1: Adding to the end of the list (index = -1) OR
  // Case 2: Invalid index that's too large
  // In both cases, we want to start this section where the last section ends
  if (index < 0 || index >= store.sync.script.length) {
    const lastSection = store.sync.script[store.sync.script.length - 1];
    return lastSection.end_time;
  }

  // Case 3: Adding at the very beginning (index = 0)
  // Start at 0 since this will become the first section
  if (index === 0) return 0;

  // Case 4: Adding somewhere in the middle
  // Start this section exactly where the previous section ends
  const previousSection = store.sync.script[index - 1];
  return previousSection.end_time;
};

const getDefaultTitle = (index = -1) => {
  // The first section (either when list is empty or explicitly adding at index 0)
  // should be titled "Hook". All other sections are "Body"
  if (!store.sync.script || store.sync.script.length === 0 || index === 0) return "Hook";
  return "Body";
};

const addScriptSection = (position = -1) => {
  // Initialize script array if it doesn't exist
  if (!Array.isArray(store.sync.script)) {
    store.sync.script = [];
  }
  
  // Calculate where this section should start based on its position
  const start_time = calculateStartTime(position);

  // Create the new section with default 5 second duration
  const newSection = {
    copilot: "",
    title: getDefaultTitle(position),
    start_time: start_time,
    end_time: start_time + 5.0,
    script: "",
    visual_description: "",
    text_on_screen: "",
    virality_ratings: [],
    direct_response_ratings: []
  };

  // If inserting into existing list
  if (position >= 0 && position < store.sync.script.length) {
    store.sync.script.splice(position, 0, newSection);

    // Update all following sections while preserving their durations
    for (let i = position + 1; i < store.sync.script.length; i++) {
      const duration = store.sync.script[i].end_time - store.sync.script[i].start_time;
      store.sync.script[i].start_time = store.sync.script[i - 1].end_time;
      store.sync.script[i].end_time = store.sync.script[i].start_time + duration;
    }
  } else {
    store.sync.script.push(newSection);
  }
  
  initCustomDropdown();
};

const deleteScriptSection = (index) => {
  if (Array.isArray(store.sync.script) && index >= 0 && index < store.sync.script.length) {
    // Remove the section
    store.sync.script.splice(index, 1);
    
    // Recalculate times for all subsequent sections
    for (let i = index; i < store.sync.script.length; i++) {
      // Calculate the duration of this section before updating its start time
      const duration = store.sync.script[i].end_time - store.sync.script[i].start_time;
      
      // Update start time based on previous section's end time or 0 if first section
      store.sync.script[i].start_time = i === 0 ? 0 : store.sync.script[i - 1].end_time;
      
      // Set end time to maintain the original duration
      store.sync.script[i].end_time = store.sync.script[i].start_time + duration;
    }
  }
}; 

const syncGenerateToVisibility = (type, value) => {
  // If setting generate to true, also set visibility to true
  if (value === true) {
    switch(type) {
      case 'script':
        store.sync.helpers.toggle_visibility_script = true;
        break;
      case 'action':
        store.sync.helpers.toggle_visibility_visual_description = true;
        break;
      case 'text':
        store.sync.helpers.toggle_visibility_text_on_screen = true;
        break;
    }
  }
};

const updateGenerateScript = (value) => {
  store.syncSelectedProfile.helpers.toggle_generate_script = value;
  syncGenerateToVisibility('script', value);
};

const updateGenerateAction = (value) => {
  store.syncSelectedProfile.helpers.toggle_generate_visual_description = value;
  syncGenerateToVisibility('action', value);
};

const updateGenerateText = (value) => {
  store.syncSelectedProfile.helpers.toggle_generate_text_on_screen = value;
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

const deleteAssetFile = (index) => {
  console.log('[DEBUG] Deleting asset file at index:', index);
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
            selector: 'toggle_visibility_visual_description',
            value: () => store.sync.helpers.toggle_visibility_visual_description
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
            selector: 'toggle_generate_visual_description',
            value: () => store.syncSelectedProfile.helpers.toggle_generate_visual_description
        },
        {
            selector: 'toggle_generate_text_on_screen',
            value: () => store.syncSelectedProfile.helpers.toggle_generate_text_on_screen
        },
        {
            selector: 'toggle_custom_prompt',
            value: () => store.syncSelectedProfile.helpers.toggle_custom_prompt
        }
    ];
setTimeout(() => {
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
}, 25);
};
quillCustomPrompt.on(
  "text-change",
  function (delta, oldDelta, source) {
    store.syncSelectedProfile.custom_prompt =
      quillCustomPrompt.container.children[0].innerHTML;

    console.log(
      "Checking -> : inside textchange of brandserviceorproduct quill",
      quillCustomPrompt.container.children[0].innerHTML
    );
    
    // Count the text length, ignoring HTML tags
    const textLength = quillCustomPrompt.getText().trim().length;

    // Calculate width based on text length (customize this logic as needed)
    let widthPercentage = Math.min(100, (textLength / 150) * 100); // Caps at 100%

    // Determine color based on text length
    let color;
    if (textLength <= 75) {
      color = "#f25455"; // Red
    } else if (textLength > 75 && textLength <= 150) {
      color = "#fe8f57"; // Orange
    } else {
      color = "#30c454"; // Green
    }

    // Update the length bar element
    const lengthBar = document.querySelector(
      '[cc_data="barCustomPrompt"]'
    );
    if (lengthBar) {
      lengthBar.style.width = widthPercentage + "%";
      lengthBar.style.backgroundColor = color;
    }
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
  calculateScores() {
    if (!store.sync.copilot) return { virality: 0, direct_response: 0, score: 0 };
    
    const scores = calcAdScores(store.sync.copilot);
     console.log('Scores calculated:', scores);
    if (store.updateGauge) store.updateGauge();
    
    return scores;
  },
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
  getScoreColor(value) {
    // Convert to integer if it's a string
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    
    // Handle invalid values
    if (isNaN(numValue)) return '#f25455';
    
    // Return color based on value (0-100 scale)
    if (numValue <= 50) {
      return '#f25455'; // Red (0-50)
    } else if (numValue > 50 && numValue <= 75) {
      return '#fe8f57'; // Orange (51-75)
    } else {
      return '#30c454'; // Green (76-100)
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
    // Initialize watchers
    initCustomDropdown();
    
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
  deleteAssetFile,
  addScriptSection,
  deleteScriptSection,
  updateGenerateScript,
  updateGenerateAction,
  updateGenerateText,
  importFromUrl,
  handleProfile,
  getBackgroundStyle,
  setProductVisible,
  handleBriefURL,
  initializeBrief,
  formatTimeMMSS: store.formatTimeMMSS,
  formatTimeRange: store.formatTimeRange,
  startTimeEdit: store.startTimeEdit,
  saveTimeEdit: store.saveTimeEdit,
  cancelTimeEdit: store.cancelTimeEdit,
  importFromUrl,
  handleProfile,
  getBackgroundStyle,
  setProductVisible,
  handleBriefURL,
  initializeBrief,
  formatTimeMMSS: store.formatTimeMMSS,
  formatTimeRange: store.formatTimeRange,
  startTimeEdit: store.startTimeEdit,
  saveTimeEdit: store.saveTimeEdit,
  cancelTimeEdit: store.cancelTimeEdit,
  handleTimeKeyup: store.handleTimeKeyup,
});

export { app };