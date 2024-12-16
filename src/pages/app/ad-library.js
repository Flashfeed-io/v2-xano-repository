import { createApp, reactive } from "petite-vue";
import { StoreDebugger } from "/src/utils/storeDebugger.js";
import { WebflowFormComponent } from "/src/components/WebflowFormComponent.js";
import { toast } from "/src/utils/toastManager.js";
import { getUserData } from "/src/utils/userData.js";
import { injectStyles } from "/src/utils/injectStyles.js";

// A reactive store for user data
const store = reactive({
  user: {},
  token: localStorage.getItem('xanoToken') || '',
  activeFilterTab: "platform"
});

/*-----------------------------------------------------------------------------------------------------------------------------*/

window.addEventListener("DOMContentLoaded", () => {
  // Inject styles first
  injectStyles();

  // Check if required containers exist
  const requiredContainers = ['#genre-list', '#clear-refinements', '#searchbox', '#hits', '#poweredBy'];
  console.log('Checking for required containers');
  
  const missingContainers = requiredContainers.filter(selector => !document.querySelector(selector));
  if (missingContainers.length > 0) {
    console.error('Missing containers:', missingContainers);
    return;
  }
  
  console.log('All required containers found');

  // establish connection to search index with application ID and public api key from algolia
  const searchClient = algoliasearch(
    "JPENBJBFVG",
    "e52c4e233b34d3a2adc1dea827d0a9cf"
  );

  // Debug: Test the connection
  searchClient.search([
    {
      indexName: 'movie',
      params: {
        hitsPerPage: 1
      }
    }
  ]).then(response => {
    console.log('Algolia connection test:', response);
  }).catch(error => {
    console.error('Algolia connection error:', error);
  });

  const search = instantsearch({
    indexName: "movie",
    searchClient,
  });

  console.log('Initializing search with widgets');
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
    // Genre component
    instantsearch.widgets.refinementList({
      container: "#genre-list",
      attribute: "genres",
      cssClasses: {
        root: "ad-library_filter-max-height",
      },
      templates: {
        item: `
          <label class="w-checkbox form-checkbox">
            <div class="w-checkbox-input w-checkbox-input--inputType-custom form-checkbox-square{{#isRefined}} w--redirected-checked{{/isRefined}}"></div>
            <input type="checkbox" style="opacity:0;position:absolute;z-index:-1" value="{{label}}" {{#isRefined}}checked{{/isRefined}} />
            <span class="form-checkbox-label w-form-label">{{label}} ({{count}})</span>
          </label>
        `,
      },
    }),
    // Search component
    instantsearch.widgets.searchBox({
      container: document.querySelector("#searchbox"),
      placeholder: "Search anything",
      cssClasses: {
        input: "alg_form_field-search",
        resetIcon: "wf-search-reset",
      },
      showSubmit: false,
      showLoadingIndicator: false,
      searchAsYouType: true,
    }),
    // Powered by algolia logo component
    instantsearch.widgets.poweredBy({
      container: "#poweredBy",
      cssClasses: {
        root: "wf-powered-by",
      },
    }),
    // Hits component
    instantsearch.widgets.infiniteHits({
      container: document.querySelector("#hits"),
      cssClasses: {
        root: "wf-hits-root",
        list: "wf-hits-list",
        item: "wf-hit-item",
        emptyRoot: "wf-hit-empty",
      },
      transformItems(items) {
        console.log('Transform items called with:', items.length, 'items');
        return items;
      },
      templates: {
        item: `
<div class="alg_dashboard-area" id="{{slug}}" cc_score="{{score}}"><div class="alg_dashboard-block"><div class="alg_ad-library_hit-padding"><div class="alg_ad-library_hit-top"><div class="alg_hit-brand"><div class="alg_hit-brand-image-wrap"><img src="https://assets-global.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg" loading="lazy" alt="" class="alg_brand-image"></div><div><div class="alg_hit-brand-name">Brand</div><div class="div-block-641"><div class="subtext-11">{{slug}}</div></div></div></div><div class="div-block-639"><div class="div-block-640"></div><div class="div-block-640"></div><div class="div-block-640"></div><div class="div-block-640"></div></div><div data-hover="false" data-delay="0" class="alg_hit-dropdown w-dropdown" style=""><div class="alg_hit-dropdown-toggle w-dropdown-toggle" id="w-dropdown-toggle-2" aria-controls="w-dropdown-list-2" aria-haspopup="menu" aria-expanded="false" role="button" tabindex="0"><div class="icon-18 w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div></div><nav class="alg_hit-dropdown-menu w-dropdown-list" id="w-dropdown-list-2" aria-labelledby="w-dropdown-toggle-2"><div class="alg_hit-dropdown-menu-inner"><a href="/support" class="cc_dropdown__list-item w-inline-block" tabindex="0"><div class="icon_menu w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.7076 18.3639L11.2933 19.7781C9.34072 21.7308 6.1749 21.7308 4.22228 19.7781C2.26966 17.8255 2.26966 14.6597 4.22228 12.7071L5.63649 11.2929M18.3644 12.7071L19.7786 11.2929C21.7312 9.34024 21.7312 6.17441 19.7786 4.22179C17.826 2.26917 14.6602 2.26917 12.7076 4.22179L11.2933 5.636M8.50045 15.4999L15.5005 8.49994" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div><div class="pre">Get Link</div></a><a href="/support" class="cc_dropdown__list-item w-inline-block" tabindex="0"><div class="icon_menu w-embed"><svg width="82" height="72" viewBox="0 0 82 72" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32.6072 67.4858C32.675 68.5442 33.4252 69.4451 34.4694 69.7222C35.5141 69.9995 36.6185 69.5908 37.2109 68.7077L38.0118 67.5156C38.445 66.8698 39.1642 66.4636 39.9529 66.4193L41.4086 66.3375C42.4873 66.277 43.401 65.5458 43.6778 64.5226C43.9546 63.4994 43.5323 62.4137 42.6287 61.8271L41.4094 61.0352C40.7487 60.6063 40.3309 59.8984 40.2817 59.1245L40.1899 57.6954C40.1226 56.6372 39.3725 55.7363 38.3278 55.4591C37.2835 55.1819 36.1792 55.5906 35.5862 56.4736L34.7858 57.6658C34.3526 58.3117 33.6334 58.7178 32.8447 58.7621L31.3891 58.844C30.3104 58.9044 29.3967 59.6356 29.1199 60.6588C28.8431 61.682 29.2653 62.7677 30.1689 63.3544L31.3883 64.1462C32.0489 64.5752 32.4667 65.2831 32.5159 66.0569L32.6072 67.4858Z" fill="currentColor"></path>
<path d="M49.9925 30.9635C43.0818 40.6964 30.7671 48.4805 9.74231 49.1801C9.07366 51.5523 8.58047 53.7559 8.2467 55.6972C7.87031 57.8927 5.73096 59.3757 3.46962 59.0098C1.20805 58.6438 -0.319769 56.5677 0.0571213 54.3722C0.584071 51.303 1.44125 47.7611 2.66021 43.9934C5.6398 34.7849 10.8897 23.9003 19.1172 15.2475C27.4173 6.51828 38.8319 0 53.8156 0H57.967V4.02987C57.967 7.27423 58.3243 15.1451 52.75 17.7453L41.0344 21.775C39.5581 22.1591 38.6819 23.6322 39.0771 25.0654C39.4729 26.4986 40.9906 27.3491 42.4669 26.9651L51.9462 24.4995C52.756 24.2888 53.4421 25.1028 53.0658 25.8502C52.1994 27.5708 51.1832 29.2863 49.9925 30.9635Z" fill="currentColor"></path>
<path d="M69.4323 60.9992C67.9367 61.8545 66.0461 61.5567 64.9153 60.2875L62.0301 57.0495C61.0725 55.9747 59.5471 55.5787 58.1632 56.0456L53.9942 57.4522C52.3601 58.0035 50.5691 57.3456 49.715 55.8802C48.8609 54.4149 49.1812 52.5496 50.4802 51.4235L53.7945 48.5505C54.8947 47.5968 55.3111 46.0904 54.8503 44.7315L53.4618 40.6375C52.9176 39.0329 53.6024 37.2622 55.098 36.4069C56.5936 35.5517 58.4842 35.8495 59.615 37.1186L62.5001 40.3567C63.4579 41.4315 64.9831 41.8275 66.367 41.3606L70.5359 39.9541C72.1704 39.4026 73.9613 40.0605 74.8154 41.5258C75.6696 42.9912 75.3493 44.8565 74.0498 45.9828L70.7357 48.8556C69.6355 49.8093 69.2191 51.3158 69.68 52.6747L71.0685 56.7686C71.6127 58.3732 70.9278 60.144 69.4323 60.9992Z" fill="currentColor"></path>
</svg></div><div class="pre">Rewrite</div></a></div></nav></div></div></div><div class="alg_ad-library_hit-padding is--video"><video class="video" controls="" width="100%" src=""></video></div><div class="alg_ad-library_hit-padding"><div class="alg_hit-action-wrap"><div class="h-flexbox relative"><div class="button-outline is--board-save"><div>Pin to board</div></div><div class="form_field-icon-wrap is--board-save"><div class="icon_alg_pin w-embed"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.3767 15.6163L2.71985 21.2732M11.6944 6.64181L10.1335 8.2027C10.0062 8.33003 9.94252 8.39369 9.86999 8.44427C9.80561 8.48917 9.73616 8.52634 9.66309 8.555C9.58077 8.58729 9.49249 8.60495 9.31592 8.64026L5.65145 9.37315C4.69915 9.56361 4.223 9.65884 4.00024 9.9099C3.80617 10.1286 3.71755 10.4213 3.75771 10.7109C3.8038 11.0434 4.14715 11.3867 4.83387 12.0735L11.9196 19.1592C12.6063 19.8459 12.9497 20.1893 13.2821 20.2354C13.5718 20.2755 13.8645 20.1869 14.0832 19.9928C14.3342 19.7701 14.4294 19.2939 14.6199 18.3416L15.3528 14.6771C15.3881 14.5006 15.4058 14.4123 15.4381 14.33C15.4667 14.2569 15.5039 14.1875 15.5488 14.1231C15.5994 14.0505 15.663 13.9869 15.7904 13.8596L17.3512 12.2987C17.4326 12.2173 17.4734 12.1766 17.5181 12.141C17.5578 12.1095 17.5999 12.081 17.644 12.0558C17.6936 12.0274 17.7465 12.0048 17.8523 11.9594L20.3467 10.8904C21.0744 10.5785 21.4383 10.4226 21.6035 10.1706C21.7481 9.95025 21.7998 9.68175 21.7474 9.42348C21.6875 9.12813 21.4076 8.84822 20.8478 8.28839L15.7047 3.14526C15.1448 2.58543 14.8649 2.30552 14.5696 2.24565C14.3113 2.19329 14.0428 2.245 13.8225 2.38953C13.5705 2.55481 13.4145 2.91866 13.1027 3.64636L12.0337 6.14071C11.9883 6.24653 11.9656 6.29944 11.9373 6.34905C11.9121 6.39313 11.8836 6.43522 11.852 6.47496C11.8165 6.51971 11.7758 6.56041 11.6944 6.64181Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg></div></div></div><div id="w-node-_27854008-500a-4a73-005e-13791a8dd521-b3c6c4af" class="button-dark" cc_data="alg_save"><div class="button-icon w-embed"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m480-240-168 72q-40 17-76-6.5T200-241v-519q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v519q0 43-36 66.5t-76 6.5l-168-72Z"></path></svg></div><div>Save</div></div></div></div></div></div>
        `,
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

  console.log('Starting search');
  search.start();

  // Masonry initialization
  search.on("render", () => {
    console.log('Render event triggered');
    const hitsList = document.querySelector(".wf-hits-list");
    console.log("Hits list container:", hitsList);
    console.log("Hits container:", document.querySelector("#hits"));
    const msnry = new Masonry(hitsList, {
      itemSelector: ".wf-hit-item",
      percentPosition: false,
      horizontalOrder: true,
    });
    console.log("Checking -> : msnry", msnry);

    //if saved
    $(".alg_dashboard-area").each(function () {
      const slug = $(this).attr("id");
      const saveButton = $(this).find("[cc_data='alg_save']");
      console.log("Checking -> : saveButton", saveButton);

      const score = $(this).find("[cc_score]");
      console.log("Checking -> : score", score);

      //dummy array
      const mySavedAds = [
        "prey-for-the-devil",
        "my-policeman",
        "jerry-marge-go-large",
      ];
      console.log("Checking -> : mySavedAds", mySavedAds);

      //if saved
      if (mySavedAds.includes(slug)) {
        console.log("Checking -> : inaside slug saved");
        $(this).addClass("cc_request");
      }
      //if not saved
    });
  });

  search.helper.on("result", function (res) {
    console.log('Search results received:', res.nbHits, 'hits');
    const emptyBlock = document.querySelector("#cc_empty-state");
    if (res && res.hits && res.hits.length > 0) {
      emptyBlock.style.display = "block";
    } else {
      emptyBlock.style.display = "none";
    }
  });

  // hide loader in Webflow after initiating algolia
  const loader = document.querySelector("[data-cc='loader']");
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
  }, 2000);

  // alternative to ix2
  $(document).ready(function () {
    function openDropdown(dropdownToggle, dropdownMenu) {
      console.log("Opening dropdown");
      console.log("Dropdown toggle:", dropdownToggle);
      console.log("Dropdown menu:", dropdownMenu);

      // Close all other dropdowns first
      $(".alg_hit-dropdown-toggle").not(dropdownToggle).removeClass("w--open");
      $(".alg_hit-dropdown-menu")
        .not(dropdownMenu)
        .each(function () {
          console.log("Closing other dropdown:", $(this));
          $(this).removeClass("w--open").css({
            transform: "translate3d(0px, 8px, 0px) scale3d(0.7, 0.7, 1)",
            opacity: "0",
          });
          setTimeout(() => $(this).hide(), 300); // Delay to match CSS transition duration
        });

      $(".alg_hit-dropdown")
        .not(dropdownToggle.closest(".alg_hit-dropdown"))
        .css("z-index", "");

      // Open the clicked dropdown
      dropdownToggle.addClass("w--open");
      dropdownMenu.show(); // Ensure the menu is visible
      setTimeout(function () {
        console.log("Adding w--open to dropdown menu:", dropdownMenu);
        dropdownMenu.addClass("w--open").css({
          transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1)",
          opacity: "1",
        });
      }, 10); // Small delay to trigger CSS transition
      dropdownToggle.closest(".alg_hit-dropdown").css("z-index", "901");
    }

    function closeDropdown(dropdownToggle, dropdownMenu) {
      console.log("Closing dropdown");
      console.log("Dropdown toggle:", dropdownToggle);
      console.log("Dropdown menu:", dropdownMenu);

      dropdownToggle.removeClass("w--open");
      dropdownMenu.removeClass("w--open");
      setTimeout(function () {
        dropdownMenu.css({
          transform: "translate3d(0px, 8px, 0px) scale3d(0.7, 0.7, 1)",
          opacity: "0",
        });
        setTimeout(() => {
          console.log("Hiding dropdown menu:", dropdownMenu);
          dropdownMenu.hide();
        }, 300); // Delay to match CSS transition duration
      }, 10);
      dropdownToggle.closest(".alg_hit-dropdown").css("z-index", "");
    }

    // Click event on the dropdown toggle to open/close the dropdown
    $(document).on("click", ".alg_hit-dropdown-toggle", function (event) {
      event.stopPropagation();
      console.log("Dropdown toggle clicked:", $(this));
      const dropdownToggle = $(this);
      const dropdownMenu = dropdownToggle.next(".alg_hit-dropdown-menu");
      if (dropdownMenu.hasClass("w--open")) {
        closeDropdown(dropdownToggle, dropdownMenu);
      } else {
        openDropdown(dropdownToggle, dropdownMenu);
      }
    });

    // Click event outside the dropdown to close it
    $(document).on("click", function () {
      console.log("Click outside dropdown detected");
      $(".alg_hit-dropdown-toggle").each(function () {
        const dropdownToggle = $(this);
        const dropdownMenu = dropdownToggle.next(".alg_hit-dropdown-menu");
        if (dropdownMenu.hasClass("w--open")) {
          console.log("Closing dropdown from outside click:", dropdownMenu);
          closeDropdown(dropdownToggle, dropdownMenu);
        }
      });
    });

    // Prevent click event on the dropdown menu from closing it
    $(document).on("click", ".alg_hit-dropdown-menu", function (event) {
      event.stopPropagation();
      console.log("Click inside dropdown menu:", $(this));
    });
  });

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
