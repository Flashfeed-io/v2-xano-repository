import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData, logout, verifyAuth } from "/src/utils/userData.js";

/*--main code----------------------------------------------------------*/
const store = reactive({
  user: {},
  token: (() => {
    console.log('All cookies:', document.cookie);
    const authCookie = document.cookie.split(';')
      .find(c => c.trim().startsWith('ff_auth='));
    return authCookie ? authCookie.split('=')[1] : '';
  })()
});

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



const testEnv = async () => {
  try {
    const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:f7qthdHh:staging/test_env', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Test env response:', data);
    return data;
  } catch (error) {
    console.error('Error testing env:', error);
    throw error;
  }
};


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
    // Initialize any page-specific functionality here
  },
  testEnv
});

export { app };