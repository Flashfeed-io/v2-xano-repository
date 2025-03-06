import { createApp, reactive, nextTick } from "petite-vue";
import { StoreDebugger } from "@/utils/storeDebugger.js";
import { WebflowFormComponent } from "@/components/WebflowFormComponent.js";
import { toast } from "@/utils/toastManager.js";
import { getUserData, logout, verifyAuth } from "@/utils/userData.js";
import { injectStyles } from "@/utils/injectStyles.js";
import { initCustomDropdown } from "@/utils/customDropdown.js";
import { getHeaders } from "@/utils/constants.js";

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// A reactive store for user data
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
  activeFilterTab: "platform",
  boards: [],
  users_swipefeed: [],
  defaultBoard: null,
  editingBoardId: null,

  // Methods for board management
  startEditing(itemId) {
    console.log('[DEBUG] Starting edit mode for:', itemId);
    this.editingBoardId = itemId;
    
    // Wait for Vue to update the DOM
    setTimeout(() => {
      // Find the input element for the specific board being edited
      const boardItem = document.querySelector(`[data-board-id="${itemId}"]`);
      console.log('[DEBUG] Found board item:', boardItem);
      if (boardItem) {
        const input = boardItem.querySelector('.form_field.is--board.w-input');
        console.log('[DEBUG] Found input element:', input);
        if (input) {
          console.log('[DEBUG] Attempting to focus input');
          input.readOnly = false;
          // Force a small delay to ensure the input is rendered
          requestAnimationFrame(() => {
            input.focus();
            input.select();
            console.log('[DEBUG] Focus and select called');
          });
        }
      }
    }, 100); // Increased timeout to give Vue more time to render
  },

  stopEditing() {
    console.log('Stopping edit mode, current editingBoardId:', this.editingBoardId);
    this.editingBoardId = null;
  },

  updateBoardName(itemId, newName) {
    console.log('Updating board name for:', itemId);
    this.debouncedUpdateBoard(itemId, newName);
    this.stopEditing();
  },

  handleKeyup(event, itemId, itemName) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.blur();
      this.updateBoardName(itemId, itemName);
    } else if (event.key === 'Escape') {
      this.stopEditing();
    }
  },

  // Debounced update function
  debouncedUpdateBoard: debounce(async (itemId, newName) => {
    console.log('Debounced update for board:', itemId, 'new name:', newName);
    const board = store.boards.find(b => b.id === itemId);
    if (board) {
      try {
        const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:DHN2-_b_/boards/edit_name', {
          method: 'PUT',
          headers: getHeaders(store.token),
          body: JSON.stringify({
            board_id: parseInt(itemId),
            new_name: newName || ''
          })
        });

        if (!response.ok) throw new Error('Failed to update board name');
        
        // Update local state after successful API call
        board.name = newName || "";
        board.updated_at = new Date().toISOString();
        toast.success('Board name updated successfully');
      } catch (error) {
        console.error('Error updating board name:', error);
        toast.error('Failed to update board name');
      }
    }
  }, 500),

  // Add method to create new board
  async createNewBoard() {
    console.log('Creating new board...');
    try {
      const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:DHN2-_b_/boards/new', {
        method: 'POST',
        headers: getHeaders(store.token),
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error('Failed to create board');
      
      const newBoard = await response.json();
      this.boards.unshift(newBoard);
      toast.success('New board created');
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create new board');
    }
  },

  // Add method to save ad to board
  async saveAdToBoard(adId, boardId) {
    // Check if this is the default board
    const isDefaultBoard = boardId === this.user.default_board_id;
    
    // Check if ad is already saved to this board
    const existingEntry = this.users_swipefeed.find(item => 
      item.ad_id === parseInt(adId) && item.board_id === parseInt(boardId));
    
    // Optimistic update - toggle the saved state immediately
    if (existingEntry) {
      // Ad is already saved - mark as deleting (will hide in UI)
      existingEntry.isDeleting = true;
      
      // Only remove from all boards if explicitly unsaving from default board
      if (isDefaultBoard) {
        // Mark all instances of this ad as deleting
        this.users_swipefeed.forEach(item => {
          if (item.ad_id === parseInt(adId)) {
            item.isDeleting = true;
          }
        });
        toast.info('Removing ad from all boards...');
      } else {
        // Just mark this specific board entry as deleting
        // Don't affect the default board entry when removing from a user board
        this.users_swipefeed = this.users_swipefeed.map(item => {
          if (item.ad_id === parseInt(adId) && item.board_id === parseInt(boardId)) {
            return { ...item, isDeleting: true };
          }
          return item;
        });
        toast.info('Removing ad from board...');
      }
    } else {
      // Ad not saved - add it with optimistic flag
      const tempId = `temp-${Date.now()}`;
      // When saving to a user board, also save to default board if not already saved
      const defaultBoardEntry = this.users_swipefeed.find(item => 
        item.ad_id === parseInt(adId) && item.board_id === this.user.default_board_id);
      
      if (!defaultBoardEntry && !isDefaultBoard) {
        // Add to both the selected board and default board
        this.users_swipefeed.push(
          {
            id: `temp-default-${Date.now()}`,
            ad_id: parseInt(adId),
            board_id: this.user.default_board_id,
            user_id: this.user.id,
            isAdding: true
          },
          {
            id: tempId,
            ad_id: parseInt(adId),
            board_id: parseInt(boardId),
            user_id: this.user.id,
            isAdding: true
          }
        );
      } else {
        // Just add to the selected board
        this.users_swipefeed.push({
          id: tempId,
          ad_id: parseInt(adId),
          board_id: parseInt(boardId),
          user_id: this.user.id,
          isAdding: true
        });
      }
      toast.info('Saving ad to board...');
    }

    try {
      const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:DHN2-_b_/boards/save_ad', {
        method: 'POST',
        headers: getHeaders(store.token),
        body: JSON.stringify({
          ad_id: parseInt(adId),
          board_id: parseInt(boardId),
          remove_from_all: isDefaultBoard && existingEntry // Only remove from all when unsaving from default board
        })
      });

      if (!response.ok) throw new Error('Failed to save ad to board');
      
      const result = await response.json();
      
      // Update with actual data
      if (existingEntry) {
        if (isDefaultBoard) {
          // Remove all entries for this ad if unsaving from default board
          this.users_swipefeed = this.users_swipefeed.filter(item => 
            item.ad_id !== parseInt(adId) || !item.isDeleting);
          toast.success('Ad removed from all boards');
        } else {
          // Only remove the specific board entry, preserving default board status
          this.users_swipefeed = this.users_swipefeed.filter(item => 
            !(item.ad_id === parseInt(adId) && 
              item.board_id === parseInt(boardId) && 
              item.isDeleting));
          toast.success('Ad removed from board');
        }
      } else {
        // Find temporary entry and replace with real data
        const tempIndex = this.users_swipefeed.findIndex(item => 
          item.ad_id === parseInt(adId) && 
          item.board_id === parseInt(boardId) && 
          item.isAdding);
          
        if (tempIndex !== -1) {
          // Replace temp with real data
          this.users_swipefeed[tempIndex] = {
            ...result,
            ad_id: parseInt(adId),
            board_id: parseInt(boardId)
          };
        }
        toast.success('Ad saved to board');
      }
    } catch (error) {
      console.error('Error saving ad to board:', error);
      
      // Revert optimistic updates on error
      if (existingEntry) {
        // Revert deletion flag
        if (isDefaultBoard) {
          // Revert all entries for this ad
          this.users_swipefeed.forEach(item => {
            if (item.ad_id === parseInt(adId)) {
              delete item.isDeleting;
            }
          });
        } else {
          // Revert just the specific entry
          delete existingEntry.isDeleting;
        }
      } else {
        // Remove temporary entry
        this.users_swipefeed = this.users_swipefeed.filter(item => 
          !(item.ad_id === parseInt(adId) && 
          item.board_id === parseInt(boardId) && 
          item.isAdding));
      }
      
      toast.error('Failed to save ad to board');
    }
  },

  // Add method to delete board
  async deleteBoard(boardId) {
    try {
      const response = await fetch(`https://x6c9-ohwk-nih4.n7d.xano.io/api:DHN2-_b_/boards/delete/${boardId}`, {
        method: 'DELETE',
        headers: getHeaders(store.token)
      });

      if (!response.ok) throw new Error('Failed to delete board');
      
      // Remove the board from local state
      this.boards = this.boards.filter(board => board.id !== boardId);
      
      toast.success('Board deleted successfully');
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    }
  },

  // Add method to fetch user's boards
  async fetchUserBoards() {
    try {
      console.log('Fetching boards with token:', this.token);
      const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:DHN2-_b_/boards/me', {
        method: 'GET',
        headers: getHeaders(store.token)
      });

      console.log('Boards response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) throw new Error('Failed to fetch boards');
      
      const data = await response.json();
      console.log('Boards response data:', data);
      
      this.defaultBoard = data.users_default_board;
      this.boards = data.users_boards || [];
      
      console.log('[DEBUG] Fetched boards:', {
        defaultBoard: this.defaultBoard,
        boards: this.boards
      });
    } catch (error) {
      console.error('Error fetching boards:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error('Failed to load your boards');
    }
  },

  // Add method to fetch user's swipefeed
  async fetchUserSwipefeed() {
    toast.info('Fetching swipefeed...');
    try {
      const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:DHN2-_b_/boards_ads/me', {
        headers: getHeaders(this.token)
      });
      
      if (!response.ok) throw new Error('Failed to fetch swipefeed');
      toast.success('Fetched swipefeed');
      const data = await response.json();
      this.users_swipefeed = data;
      console.log('[DEBUG] Fetched swipefeed:', data);
    } catch (error) {
      console.error('Error fetching swipefeed:', error);
      toast.error('Failed to load your saved ads');
    }
  },
});

/*-----------------------------------------------------------------------------------------------------------------------------*/

window.addEventListener("DOMContentLoaded", () => {
  // Inject styles first
  injectStyles();

  // Check if required containers exist
  const requiredContainers = ['#genre-list', '#clear-refinements', '#searchbox', '#hits', '#poweredBy'];
  const missingContainers = requiredContainers.filter(selector => !document.querySelector(selector));
  if (missingContainers.length > 0) {
    console.error('[DEBUG] Missing containers:', missingContainers);
    return;
  }

  // establish connection to search index with application ID and public api key from algolia
  const searchClient = algoliasearch(
    "JPENBJBFVG",
    "e52c4e233b34d3a2adc1dea827d0a9cf"
  );

  const search = instantsearch({
    indexName: "ads",
    searchClient,
  });

  console.log('[DEBUG] Initializing search with widgets');
  // add each widget
  search.addWidgets([
    // Clear Filters button
    instantsearch.widgets.clearRefinements({
      container: "#clear-refinements",
      templates: {
        resetLabel({ hasRefinements }, { html }) {
          return html`<span
            >${hasRefinements ? "Clear Filters" : "No Filters Applied"}</span
          >`;
        },
      },
      cssClasses: {
        button: "alg_clearrefinements-button",
        disabledButton: "alg_clearrefinements-button--disabled",
      },
    }),
    // Hits widget to see actual data in Algolia records
    instantsearch.widgets.hits({
      container: '#hits',
      templates: {
        item(hit) {
          console.log('[DEBUG] Hit record:', hit);
          return `<div>${JSON.stringify(hit)}</div>`;
        }
      }
    }),
    // Genre component
    instantsearch.widgets.refinementList({
      container: "#refinement-platform",
      attribute: "genres",
      cssClasses: {
        root: "ad-library_filter-max-height",
      },
      transformItems(items) {
        console.log('[DEBUG] Platform refinement items:', items);
        return items;
      },
      searchable: true,
      operator: 'or',
      limit: 10,
      templates: {
        item: `
          <label class="w-checkbox form-checkbox">
            <div class="w-checkbox-input w-checkbox-input--inputType-custom form-checkbox-square{{#isRefined}} w--redirected-checked{{/isRefined}}"></div>
            <input type="checkbox" 
              style="opacity:0;position:absolute;z-index:-1" 
              value="{{label}}" 
              {{#isRefined}}checked{{/isRefined}}
              onclick="
                const originalEvent = event;
                event.stopPropagation();
                setTimeout(() => {
                  // Create and dispatch a new click event after Algolia processes
                  const newEvent = new MouseEvent('click', {
                    bubbles: false,
                    cancelable: true,
                    view: window
                  });
                  originalEvent.target.dispatchEvent(newEvent);
                }, 10);
              "
            />
            <span class="form-checkbox-label w-form-label">{{label}} ({{count}})</span>
          </label>
        `,
        noResults: 'No genres found.',
        noRefinementRoot: 'No genres available.'
      }
    }),
    // Search component
    instantsearch.widgets.searchBox({
      container: document.querySelector("#searchbox"),
      placeholder: "Search anything",
      cssClasses: {
        input: "alg_form_field-search",
        resetIcon: "webflow-search-reset",
      },
      showSubmit: false,
      showLoadingIndicator: false,
      searchAsYouType: true,
    }),
    // Powered by algolia logo component
    instantsearch.widgets.poweredBy({
      container: "#poweredBy",
      cssClasses: {
        root: "webflow-powered-by",
      },
    }),
    // Hits component
    instantsearch.widgets.infiniteHits({
      container: document.querySelector("#hits"),
      cssClasses: {
        root: "webflow-hits-root",
        list: "webflow-hits-list",
        item: "webflow-hit-item",
        emptyRoot: "webflow-hit-empty",
        loadMore: "webflow-load-more",
      },
      templates: {
        item: (hit) => {
          console.log('[DEBUG] Hit record:', hit);

          return `
<div class="alg_dashboard-area"><div class="alg_dashboard-block"><div class="alg_ad-library_hit-padding"><div class="alg_ad-library_hit-top"><div class="alg_hit-brand"><div class="alg_hit-brand-image-wrap"><img src="${hit.brand_image}" class="alg_brand-image"></div><div><div class="alg_hit-brand-name">${hit.brand_name}</div><div class="div-block-641"><div class="subtext-11">${hit.industry}</div></div></div></div><div class="alg_hit-rating-wrap"><div class="alg_hit-rating"></div><div class="alg_hit-rating"></div><div class="alg_hit-rating"></div><div cc_score-bar="" class="alg_hit-rating"></div></div><div data-hover="false" data-delay="0" class="alg_hit-dropdown w-dropdown"><div class="alg_hit-dropdown-toggle w-dropdown-toggle" id="w-dropdown-toggle-0" aria-controls="w-dropdown-list-0" aria-haspopup="menu" aria-expanded="false" role="button" tabindex="0"><div class="icon-18 w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div></div><nav class="alg_hit-dropdown-menu w-dropdown-list" id="w-dropdown-list-0" aria-labelledby="w-dropdown-toggle-0"><div class="alg_hit-dropdown-menu-inner"><a href="/support" class="cc_dropdown__list-item w-inline-block" tabindex="0"><div class="icon_menu w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.7076 18.3639L11.2933 19.7781C9.34072 21.7308 6.1749 21.7308 4.22228 19.7781C2.26966 17.8255 2.26966 14.6597 4.22228 12.7071L5.63649 11.2929M18.3644 12.7071L19.7786 11.2929C21.7312 9.34024 21.7312 6.17441 19.7786 4.22179C17.826 2.26917 14.6602 2.26917 12.7076 4.22179L11.2933 5.636M8.50045 15.4999L15.5005 8.49994" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div><div class="pre">Get Link</div></a><a href="/support" class="cc_dropdown__list-item w-inline-block" tabindex="0"><div class="icon_menu w-embed"><svg width="24" height="24" viewBox="0 0 82 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32.6072 67.4858C32.675 68.5442 33.4252 69.4451 34.4694 69.7222C35.5141 69.9995 36.6185 69.5908 37.2109 68.7077L38.0118 67.5156C38.445 66.8698 39.1642 66.4636 39.9529 66.4193L41.4086 66.3375C42.4873 66.277 43.401 65.5458 43.6778 64.5226C43.9546 63.4994 43.5323 62.4137 42.6287 61.8271L41.4094 61.0352C40.7487 60.6063 40.3309 59.8984 40.2817 59.1245L40.1899 57.6954C40.1226 56.6372 39.3725 55.7363 38.3278 55.4591C37.2835 55.1819 36.1792 55.5906 35.5862 56.4736L34.7858 57.6658C34.3526 58.3117 33.6334 58.7178 32.8447 58.7621L31.3891 58.844C30.3104 58.9044 29.3967 59.6356 29.1199 60.6588C28.8431 61.682 29.2653 62.7677 30.1689 63.3544L31.3883 64.1462C32.0489 64.5752 32.4667 65.2831 32.5159 66.0569L32.6072 67.4858Z" fill="currentColor"></path>
<path d="M49.9925 30.9635C43.0818 40.6964 30.7671 48.4805 9.74231 49.1801C9.07366 51.5523 8.58047 53.7559 8.2467 55.6972C7.87031 57.8927 5.73096 59.3757 3.46962 59.0098C1.20805 58.6438 -0.319769 56.5677 0.0571213 54.3722C0.584071 51.303 1.44125 47.7611 2.66021 43.9934C5.6398 34.7849 10.8897 23.9003 19.1172 15.2475C27.4173 6.51828 38.8319 0 53.8156 0H57.967V4.02987C57.967 7.27423 58.3243 15.1451 52.75 17.7453L41.0344 21.775C39.5581 22.1591 38.6819 23.6322 39.0771 25.0654C39.4729 26.4986 40.9906 27.3491 42.4669 26.9651L51.9462 24.4995C52.756 24.2888 53.4421 25.1028 53.0658 25.8502C52.1994 27.5708 51.1832 29.2863 49.9925 30.9635Z" fill="currentColor"></path>
<path d="M69.4323 60.9992C67.9367 61.8545 66.0461 61.5567 64.9153 60.2875L62.0301 57.0495C61.0725 55.9747 59.5471 55.5787 58.1632 56.0456L53.9942 57.4522C52.3601 58.0035 50.5691 57.3456 49.715 55.8802C48.8609 54.4149 49.1812 52.5496 50.4802 51.4235L53.7945 48.5505C54.8947 47.5968 55.3111 46.0904 54.8503 44.7315L53.4618 40.6375C52.9176 39.0329 53.6024 37.2622 55.098 36.4069C56.5936 35.5517 58.4842 35.8495 59.615 37.1186L62.5001 40.3567C63.4579 41.4315 64.9831 41.8275 66.367 41.3606L70.5359 39.9541C72.1704 39.4026 73.9613 40.0605 74.8154 41.5258C75.6696 42.9912 75.3493 44.8565 74.0498 45.9828L70.7357 48.8556C69.6355 49.8093 69.2191 51.3158 69.68 52.6747L71.0685 56.7686C71.6127 58.3732 70.9278 60.144 69.4323 60.9992Z" fill="currentColor"></path>
</svg></div><div class="pre">Rewrite</div></a></div></nav></div></div></div><div class="alg_ad-library_hit-padding is--video"><video controls="" width="100%" src="${hit.video_url}" class="video"></video></div><div class="alg_ad-library_hit-padding is--bottom"><div class="alg_save-hit-wrap"><div v-bind:class="{ 'button-gradient-green': store.users_swipefeed.some(item => item.ad_id === ${hit.id} &amp;&amp; !item.isDeleting) }" cc_data="dropdown-button-wrap" class="cc_save-hit-wrap button-outline"><div cc_data="dropdown-button" class="alg_hit-save-left"><div class="button-icon w-embed"><svg width="100%" height="100%" viewBox="-1 -1 26 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div></div><div v-on:click="store.saveAdToBoard(${hit.id}, store.user.default_board_id)" class="alg_hit-save-middle"><div v-text="store.users_swipefeed.some(item => item.ad_id === ${hit.id} &amp;&amp; !item.isDeleting) ? 'Saved' : 'Save to SwipeFeed'">Save to SwipeFeed</div></div><div v-bind:style="store.users_swipefeed.some(item => item.ad_id === ${hit.id} &amp;&amp; !item.isDeleting) ? { borderLeft: '1px solid #ffffff6e' } : {}" cc_data="dropdown-button" class="alg_hit-save-right"><div class="button-icon w-embed"><svg width="16" height="16" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.66667 46.6667H32.6667C33.9043 46.6667 35.0913 46.175 35.9665 45.2998C36.8417 44.4247 37.3333 43.2377 37.3333 42V4.66667C37.3333 3.42899 36.8417 2.242 35.9665 1.36683C35.0913 0.491665 33.9043 0 32.6667 0H4.66667C3.42899 0 2.242 0.491665 1.36683 1.36683C0.491665 2.242 0 3.42899 0 4.66667V42C0 43.2377 0.491665 44.4247 1.36683 45.2998C2.242 46.175 3.42899 46.6667 4.66667 46.6667ZM0 79.3333C0 80.571 0.491665 81.758 1.36683 82.6332C2.242 83.5083 3.42899 84 4.66667 84H32.6667C33.9043 84 35.0913 83.5083 35.9665 82.6332C36.8417 81.758 37.3333 80.571 37.3333 79.3333V60.6667C37.3333 59.429 36.8417 58.242 35.9665 57.3668C35.0913 56.4917 33.9043 56 32.6667 56H4.66667C3.42899 56 2.242 56.4917 1.36683 57.3668C0.491665 58.242 0 59.429 0 60.6667V79.3333ZM46.6667 79.3333C46.6667 80.571 47.1583 81.758 48.0335 82.6332C48.9087 83.5083 50.0957 84 51.3333 84H79.3333C80.571 84 81.758 83.5083 82.6332 82.6332C83.5083 81.758 84 80.571 84 79.3333V46.6667C84 45.429 83.5083 44.242 82.6332 43.3668C81.758 42.4917 80.571 42 79.3333 42H51.3333C50.0957 42 48.9087 42.4917 48.0335 43.3668C47.1583 44.242 46.6667 45.429 46.6667 46.6667V79.3333ZM51.3333 32.6667H79.3333C80.571 32.6667 81.758 32.175 82.6332 31.2998C83.5083 30.4247 84 29.2377 84 28V4.66667C84 3.42899 83.5083 2.242 82.6332 1.36683C81.758 0.491665 80.571 0 79.3333 0H51.3333C50.0957 0 48.9087 0.491665 48.0335 1.36683C47.1583 2.242 46.6667 3.42899 46.6667 4.66667V28C46.6667 29.2377 47.1583 30.4247 48.0335 31.2998C48.9087 32.175 50.0957 32.6667 51.3333 32.6667Z" fill="currentColor"></path>
</svg></div><div class="alg_board-dropdown-arrow w-icon-dropdown-toggle"></div></div><div class="cc_option-dropdown__list-custom is--auto-left"><div class="dropdown_padding"><div class="dropdown_board-top-wrap"><div class="h-flex-center-075 text-align-left"><img src="https://cdn.prod.website-files.com/6643b76ff21fa0983192bff1/664495fa4d7615b45d74d1d3_home-icon.png" loading="lazy" alt="" class="icon_dashboard-nav"><div class="text-color-grey-filter"><div class="heading-15">SwipeFeed Boards</div><div class="subtext-13">Save your ads to shareable boards.</div></div></div><a v-on:click="store.createNewBoard()" href="#" class="button-dark w-inline-block"><div class="button-icon w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div><div>New Board</div></a></div></div><div class="divider"></div><div class="dropdown_padding"><div><div class="cc_vue-for-swipefeed-boards"><div v-bind:class="{ 'is--cc_saved': store.users_swipefeed.some(swipefeed => swipefeed.ad_id === ${hit.id} &amp;&amp; !swipefeed.isDeleting) }" v-on:click="store.saveAdToBoard(${hit.id}, store.user.default_board_id)" class="cc_dropdown__list-item"><div class="h-flex-center-075 text-align-left"><div id="w-node-_9e4d3d4c-1cd4-80fa-1230-33f4618f07b3-618f0766" class="icon-20 w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 12L12 16M12 16L16 12M12 16V8M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div><div class="cc_swipefeed-toggle-inputs"><div class="heading-14">My SwipeFeed &nbsp;<span class="subtext-12">(Private)</span></div></div></div><div class="auto-left"><div>#</div></div></div></div><div class="divider bot5 top5"></div><div class="swipefeed-scroll"><div v-bind:data-board-id="item.id" v-for="(item, index) in store.boards" class="cc_vue-for-swipefeed-boards"><div class="relative"><input v-focus="" class="form_field is--board w-input" maxlength="256" name="field-2" v-on:blur="store.updateBoardName(item.id, item.name)" data-name="Field 2" v-model="item.name" placeholder="Enter a board name..." v-if="store.editingBoardId === item.id" v-on:keyup="store.handleKeyup($event, item.id, item.name)" type="text" id="field-2" required=""><div v-bind:class="{ 'is--cc_white': store.users_swipefeed.some(swipefeed => swipefeed.ad_id === ${hit.id} &amp;&amp; swipefeed.board_id === item.id &amp;&amp; !swipefeed.isDeleting) }" class="cc_dropdown__list-item is--board-hover"><div class="board-left"><div v-if="store.editingBoardId === item.id" class="icon-20 relative-10 w-embed"><svg width="16" height="16" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.66667 46.6667H32.6667C33.9043 46.6667 35.0913 46.175 35.9665 45.2998C36.8417 44.4247 37.3333 43.2377 37.3333 42V4.66667C37.3333 3.42899 36.8417 2.242 35.9665 1.36683C35.0913 0.491665 33.9043 0 32.6667 0H4.66667C3.42899 0 2.242 0.491665 1.36683 1.36683C0.491665 2.242 0 3.42899 0 4.66667V42C0 43.2377 0.491665 44.4247 1.36683 45.2998C2.242 46.175 3.42899 46.6667 4.66667 46.6667ZM0 79.3333C0 80.571 0.491665 81.758 1.36683 82.6332C2.242 83.5083 3.42899 84 4.66667 84H32.6667C33.9043 84 35.0913 83.5083 35.9665 82.6332C36.8417 81.758 37.3333 80.571 37.3333 79.3333V60.6667C37.3333 59.429 36.8417 58.242 35.9665 57.3668C35.0913 56.4917 33.9043 56 32.6667 56H4.66667C3.42899 56 2.242 56.4917 1.36683 57.3668C0.491665 58.242 0 59.429 0 60.6667V79.3333ZM46.6667 79.3333C46.6667 80.571 47.1583 81.758 48.0335 82.6332C48.9087 83.5083 50.0957 84 51.3333 84H79.3333C80.571 84 81.758 83.5083 82.6332 82.6332C83.5083 81.758 84 80.571 84 79.3333V46.6667C84 45.429 83.5083 44.242 82.6332 43.3668C81.758 42.4917 80.571 42 79.3333 42H51.3333C50.0957 42 48.9087 42.4917 48.0335 43.3668C47.1583 44.242 46.6667 45.429 46.6667 46.6667V79.3333ZM51.3333 32.6667H79.3333C80.571 32.6667 81.758 32.175 82.6332 31.2998C83.5083 30.4247 84 29.2377 84 28V4.66667C84 3.42899 83.5083 2.242 82.6332 1.36683C81.758 0.491665 80.571 0 79.3333 0H51.3333C50.0957 0 48.9087 0.491665 48.0335 1.36683C47.1583 2.242 46.6667 3.42899 46.6667 4.66667V28C46.6667 29.2377 47.1583 30.4247 48.0335 31.2998C48.9087 32.175 50.0957 32.6667 51.3333 32.6667Z" fill="#212936"></path>
</svg></div><div v-if="store.editingBoardId !== item.id" class="icon-20 relative-10 w-embed"><svg width="16" height="16" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.66667 46.6667H32.6667C33.9043 46.6667 35.0913 46.175 35.9665 45.2998C36.8417 44.4247 37.3333 43.2377 37.3333 42V4.66667C37.3333 3.42899 36.8417 2.242 35.9665 1.36683C35.0913 0.491665 33.9043 0 32.6667 0H4.66667C3.42899 0 2.242 0.491665 1.36683 1.36683C0.491665 2.242 0 3.42899 0 4.66667V42C0 43.2377 0.491665 44.4247 1.36683 45.2998C2.242 46.175 3.42899 46.6667 4.66667 46.6667ZM0 79.3333C0 80.571 0.491665 81.758 1.36683 82.6332C2.242 83.5083 3.42899 84 4.66667 84H32.6667C33.9043 84 35.0913 83.5083 35.9665 82.6332C36.8417 81.758 37.3333 80.571 37.3333 79.3333V60.6667C37.3333 59.429 36.8417 58.242 35.9665 57.3668C35.0913 56.4917 33.9043 56 32.6667 56H4.66667C3.42899 56 2.242 56.4917 1.36683 57.3668C0.491665 58.242 0 59.429 0 60.6667V79.3333ZM46.6667 79.3333C46.6667 80.571 47.1583 81.758 48.0335 82.6332C48.9087 83.5083 50.0957 84 51.3333 84H79.3333C80.571 84 81.758 83.5083 82.6332 82.6332C83.5083 81.758 84 80.571 84 79.3333V46.6667C84 45.429 83.5083 44.242 82.6332 43.3668C81.758 42.4917 80.571 42 79.3333 42H51.3333C50.0957 42 48.9087 42.4917 48.0335 43.3668C47.1583 44.242 46.6667 45.429 46.6667 46.6667V79.3333ZM51.3333 32.6667H79.3333C80.571 32.6667 81.758 32.175 82.6332 31.2998C83.5083 30.4247 84 29.2377 84 28V4.66667C84 3.42899 83.5083 2.242 82.6332 1.36683C81.758 0.491665 80.571 0 79.3333 0H51.3333C50.0957 0 48.9087 0.491665 48.0335 1.36683C47.1583 2.242 46.6667 3.42899 46.6667 4.66667V28C46.6667 29.2377 47.1583 30.4247 48.0335 31.2998C48.9087 32.175 50.0957 32.6667 51.3333 32.6667Z" fill="currentColor"></path>
</svg></div><div class="cc_swipefeed-toggle-inputs"><div v-text="item.name || 'Untitled Board'" v-if="store.editingBoardId !== item.id" v-on:click="store.startEditing(item.id)" class="heading-14">Lorem ipsum dolor sit amet.</div></div></div><div class="auto-left relative-10"><div v-if="store.editingBoardId !== item.id" class="relative-2">#</div><div v-on:click="store.deleteBoard(item.id)" v-else="" class="button-outline is--small-version is--delete"><div class="button-icon w-embed"><svg width="20" height="20" viewBox="-1 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div><div>Delete </div></div></div></div><div v-bind:class="{ 'is--cc_saved': store.users_swipefeed.some(swipefeed => swipefeed.ad_id === ${hit.id} &amp;&amp; swipefeed.board_id === item.id &amp;&amp; !swipefeed.isDeleting) }" v-on:click="store.saveAdToBoard(${hit.id}, item.id)" v-if="store.editingBoardId !== item.id" class="boards_clickable"></div></div></div></div></div></div></div></div></div></div></div></div>
        `},
        empty: `
      <div class="empty-state_wrap">
        <img src="https://assets-global.website-files.com/6643b76ff21fa0983192bff1/664c4bae0fb6cb966eccdf78_cloud-empty-state.svg" loading="lazy" alt="">
        <div class="empty-state_message-flex">
          <div class="heading-16">No videos that match your search</div>
          <div class="subtext-14">Try removing filters to find inspiration.</div>
        </div>
      </div>
    `,
      },
    }),
  ]);

  console.log('[DEBUG] Starting search');
  search.start();

  // search event handlers
  search.on("render", () => {
    console.log('[DEBUG] Render event - Start');
    const hitsList = document.querySelector(".webflow-hits-list");
    if (!hitsList) {
      console.error('[DEBUG] Hits list container not found');
      return;
    }

// Wait for all videos to load before initializing masonry
const videos = hitsList.querySelectorAll('video');
console.log('[DEBUG] Waiting for videos to load:', videos.length);

Promise.all(Array.from(videos).map(video => {
  return new Promise((resolve) => {
    if (video.readyState >= 3) {
      console.log('[DEBUG] Video already loaded');
      resolve();
    } else {
      console.log('[DEBUG] Waiting for video to load');
      video.addEventListener('loadeddata', () => {
        console.log('[DEBUG] Video loaded');
        resolve();
      });
      // Add error handler to resolve promise even if video fails to load
      video.addEventListener('error', () => {
        console.error('[DEBUG] Video load error');
        resolve();
      });
    }
  });
})).then(() => {
  setTimeout(() => {
    console.log(app.mount())
    initCustomDropdown();
  }, 100);
  console.log('[DEBUG] All videos loaded, initializing masonry');
  const msnry = new Masonry(hitsList, {
    itemSelector: ".webflow-hit-item",
    percentPosition: true,
    columnWidth: ".webflow-hit-item",
    horizontalOrder: true,
    initLayout: true,
    transitionDuration: 0, // Disable animations completely
    resize: true // Enable auto-layout on resize
  });
  
  // Store masonry instance for later reference
  window.adLibraryMasonry = msnry;
  
  // Handle resize manually
  window.addEventListener('resize', () => {
    if (window.adLibraryMasonry) window.adLibraryMasonry.layout();
  });
    });
    console.log('[DEBUG] Render event - Complete');
  });

  // hide loader in Webflow after initiating algolia
  const loader = document.querySelector("[data-cc='loader']");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 2000);
  }

  // alternative to ix2
  $(document).ready(function () {
    customAlgoliaDropdown();
  });
});

// Dropdown functionality for Algolia hits
function customAlgoliaDropdown() {

  console.log('[DEBUG] running customAlgoliaDropdown');

  /*--algolia hits dropdown--*/
  // open
  function openDropdown(dropdownToggle, dropdownMenu) {
    console.log('[DEBUG] Opening dropdown:', { 
      toggle: dropdownToggle.length > 0 ? 'Found' : 'Not Found',
      menu: dropdownMenu.length > 0 ? 'Found' : 'Not Found'
    });

    // Close all other dropdowns first
    $(".alg_hit-dropdown-toggle").not(dropdownToggle).removeClass("w--open");
    $(".alg_hit-dropdown-menu").not(dropdownMenu).removeClass("w--open");

    // Open this dropdown
    dropdownToggle.addClass("w--open");
    dropdownMenu.addClass("w--open");
  }

  // close
  function closeDropdown(dropdownToggle, dropdownMenu) {
    console.log('[DEBUG] Closing dropdown:', {
      toggle: dropdownToggle.length > 0 ? 'Found' : 'Not Found',
      menu: dropdownMenu.length > 0 ? 'Found' : 'Not Found'
    });
    
    dropdownToggle.removeClass("w--open");
    dropdownMenu.removeClass("w--open");
  }

  // close on toggle reclick?
  $(document).on("click", ".alg_hit-dropdown-toggle", function (event) {
    event.stopPropagation();
    
    const dropdownToggle = $(this);
    const dropdownMenu = dropdownToggle.next(".alg_hit-dropdown-menu");

    if (dropdownMenu.hasClass("w--open")) {
      if (!$(event.target).is('input[type="checkbox"]') && !$(event.target).closest('.w-checkbox').length) {
        closeDropdown(dropdownToggle, dropdownMenu);
      }
    } else {
      openDropdown(dropdownToggle, dropdownMenu);
    }
  });

  // close on outside click
  $(document).on("click", function(event) {
    if ($(event.target).is('input[type="checkbox"]') || $(event.target).closest('.w-checkbox').length) {
      return;
    }

    $(".alg_hit-dropdown-toggle").each(function() {
      const dropdownToggle = $(this);
      const dropdownMenu = dropdownToggle.next(".alg_hit-dropdown-menu");
      if (dropdownMenu.hasClass("w--open")) {
        closeDropdown(dropdownToggle, dropdownMenu);
      }
    });
  });

}


/*--initializers----------------------------------------------------------*/
const debugStore = StoreDebugger.init(store);

// Initial auth check
if (store.token) {
  const isAuthenticated = await verifyAuth(store);
  if (!isAuthenticated) {
    window.location.href = "/";
  }
  
  // Fetch boards after successful auth
  toast.success('Fetching your boards...');
  await store.fetchUserBoards();
  await store.fetchUserSwipefeed();
}

if (store.token) {
  toast.success('Getting user data...');
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
  debugStore,
  mounted() {
    // Initialize page-specific functionality
    injectStyles();
    initCustomDropdown();
    search.start();
    
    // Fetch boards after initialization
    if (this.token) {
      this.fetchUserBoards();
      this.fetchUserSwipefeed();
    }
  }
});

export { app };