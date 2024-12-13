import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";
import { $fetch } from "ohmyfetch";

// A reactive store for user data
const store = reactive({
  user: {},
  token: localStorage.getItem('xanoToken') || '',
  fields: {
    email: "",
    password: ""
  },
});

const getUserData = async () => {
  if (!store.token) {
    console.log("No token found. User not logged in.");
    return;
  }

  try {
    const data = await $fetch("https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${store.token}`,
      },
    });
    store.user = data;
    console.log("User data loaded:", store.user);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
};

const app = createApp({
  store,
  WebflowFormComponent,
  getUserData
});

export { app };
