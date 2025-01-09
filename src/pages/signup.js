import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData } from "/src/utils/userData.js";
import { syncFormWithStore } from "/src/utils/formUtils.js";

// Initialize toast
await toast.init();

// A reactive store for user data
const store = reactive({
  user: {},
  token: (() => {
    console.log('All cookies:', document.cookie);
    const authCookie = document.cookie.split(';')
      .find(c => c.trim().startsWith('ff_auth='));
    return authCookie ? authCookie.split('=')[1] : '';
  })(),
  fields: {
    email: "",
    password: ""
  }
});

// Form field mapping
const formFieldMapping = {
  'email-7': 'email',
  'password-6': 'password'
};

// Sync form with store when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  syncFormWithStore(store, formFieldMapping);
});

const debugStore = StoreDebugger.init(store);

const app = createApp({
  store,
  WebflowFormComponent(props) {
    return WebflowFormComponent({
      ...props,
      store,
      fields: store.fields,
      requiresAuth: false,
      successMessage: "Welcome to Flashfeed!"
    });
  },
  async getUserData() {
    return getUserData(store);
  },
  debugStore
});

export { app };