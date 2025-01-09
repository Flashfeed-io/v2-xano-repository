import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData, logout } from "/src/utils/userData.js";


/*--main code----------------------------------------------------------*/
const store = reactive({
  user: {},
  token: document.cookie.split(';').find(c => c.trim().startsWith('ff_auth=')).split('=')[1] || '',
  fields: {
    member_id: "",
    email: "",
    password: ""
  }
});


/*--initializers----------------------------------------------------------*/
const debugStore = StoreDebugger.init(store);

if (store.token) {
  await getUserData(store);
}

await toast.init();

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
  debugStore
});

export { app };