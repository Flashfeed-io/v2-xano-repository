import { createApp, reactive } from "https://unpkg.com/petite-vue@0.4.1/dist/petite-vue.es.js";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";

// Add Toastify CSS and JS dynamically
const toastifyCss = document.createElement('link');
toastifyCss.rel = 'stylesheet';
toastifyCss.href = 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css';
document.head.appendChild(toastifyCss);

// Load Toastify JS
let Toastify;
const loadToastify = async () => {
  if (!window.Toastify) {
    await import('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.js').then(module => {
      Toastify = window.Toastify;
    });
  } else {
    Toastify = window.Toastify;
  }
};
loadToastify();

// A reactive store for user data
const store = reactive({
  user: {},
  token: localStorage.getItem('xanoToken') || '',
  fields: {
    email: "",
    password: ""
  },
  isError: false,
  isSuccess: false,
  message: ''
});

const showToast = (message, isError = false) => {
  if (!window.Toastify) {
    console.error('Toastify not loaded yet');
    return;
  }
  window.Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: isError ? "#ff5555" : "#4CAF50",
    },
  }).showToast();
};

const getUserData = async () => {
  if (!store.token) {
    console.log("No token found. User not logged in.");
    return;
  }

  try {
    const response = await fetch("https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${store.token}`,
      },
    });
    const data = await response.json();
    store.user = data;
    console.log("User data loaded:", store.user);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    showToast("Failed to fetch user data", true);
  }
};

const debugStore = StoreDebugger.init(store);

const app = createApp({
  store,
  WebflowFormComponent: (props) => WebflowFormComponent({ 
    ...props, 
    requiresAuth: false, 
    store: store,
    $scope: {
      showSuccessToast: (message) => showToast(message, false),
      showErrorToast: (message) => showToast(message, true)
    }
  }),
  getUserData,
  debugStore: () => debugStore.logStore(),
  showSuccessToast: (message) => showToast(message, false),
  showErrorToast: (message) => showToast(message, true),
  testToast: () => {
    showToast('Test toast message', false);
  }
});

// Add global test functions
window.testToast = {
  success: (message = "Success toast test!") => showToast(message, false),
  error: (message = "Error toast test!") => showToast(message, true)
};

export { app };
