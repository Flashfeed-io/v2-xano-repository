import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData } from "/src/utils/userData.js";

// Initialize toast
await toast.init();

// A reactive store for user data
const store = reactive({
  user: {},
  token: localStorage.getItem('xanoToken') || '',
  fields: {
    member_id: "",
    email: "",
    password: ""
  }
});

const debugStore = StoreDebugger.init(store);

// Fetch user data when the app starts
if (store.token) {
  await getUserData(store);
}

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
  debugStore
});

export { app };