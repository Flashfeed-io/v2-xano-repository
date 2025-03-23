import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData, logout, verifyAuth, checkAndGetToken } from "/src/utils/userData.js";
import { getHeaders } from '/src/utils/constants.js';
import { v4 as uuidv4 } from 'uuid';

/*--store----------------------------------------------------------*/
const store = reactive({
  user: {},
  token: (() => {
    console.log('All cookies:', document.cookie);
    const authCookie = document.cookie.split(';')
      .find(c => c.trim().startsWith('ff_auth='));
    return authCookie ? authCookie.split('=')[1] : null;
  })(),
  briefs: [],
  isLoadingBriefs: false,

  // Fetch user's briefs
  async fetchUserBriefs() {
    try {
      this.isLoadingBriefs = true;
      const token = checkAndGetToken(store);
      if (!token) return;

      const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:9W6GA8Qw/brief/me', {
        method: 'GET',
        headers: getHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch briefs');
      }

      const data = await response.json();
      this.briefs = data;
    } catch (error) {
      console.error('Error fetching briefs:', error);
      toast.error('Error loading briefs: ' + error.message);
    } finally {
      this.isLoadingBriefs = false;
    }
  },

  // Create a new brief
  async createNewBrief() {
    try {
      const token = checkAndGetToken(store);
      if (!token) return;

      const uuid = uuidv4();
      const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:9W6GA8Qw/brief/new', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          uuid: uuid
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create brief');
      }

      const newBrief = await response.json();
      
      // Add to briefs list
      this.briefs.unshift(newBrief);
      
      // Redirect to create page with UUID
      window.location.href = `/app/create?uuid=${uuid}`;
      
      return newBrief;
    } catch (error) {
      console.error('Error creating brief:', error);
      toast.error('Error creating brief: ' + error.message);
      throw error;
    }
  },

  // Delete a brief
  async deleteBrief(briefId) {
    try {
      const token = checkAndGetToken(store);
      if (!token) return;

      const response = await fetch(`https://x6c9-ohwk-nih4.n7d.xano.io/api:9W6GA8Qw/brief/${briefId}`, {
        method: 'DELETE',
        headers: getHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to delete brief');
      }

      // Remove from local state
      this.briefs = this.briefs.filter(brief => brief.id !== briefId);
      toast.success('Brief deleted successfully');
    } catch (error) {
      console.error('Error deleting brief:', error);
      toast.error('Error deleting brief: ' + error.message);
      throw error;
    }
  }
});

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
  await store.fetchUserBriefs();
}

if (store.token) {
  toast.success('Getting user data...');
  await getUserData(store);
}

await toast.init();


/*--mount----------------------------------------------------------*/
const app = createApp({
  store,
  WebflowFormComponent,
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

  mounted() {
    // Check authentication
    verifyAuth(store).then(isAuthenticated => {
      if (!isAuthenticated) {
        window.location.href = '/login';
        return;
      }
      // Load user's briefs
      store.fetchUserBriefs();
    });
  }
});

export { app };
