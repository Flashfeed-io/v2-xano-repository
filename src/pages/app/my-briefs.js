// Import AG Grid styles
//import 'ag-grid-community/styles/ag-grid.css';
//import 'ag-grid-community/styles/ag-theme-alpine.css';
import '/src/styles/ag-grid-custom.css';
import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData, logout, verifyAuth, checkAndGetToken } from "/src/utils/userData.js";
import { getHeaders } from '/src/utils/constants.js';
import { v4 as uuidv4 } from 'uuid';
import { createGrid, AllCommunityModule, ModuleRegistry, themeQuartz, iconSetQuartzBold } from 'ag-grid-community';

// Define custom theme
const myTheme = themeQuartz
	.withPart(iconSetQuartzBold)
	.withParams({
        accentColor: "#1C183CB8",
        backgroundColor: "#ffffff",
        borderColor: "#E9EAF2",
        borderRadius: 4,
        cellHorizontalPaddingScale: 0.5,
        columnBorder: false,
        foregroundColor: "#212936",
        headerBackgroundColor: "#F9FAFB",
        headerFontSize: 14,
        headerFontWeight: 600,
        headerRowBorder: false,
        headerTextColor: "#919191",
        oddRowBackgroundColor: "#F7F9FAA1",
        rowBorder: false,
        sidePanelBorder: true,
        spacing: 13,
        wrapperBorder: false,
        wrapperBorderRadius: 0,
        lineHeight: 1,
        headerCellMinWidth: 0,
        headerCellMovable: false,
        headerCellResizable: false,
        headerCellSeparator: false
    });

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

console.log('my-briefs.js: Starting script');
console.log('my-briefs.js: AG Grid imported:',  createGrid);
console.log('my-briefs.js: AG Grid modules imported:', AllCommunityModule);
console.log('my-briefs.js: AG Grid ModuleRegistry imported:', ModuleRegistry);
console.log('my-briefs.js: AG Grid themeQuartz imported:', themeQuartz);
console.log('my-briefs.js: AG Grid iconSetQuartzBold imported:', iconSetQuartzBold);

console.log('my-briefs.js: AG Grid theme imported:', myTheme);

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
    console.log('my-briefs.js: Fetching user briefs');
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
      console.log('my-briefs.js: Briefs fetched:', data.length);
    } catch (error) {
      console.error('my-briefs.js: Error fetching briefs:', error);
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
  },

  // Initialize AG Grid
  initGrid() {
    console.log('Initializing AG Grid');
    const gridDiv = document.querySelector('[data-ag-grid]');
    if (!gridDiv) {
      console.error('Grid div not found');
      return;
    }

    // Basic grid options
    const gridOptions = {
      columnDefs: [
        { 
          field: 'title',
          headerName: 'Title',
          flex: 1,
          minWidth: 200
        },
        {
          field: 'status',
          width: 120,
          cellRenderer: params => {
            let statusClass = '';
            switch (params.value) {
              case 'To Do': statusClass = 'cc_status-grey'; break;
              case 'In Progress': statusClass = 'cc_status-orange'; break;
              case 'Ready For Production': statusClass = 'cc_status-blue'; break;
              case 'Live': statusClass = 'cc_status-green'; break;
              default: statusClass = 'cc_status-grey';
            }
            return `<span class="${statusClass}">${params.value}</span>`;
          }
        },
        {
          field: 'created_at',
          headerName: 'Created',
          width: 120,
          valueFormatter: params => {
            return new Date(params.value).toLocaleDateString();
          }
        }
      ],
      rowData: [
        { id: 1, title: 'Test Brief 1', status: 'To Do', created_at: '2024-03-23' },
        { id: 2, title: 'Test Brief 2', status: 'In Progress', created_at: '2024-03-22' }
      ],
      defaultColDef: {
        sortable: false,
        filter: false
      },
      rowSelection: {
        mode: 'multiRow',
        checkboxSelection: true,
        headerCheckbox: true
      },
      headerHeight: 48,
      rowHeight: 48,
      theme: myTheme
    };

    // Create the grid
    try {
      createGrid(gridDiv, gridOptions);
      console.log('Grid initialized successfully');
    } catch (error) {
      console.error('Error initializing grid:', error);
    }
  }
});

/*--initializers----------------------------------------------------------*/
console.log('my-briefs.js: Starting initializers');
const debugStore = StoreDebugger.init(store);

// Initial auth check
if (store.token) {
  console.log('my-briefs.js: Verifying auth');
  const isAuthenticated = await verifyAuth(store);
  if (!isAuthenticated) {
    console.log('my-briefs.js: Not authenticated, redirecting');
    window.location.href = "/";
  }
  
  console.log('my-briefs.js: Authenticated, fetching briefs');
  await store.fetchUserBriefs();
  store.initGrid(); // Initialize grid after fetching briefs
}

if (store.token) {
  console.log('my-briefs.js: Getting user data');
  await getUserData(store);
}

console.log('my-briefs.js: Initializing toast');
await toast.init();

/*--mount----------------------------------------------------------*/
console.log('my-briefs.js: Creating app');
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
  async mounted() {
    try {
      console.log('my-briefs.js: App mounted');
      // Display briefs count
      console.log('my-briefs.js: Current briefs:', store.briefs.length);
    } catch (error) {
      console.error('my-briefs.js: Error in app mount:', error);
    }
  }
});

console.log('my-briefs.js: Mounting app');
app.mount();

console.log('my-briefs.js: App mounted, exporting');
export { app };
