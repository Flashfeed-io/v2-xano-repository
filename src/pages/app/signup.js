import { createApp, reactive } from "https://unpkg.com/petite-vue@0.4.1/dist/petite-vue.es.js";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";

// A reactive store for user data
const store = reactive({
  user: {},
  token: localStorage.getItem('xanoToken') || '',
  fields: {
    member_id: "",
    email: "",
    password: ""
  },
  isError: false,
  isSuccess: false,
  message: ''
});

const showToast = (message, isError = false) => {
  if (isError) {
    toast.error(message);
  } else {
    toast.success(message);
  }
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
    $scope: {
      showSuccessToast: (message) => toast.success(message),
      showErrorToast: (message) => toast.error(message)
    }
  }),
  getUserData,
  debugStore: () => debugStore.logStore(),
  showSuccessToast: (message) => toast.success(message),
  showErrorToast: (message) => toast.error(message),
  testToast: () => toast.success('Test toast message')
});

// Add global test functions
window.testToast = {
  success: (message = "Success toast test!") => toast.success(message),
  error: (message = "Error toast test!") => toast.error(message)
};

export { app };
