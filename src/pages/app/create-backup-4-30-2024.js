import { $fetch } from "ohmyfetch";
import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";
import Quill from "quill";
import { Datepicker } from "vanillajs-datepicker";
import {
  findGenrePromptById,
  findAdPurposePromptById,
} from "../../prompt_config";

const quillOptions = {
  theme: "snow",
  modules: {
    toolbar: [
      ["bold", "italic"], // Bold and italic
      [{ list: "ordered" }, { list: "bullet" }], // Ordered and bullet lists
    ],
  },
  // placeholder: 'This is a placeholder', // You can set a default or leave this out
};

MemberStack.onReady.then(function (member) {
  store.member_id = member.id;
  console.log("Checking -> : vue ms test", store.member_id);
});

// Function to create a new Quill editor with a custom placeholder
function createQuillEditor(selector, placeholderText) {
  // Clone the quillOptions to avoid mutations
  const options = { ...quillOptions, placeholder: placeholderText };
  return new Quill(selector, options);
}

// Now create each editor with a custom placeholder
const editorStyleDescription = createQuillEditor(
  "#editorStyleDescription",
  "Describe the style..."
);
const editorBrandServiceOrProduct = createQuillEditor(
  "#editorBrandServiceOrProduct",
  `e.g. Apple sells premium phones and computers. It is known for a high attention to detail, polish, and user experience. The target audience is consumers who value style and simplicity in their tech, including young adults and professionals willing to pay more for top-notch quality.`
);
const editorBrandIdentityOrMessage = createQuillEditor(
  "#editorBrandIdentityOrMessage",
  "What is your brand identity or message..."
);
s;
const editorBrandTopicsToHighlight = createQuillEditor(
  "#editorBrandTopicsToHighlight",
  "Optionally, add your own unique ideas or instructions."
);

const editorScriptGPTPrompt = createQuillEditor(
  "#editorScriptGPTPrompt",
  "Optionally, add your own unique ideas or instructions."
);

const editorDescription = createQuillEditor(
  "#editorDescription",
  "Add a description for your job board post."
);
console.log("this is the new one");

// Ad concept
const editorCreativePrompt = createQuillEditor(
  "#editorCreativePrompt",
  "Write a concept for your brand"
);

// Ad script
const editorScript = createQuillEditor(
  "#editorScript",
  "Optionally, use the GPT Prompt to give custom instructions for the AI Writer"
);
// Ad logistics
const editorGearAndLegal = createQuillEditor(
  "#editorGearAndLegal",
  "Plan your budget and other requirements"
);

const elStartDate = document.querySelector('[cc_data="cc_startDate"]');
elStartDate.addEventListener("changeDate", (event) => {
  store.fields.start_date = event.detail.date;
});
const startDatePicker = new Datepicker(elStartDate, {});

// new start 2
const elStartDate2 = document.querySelector('[cc_data="cc_startDate2"]');
elStartDate2.addEventListener("changeDate", (event) => {
  store.fields.start_date = event.detail.date;
});
const startDatePicker2 = new Datepicker(elStartDate2, {});

const elDueDate = document.querySelector('[cc_data="cc_deliveryDate"]');
elDueDate.addEventListener("changeDate", (event) => {
  store.fields.due_date = event.detail.date;
});
const dueDatePicker = new Datepicker(elDueDate, {});

// new delivery 2
const elDueDate2 = document.querySelector('[cc_data="cc_deliveryDate2"]');
elDueDate2.addEventListener("changeDate", (event) => {
  store.fields.due_date = event.detail.date;
});
const dueDatePicker2 = new Datepicker(elDueDate2, {});

$("#deliverable_1").val("4K Video");
$("#deliverable_1")
  .siblings("label")
  .find(".form-checkbox-square")
  .addClass("w--redirected-checked");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

//clone functionality code
$(document).ready(function () {
  //client side validation

  $("[deliverable-1-seconds=true]").on("input change", function (event) {
    var originalValue = $(this).val();
    // Remove any non-numeric characters
    var cleanedValue = originalValue.replace(/[^0-9]/g, "");

    // If the original value is empty, allow the field to be empty
    if (originalValue === "") {
      return;
    }

    // Convert the cleaned value to a number
    var value = parseInt(cleanedValue, 10);

    // If the value is greater than 120, set it to 120
    if (value > 120) {
      $(this).val(120);
      store.fields.deliverable_1_seconds = 120;
    } else if (!isNaN(value)) {
      // Update the field with the numeric value
      $(this).val(value);
      store.fields.deliverable_1_seconds = value;
    }
  });

  const fieldTitle = $("#cc_title");
  store.fields.title = fieldTitle.val();

  const fieldLocation = $("#cc_location");
  store.fields.location = fieldLocation.val();

  //public project toggle radio code
  $("input[type='radio'][name='cc_public-workspace']").change(function () {
    var $wrapper = $(this).parent(".cc_radio_select-wrap");
    $wrapper.addClass("cc_is--selected-white");
    $wrapper
      .siblings(".cc_radio_select-wrap")
      .removeClass("cc_is--selected-white");

    // Remove 'is--white' class from all 'tooltip_inner' elements
    //$(".cc_radio_select-wrap").find(".tooltip_inner").removeClass("is--white");

    if ($(this).val() === "Private") {
      store.fields.workspace = "Private";
      //$wrapper.find(".tooltip_inner").addClass("is--white");
      //$wrapper.siblings().find(".tooltip_inner").removeClass("is--white");
    } else {
      store.fields.workspace = "Under Review";
      //$wrapper.find(".tooltip_inner").addClass("is--white");
      //$wrapper.siblings().find(".tooltip_inner").removeClass("is--white");
    }

    toggleVisibility();
  });

  // Find the first label in the group of cc_public-workspace
  let publicWorkspaceRadios = $(
    "input[type='radio'][name='cc_public-workspace']"
  )
    .first()
    .closest("label");

  // Add the w--redirected-checked class to its first child element
  publicWorkspaceRadios.find(":first-child").addClass("w--redirected-checked");

  function toggleVisibility() {
    if (store.fields.workspace === "Under Review") {
      $('[public-enabled="false"]').hide();
      $('[public-enabled="true"]').show();

      fieldTitle.val("Video Advertisement");
      store.fields.title = "Video Advertisement";
      fieldLocation.val("Worldwide");
      store.fields.location = "Worldwide";

      // Make cc_startDate and cc_deliveryDate required
      $('[cc_data="cc_startDate2"]').attr("required", true);
      $('[cc_data="cc_deliveryDate2"]').attr("required", true);
      $('[cc_data="cc_startDate"]').removeAttr("required");
      $('[cc_data="cc_deliveryDate"]').removeAttr("required");
    } else {
      $('[public-enabled="false"]').show();
      $('[public-enabled="true"]').hide();

      // Remove for when Private is selected
      $('[cc_data="cc_startDate2"]').removeAttr("required");
      $('[cc_data="cc_deliveryDate2"]').removeAttr("required");
      $('[cc_data="cc_startDate"]').attr("required", true);
      $('[cc_data="cc_deliveryDate"]').attr("required", true);
    }
  }

  // Initial visibility set
  toggleVisibility();
  /*
  //public project toggle radio code
  $("input[type='radio'][name='cc_aspect-ratio']").change(function () {
    let $wrapper = $(this).parent(".cc_radio_select-wrap");
    $wrapper.addClass("cc_is--selected-white");
    $wrapper
      .siblings(".cc_radio_select-wrap")
      .removeClass("cc_is--selected-white");

    if ($(this).val() === "1792x1024") {
      store.fields.storyboardAspectRatio = "1792x1024";
    } else {
      store.fields.storyboardAspectRatio = "1024x1792";
    }
  });
  */

  // Find the first label in the group of cc_public-workspace
  let aspectRatioRadios = $("input[type='radio'][name='cc_aspect-ratio']")
    .first()
    .closest("label");

  // Add the w--redirected-checked class to its first child element
  aspectRatioRadios.find(":first-child").addClass("w--redirected-checked");

  const urlParams = new URLSearchParams(window.location.search);
  const cloneParam = urlParams.get("clone");
  const checkLocalStorageExists = localStorage.getItem("recordid");

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  // ⬇️⬇️⬇️ clone values from clone video button
  if (cloneParam && checkLocalStorageExists) {
    let translateGenre = localStorage.getItem("genre-airtable-id");
    store.fields.genre = translateGenre;
    // Clone parameter exists, utilize local storage values
    $("[cloneable-video-url=true]").css({
      "pointer-events": "none",
      opacity: "0.6",
      display: "none",
    });
    const cloneValue = localStorage.getItem("video");
    $("[video-inspiration-1=true]").val(cloneValue);

    function decodeHtmlEntities(text) {
      // Create a textarea element to utilize its innerHTML functionality for decoding
      var textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    }

    const cloneTitle = localStorage.getItem("title");

    // Decode HTML entities and set the text safely
    $("#cc_clone-title").text(decodeHtmlEntities(cloneTitle));
    /*  
    const cloneTitle = localStorage.getItem("title");
    $("#cc_clone-title").text(cloneTitle);
*/
    const cloneRecordID = localStorage.getItem("recordid");
    $("#video_inspiration_airtable_record_id").val(cloneRecordID);
    store.fields.video_inspiration_airtable_record_id = [cloneRecordID];

    const cloneLength = localStorage.getItem("ad_length");
    $("[deliverable-1-seconds=true]").val(cloneLength);
    // $("[deliverable-1-seconds=true]").addClass("cc_cloned");
    store.fields.deliverable_1_seconds = cloneLength;

    const cloneDeliverable1 = localStorage.getItem("deliverable_1");
    $("[deliverable_1=true]").val(cloneDeliverable1);
    //why doesnt this work with deliverable_1=true..?
    //$("#deliverable_1").addClass("cc_cloned");
    store.fields.deliverable_1 = cloneDeliverable1;
    $("#deliverable_1")
      .siblings("label")
      .find(".form-checkbox-square")
      .addClass("w--redirected-checked");

    const cloneScript = localStorage.getItem("script");
    //$("#cc_script").val(cloneScript);
    store.fields.inspiration_script = cloneScript;

    const cloneSummary = localStorage.getItem("summary");
    store.fields.inspiration_summary = cloneSummary;

    const clonePitch = localStorage.getItem("pitch");
    store.fields.inspiration_pitch = clonePitch;

    // 🟠🟠🟠🟠🟠🟠 this is the problem
    const cloneThumbnail = localStorage.getItem("videoimg");
    if (cloneThumbnail) {
      const thumbnailElement = $("#cc_inspiration-thumbnail");
      thumbnailElement.attr("src", cloneThumbnail);
      $("#cc_no-inspiration").hide();
    }

    const cloneBudget = localStorage.getItem("budget");
    $("[import-budget=true]").val(cloneBudget);
    //$("[import-budget=true]").addClass("cc_cloned");
    store.fields.budget = cloneBudget;

    //$(".is--cc_imported-details").remove();

    //
    //
    //
    //
    //
    //genre dropdown
    let cloneGenre = localStorage.getItem("genre-airtable-id");
    store.fields.genre = cloneGenre;
    console.log("clonegenre is " + cloneGenre);
    let optionGenre = $("#cc_genre")
      .find("option[value='" + cloneGenre + "']")
      .filter(":first");
    console.log("optionGenre is " + optionGenre);
    let genreText = optionGenre.text();
    console.log("genreText is " + genreText);
    let genreDropdown = $('.w-dropdown-link:contains("' + genreText + '")');
    console.log("genreDropdown is" + genreDropdown);
    const clickGenre = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    console.log("clickGenre is " + clickGenre);
    // Dispatch the click event
    genreDropdown.get(0).dispatchEvent(clickGenre);
    //$("#cc_clonedGenre").addClass("cc_cloned");
    console.log(cloneGenre);

    //
    //
    //
    //
    //
    //
    //
    //purpose dropdown
    let clonePurpose = localStorage.getItem("adpurpose-airtable-id");
    //console.log(clonePurpose + " is clonePurpose");
    console.log("clonePurpose " + clonePurpose);
    store.fields.ad_purpose = clonePurpose;
    let optionPurpose = $("[cc_data='ad-purpose']")
      .find("option[value='" + clonePurpose + "']")
      .filter(":first");
    //console.log(optionPurpose + " is optionPurpose");
    console.log("optionPurpose ", optionPurpose);
    let purposeText = optionPurpose.text();
    console.log("purposeText:", purposeText);
    console.log(
      "purposeDropdown selector result:",
      $('.w-dropdown-link:contains("' + purposeText + '")')
    );

    let purposeDropdown = $('.w-dropdown-link:contains("' + purposeText + '")');
    //console.log(purposeDropdown " is purposeDropdown");
    console.log("purposeDropdown ", purposeDropdown);
    const clickPurpose = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    console.log("Before dispatching click event for purposeDropdown");
    // Dispatch the click event
    purposeDropdown.get(0).dispatchEvent(clickPurpose);
    //$("#cc_clonedPurpose").addClass("cc_cloned");
    console.log("After dispatching click event for purposeDropdown");

    //
    //
    //
    // clone date
    //$("#cc_startDate").addClass("cc_cloned");
    //$("#cc_deliveryDate").addClass("cc_cloned");
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    // Style keywords checkboxes clone
    //$("#cc_clonedStyles").addClass("cc_cloned");

    const cloneStylesString = localStorage.getItem(
      "style-keywords-airtable-id"
    );
    const cloneStylesArray = cloneStylesString
      ? cloneStylesString.split(",")
      : [];

    console.log("cloneStylesString from localStorage:", cloneStylesString);
    console.log("cloneStylesArray from localStorage:", cloneStylesArray);

    let stylesCheckboxes = [];

    // Function to check if checkboxes are available and perform actions
    function checkAndHandleCheckboxes() {
      stylesCheckboxes = document.querySelectorAll(".is--cc_clonestyle");

      if (stylesCheckboxes.length > 0) {
        clearInterval(checkInterval);

        const selectedStyleKeywordsArray = [];

        console.log("stylesCheckboxes from localStorage:", stylesCheckboxes);

        for (var index = 0; index < stylesCheckboxes.length; index++) {
          const checkbox = stylesCheckboxes[index];
          const checkboxValue = checkbox.nextElementSibling.value;

          console.log("Checkbox Value:", checkboxValue);

          if (cloneStylesArray.includes(checkboxValue)) {
            // Set the checkbox as checked
            $(checkbox).click();

            console.log("Checkbox checked:", checkboxValue);

            // Add the value to the selectedStyleKeywords array
            selectedStyleKeywordsArray.push(checkboxValue);

            console.log("Added to selectedStyleKeywords:", checkboxValue);
          }
        }

        // Update the style_keywords property in your store with the selected values
        store.style_keywords = selectedStyleKeywordsArray;

        console.log("Updated style_keywords in store:", store.style_keywords);
      }
    }

    // Check every 1 second until checkboxes are available
    const checkInterval = setInterval(checkAndHandleCheckboxes, 1000);
  } else {
    // Clone parameter does not exist, remove local storage values
    localStorage.removeItem("video");
    localStorage.removeItem("recordid");
    localStorage.removeItem("ad_length");
    localStorage.removeItem("videoimg");
    localStorage.removeItem("adpurpose-airtable-id");
    localStorage.removeItem("genre-airtable-id");
    localStorage.removeItem("script");
    localStorage.removeItem("title");
    localStorage.removeItem("deliverable_1");
    localStorage.removeItem("budget");
    localStorage.removeItem("style-keywords-airtable-id");
    localStorage.removeItem("summary");
    localStorage.removeItem("pitch");

    $("#cc_preview-inspiration").remove();
    $(".is--cc_cloned-pill").remove();
  }
});

const store = reactive({
  member_id: "",
  isReadyRateConcept: false,
  isReadyRateScript: false,
  canGenerate: false,
  creativeStyles: [],
  coverImagePreviewUrl: "",
  videoFilePreviewURL: "",
  isWorldwide: false,
  startDateAsap: false,
  dueDateAsap: false,
  isAIWorking: false,
  isInsightsResearching: false,
  isRateMyWorking: false,
  isCreatingWorkspace: false,
  storyboardStatus: "NotStarted",
  importStatus: "NotStarted",
  importThumbnail: "",
  storyboardNumberOfShots: "",
  storyboardNumberOfScenes: "",
  fields: {
    isWriterValidationBar: 0,
    chosenPremise: "",
    insightsTab: "Premises",
    jsonInsights: "",
    memberstack_id: "",
    workspace: "Private",
    title: "Video Advertisement",
    location: "Worldwide",
    budget: "",
    deliverable_1: "4K Video",
    deliverable_1_seconds: "",
    services: [],
    deliverable_2: "",
    deliverable_3: "",
    deliverable_4: "",

    videoFile: [],

    video_inspo: [""],
    video_inspiration_airtable_record_id: [],
    image_inspo: [],
    importJobId: "",
    inspiration_script: "",
    inspiration_summary: "",
    inspiration_pitch: "",

    brand_name: "",
    genre: "",
    genre_prompt: "",
    style_keywords: [],
    ad_purpose: "",
    style_description: "",
    brand_target_audience: "",
    brand_service_or_product: "",
    brand_identity_or_message: "",
    brand_topics_to_highlight: "",

    rewrite_prompt: "",
    rewrite_selected: "",

    start_date: new Date(),
    due_date: new Date(),
    description: "",
    creative_prompt: "",
    rateMyConcept: "",
    rateMyScript: "",
    script: "",
    gear_and_legal: "",
    storyboardJSON: "",
    storyboardJobId: "",
    storyboardAspectRatio: "1792x1024",

    tier: "recXWLp6CM9bxcXvi",
    cover_image: [],
    attachments: [],

    showRewritePrompt: false,
    rewritePrompt: "",
    rewriteSelectionStart: null,
    rewriteSelectionLength: 0,
  },
});

async function userAnalytics(
  tokens,
  conceptWrittenPlus,
  scriptWrittenPlus,
  storyboardsMade
) {
  const response = await fetch(
    `https://x8ki-letl-twmt.n7.xano.io/api:QLDf95Yy/user-analytics/` +
      store.member_id,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // This line is important
        Authorization: "Bearer " + MemberStack.getToken(),
      },
      body: JSON.stringify({
        ai_tokens: tokens,
        concepts_written: conceptWrittenPlus,
        scripts_written: scriptWrittenPlus,
        storyboards_made: storyboardsMade,
      }),
    }
  );

  // Check if the response was not ok (i.e., HTTP status code outside the range 200-299)
  if (!response.ok) {
    // You can throw an error with the status text or handle it in another way
    throw new Error(
      `HTTP error! status: ${response.status} ${response.statusText}`
    );
  }

  // Assuming the response is ok, convert it to JSON
  const data = await response.json();
  // You can return this data or handle it depending on your application's logic
  return data;
}

function keywordText() {
  const count = store.fields.style_keywords.length;
  if (count === 1) {
    return "1 Keyword Selected"; // Singular
  } else if (count > 1) {
    return `${count} Keywords Selected`; // Plural
  } else {
    return "No Keywords Selected"; // None
  }
}

$(document).ready(function () {
  $("[cc_data='scene-input'], [cc_data='shot-input']")
    .on("input blur", function () {
      var value = $(this).val();

      // Replace non-digit characters
      var numericValue = value.replace(/[^\d]/g, "");

      // Determine the max value based on the cc_data attribute
      var maxValue = $(this).attr("cc_data") === "scene-input" ? 6 : 15;

      // Check the numeric range
      if (numericValue === "" || numericValue < 1 || numericValue > maxValue) {
        console.log(
          `Checking -> Value must be a number between 1 and ${maxValue}.`
        );
        $(this).val("");
      } else {
        $(this).val(numericValue);
      }
    })
    .on("copy paste", function (event) {
      event.preventDefault();
      console.log("Checking -> Copy and paste actions are not allowed.");
    });
});

const flattenFields = (obj, parentKey = "") => {
  Object.keys(obj).forEach((key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key]) &&
      !(obj[key] instanceof Date)
    ) {
      flattenFields(obj[key], fullKey);
    } else {
      console.log(`${fullKey}:`, obj[key]);
    }
  });
};

const logAll = () => {
  s;
  for (const key in store) {
    if (key === "fields") {
      flattenFields(store[key], key);
    } else {
      console.log(`${key}:`, store[key]);
    }
  }
};

const premiseClick = () => {
  setTimeout(() => {
    console.log("Checking -> premiseClick:");

    const newPurpose = store.fields.chosenPremise[5];
    console.log("Checking -> newPurpose:", newPurpose);
    const newGenre = store.fields.chosenPremise[6];
    console.log("Checking -> newGenre:", newGenre);

    store.fields.ad_purpose = newPurpose;
    store.fields.genre = newGenre;
  }, 100);
};

const getCreativeStyles = async () => {
  const response = await fetch(
    "https://live.api-server.io/run/v1/63247325f53f9b56f2a69a16",
    {
      method: "GET",
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const getCreativeStyleTextArrayByIds = (ids) => {
  return ids.map((id) => {
    const item = store.creativeStyles.find((item) => item.id === id);
    return item ? item.text : null;
  });
};

const tryImportAgain = () => {
  store.importStatus = "";
};

//
//
// ⚡ import video ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const analyzeVideo = async (event) => {
  console.log(event);
  // extract the event handler button and find the attributes to send their values as the inputs for the fetch
  store.importStatus = "Analyzing";

  const response = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:asT3vkWc/import",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // This line is important
        Authorization: "Bearer " + MemberStack.getToken(),
      },
      body: JSON.stringify({
        inputVideoFile: store.fields.videoFile[0].url,
      }),
    }
  );

  if (!response.ok) {
    store.importStatus = "Error";
  }

  console.log("My Response Log for import:", response);
  const data = await response.json(); // Parse the JSON in the response
  console.log("Job ID:", data.job_id); // Access the job_id from the parsed data
  store.importJobId = data.job_id;
  checkPingImport(data.job_id);
};

// ping import video ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const checkPingImport = async (job_id) => {
  console.log(
    "Calling the fetch for checkPingImport Function, here is the job id:",
    job_id
  );
  const response = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:asT3vkWc/import/ping/" + job_id,
    {
      method: "GET",
    }
  );

  const data = await response.json(); // Parse the JSON in the response
  console.log("import video summary:", data.summary); // Access the job_id from the parsed data

  if (data.string_status == "Analyzing") {
    store.importStatus = "Analyzing";
    setTimeout(() => {
      checkPingImport(job_id);
      console.log("rerunning checkPingImport function");
      store.fields.inspiration_summary = data.summary;
      store.importThumbnail = data.thumbnail; //maybe can get humbnail earlier
      $("[deliverable-1-seconds=true]").val(data.duration);
      console.log("current summary result:", data.summary); // Access the job_id from the parsed data
    }, 15000);
  } else if (data.string_status == "Writing") {
    store.importStatus = "Writing";
    setTimeout(() => {
      checkPingImport(job_id);
      console.log("rerunning checkPingImport function");
      store.fields.inspiration_summary = data.summary;
      store.importThumbnail = data.thumbnail; //maybe can get humbnail earlier
      $("[deliverable-1-seconds=true]").val(data.duration);
      console.log("current summary result:", data.summary); // Access the job_id from the parsed data
    }, 15000);
  } else if (data.string_status == "Ready") {
    console.log("Checking -> entered ready loop:", data.string_status);
    store.importStatus = "Ready";
    store.fields.inspiration_summary = data.summary;
    store.fields.inspiration_script = data.script;
    $("[deliverable-1-seconds=true]").val(data.duration);
    //$("[deliverable-1-seconds=true]").addClass("cc_cloned");
    store.fields.deliverable_1_seconds = data.duration;
    store.importThumbnail = data.thumbnail;
    $("[cc_data=remove-after-import]").remove();
    $(".uploadcare--widget__text:first").remove();
    $('[upload-field-name="videoFile"]').css("pointer-events", "inherit");
  } else if (data.string_status == "Error") {
    console.log("Checking -> entered error loop:", data.string_status);
    store.importStatus = "Error";
  }
};

const researchInsights = async () => {
  store.isInsightsResearching = true;

  return new Promise(async (resolve, reject) => {
    console.log("Calling the researchInsights function");

    //align logic with function stack in xnao
    let currentJsonInsights;
    if (store.fields.jsonInsights == "") {
      currentJsonInsights = {};
    } else {
      //if regenerating Premises
      store.fields.chosenPremise = "";
      store.fields.genre = "";
      store.fields.ad_purpose = "";
      store.fields.jsonInsights.premises = [];
      currentJsonInsights = store.fields.jsonInsights;
    }

    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:ZUu16G-Q/insights",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputBrandName: store.fields.brand_name,
          inputBrandDescription: store.fields.brand_service_or_product,
          inputBudget: store.fields.budget,
          inputDuration: store.fields.deliverable_1_seconds,
          inputGptPrompt: store.fields.brand_topics_to_highlight,
          inputAdPurpose: store.fields.ad_purpose,
          inputGenre: store.fields.genre,
          inputInspirationSummary: store.fields.inspiration_summary,
          inputInspirationScript: store.fields.inspiration_script,
          inputJsonInsights: currentJsonInsights,
        }),
      }
    ).catch(reject);

    if (!response.ok) {
      store.isAIWorking = false;
      store.isInsightsResearching = false;
      //store.fields.jsonInsights = "";
      reject("Failed to fetch insights");
    }

    const data = await response.json(); // Parse the JSON in the response

    store.fields.jsonInsights = data;
    if (!store.fields.inspiration_summary) {
      store.fields.chosenPremise = store.fields.jsonInsights.premises[0];
    }
    store.isInsightsResearching = false;
    resolve(data);
  });
};

// ⚡ rate ad ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const rateMyConcept = async (event) => {
  store.isRateMyWorking = true;
  console.log(event);

  // Extract the event handler button and find the attributes to send their values as the inputs for the fetch
  const button = event.target;
  console.log("button: ", button);
  const action = button.getAttribute("data-action"); // Use getAttribute instead of attr
  console.log("action: ", action);

  try {
    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:ZUu16G-Q/rate-concept",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputBudget: store.fields.budget,
          inputDeliverable_1_seconds: store.fields.deliverable_1_seconds,
          //inputConcept: editorCreativePrompt.getText().trim(),
          inputScript: editorScript.getText().trim(),
          inputAction: action,
        }),
      }
    );

    const data = await response.json();
    console.log("jsondata for rateMyConcept:", data);

    // Update the store with the response data
    store.fields.rateMyConcept = data;

    // Update element colors
    updateElementColorsConcept();
  } catch (error) {
    console.error("Error in rateMyConcept:", error);
  } finally {
    store.isRateMyWorking = false;
  }
};

// Function to update the color of elements
const updateElementColorsConcept = () => {
  // Function to determine color based on value
  const determineColorConcept = (value) => {
    if (value >= 60) return "#2cc32c"; // green
    if (value >= 40 && value < 60) return "#ffab4c"; // orange
    return "#f56780"; // red
  };

  // Updating colors for each element
  store.fields.rateMyConcept.roiColor = determineColorConcept(
    store.fields.rateMyConcept.roiSum
  );
  store.fields.rateMyConcept.impactColor = determineColorConcept(
    store.fields.rateMyConcept.impactSum
  );
};

// ⚡ rate ad ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const rateMyScript = async (event) => {
  store.isRateMyWorking = true;

  console.log(event);

  // Extract the event handler button and find the attributes to send their values as the inputs for the fetch
  const button = event.target;
  console.log("button: ", button);
  const action = button.getAttribute("data-action"); // Use getAttribute instead of attr
  console.log("action: ", action);

  try {
    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:ZUu16G-Q/rate-concept",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputBudget: store.fields.budget,
          inputDeliverable_1_seconds: store.fields.deliverable_1_seconds,
          // inputConcept: editorCreativePrompt.getText().trim(),
          inputScript: editorScript.getText().trim(),
          inputAction: action,
        }),
      }
    );

    const data = await response.json();
    console.log("jsondata for rateMyScript:", data);

    // Update the store with the response data
    store.fields.rateMyScript = data;

    // Update element colors
    updateElementColorsScript();
  } catch (error) {
    console.error("Error in rateMyScript:", error);
  } finally {
    store.isRateMyWorking = false;
  }
};

// Function to update the color of elements
const updateElementColorsScript = () => {
  // Function to determine color based on value
  const determineColorScript = (value) => {
    if (value >= 60) return "#2cc32c"; // green
    if (value >= 40 && value < 60) return "#ffab4c"; // orange
    return "#f56780"; // red
  };

  store.fields.rateMyScript.roiColor = determineColorScript(
    store.fields.rateMyScript.roiSum
  );
  store.fields.rateMyScript.impactColor = determineColorScript(
    store.fields.rateMyScript.impactSum
  );
  store.fields.rateMyScript.writingColor = determineColorScript(
    store.fields.rateMyScript.writingSum
  );
  store.fields.rateMyScript.engagementColor = determineColorScript(
    store.fields.rateMyScript.engagementSum
  );
};

function formatAdPurposeNumber(adPurposeId) {
  console.log("Checking -> adpurposeid from formatadpurpose:", adPurposeId);
  if (adPurposeId === "recSL0G465hfpRlAp") {
    console.log("Checking -> inside conversion");
    return 1; // Conversion
  } else if (adPurposeId === "recIPzH0T1hBToyNd") {
    console.log("Checking -> inside branding");
    return 2; // Branding
  } else {
    return 0; // Unknown or unsupported genreId
  }
}

function formatGenreNumber(genreId) {
  if (genreId === "recUwlOLieavOnhx9") {
    return 1; // Voicover
  } else if (genreId === "recOMHeS0Z0EChZW3") {
    return 2; // Talking Head Video
  } else if (genreId === "recwG47UUEjtJYWkX") {
    return 3; // Story or SKit
  } else if (genreId === "recaQfNcuczafnjS2") {
    return 4; // Visual Reel
  } else {
    return 0; // Unknown or unsupported genreId
  }
}

//
//
// ⚡ concept writer ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const generateCreativePrompt = async () => {
  store.isAIWorking = true;

  if (store.fields.jsonInsights === "") {
    // Wait for the researchInsights function to complete
    await researchInsights().catch((error) => {
      console.error("Failed to fetch insights:", error);
      // Handle the error (e.g., set an error message in your UI)
    });
  }

  if (!store.fields.genre) {
    //genre dropdown
    let cloneGenre = store.fields.chosenPremise[6];
    store.fields.genre = cloneGenre;
    console.log("clonegenre is " + cloneGenre);
    let optionGenre = $("#cc_genre")
      .find("option[value='" + cloneGenre + "']")
      .filter(":first");
    console.log("optionGenre is " + optionGenre);
    let genreText = optionGenre.text();
    console.log("genreText is " + genreText);
    let genreDropdown = $('.w-dropdown-link:contains("' + genreText + '")');
    console.log("genreDropdown is" + genreDropdown);
    const clickGenre = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    console.log("clickGenre is " + clickGenre);
    // Dispatch the click event
    genreDropdown.get(0).dispatchEvent(clickGenre);
    //$("#cc_clonedGenre").addClass("cc_cloned");
    console.log(cloneGenre);
  }

  if (!store.fields.ad_purpose) {
    //purpose dropdown
    let clonePurpose = store.fields.chosenPremise[5];
    console.log("clonePurpose " + clonePurpose);
    store.fields.ad_purpose = clonePurpose;
    console.log("Checking -> : store of ad purpose", store.fields.ad_purpose);
    let optionPurpose = $("[cc_data='ad-purpose']")
      .find("option[value='" + clonePurpose + "']")
      .filter(":first");
    console.log("optionPurpose ", optionPurpose);
    let purposeText = optionPurpose.text();
    console.log("purposeText:", purposeText);
    console.log(
      "purposeDropdown selector result:",
      $('.w-dropdown-link:contains("' + purposeText + '")')
    );

    let purposeDropdown = $('.w-dropdown-link:contains("' + purposeText + '")');
    //console.log(purposeDropdown " is purposeDropdown");
    console.log("purposeDropdown ", purposeDropdown);
    const clickPurpose = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    console.log("Before dispatching click event for purposeDropdown");
    // Dispatch the click event
    purposeDropdown.get(0).dispatchEvent(clickPurpose);
    //$("#cc_clonedPurpose").addClass("cc_cloned");
    console.log("After dispatching click event for purposeDropdown");
  }

  console.log("about to api call for concept");
  const response = await fetch(
    "https://dev.api-server.io/run/v1/645a5a18ac05f887e8ac410f",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken(),
      },
      body: JSON.stringify({
        location: store.fields.location,
        budget: store.fields.budget,
        deliverable_1_seconds: store.fields.deliverable_1_seconds,
        brand_name: store.fields.brand_name,
        genre: findGenrePromptById(store.fields.genre),
        style_keywords: getCreativeStyleTextArrayByIds(
          store.fields.style_keywords
        ),
        ad_purpose: findAdPurposePromptById(store.fields.ad_purpose),
        style_description: store.fields.style_description,
        brand_target_audience: store.fields.brand_target_audience,
        brand_service_or_product: store.fields.brand_service_or_product,
        brand_identity_or_message: store.fields.brand_identity_or_message,
        brand_topics_to_highlight: store.fields.brand_topics_to_highlight,
        inspiration_script: store.fields.inspiration_script,
        inspiration_summary: store.fields.inspiration_summary,
        inspiration_pitch: store.fields.inspiration_pitch,

        // content: editorCreativePrompt.getText(),
        rewritePrompt: store.rewritePrompt,
        rewriteSelectionStart: store.rewriteSelectionStart,
        rewriteSelectionLength: store.rewriteSelectionLength,

        customerInsights: JSON.stringify(store.fields.jsonInsights.customer),
        chosenPremise: store.fields.chosenPremise[2],
        formatAdPurposeNumber: formatAdPurposeNumber(store.fields.ad_purpose),
        formatGenreNumber: formatGenreNumber(store.fields.genre),
      }),
    }
  );

  let reader = response.body.getReader();
  let generator = $app.generators.ndjson(reader);
  let content = "";

  while (true) {
    let { done, value } = await generator.next();

    if (done) {
      console.log("Done!");
      store.isAIWorking = false;
      if (store.fields.creative_prompt.length > 10) {
        userAnalytics(0, 1, 0, 0);
        console.log(
          "Checking -> : concept writer ran successfully, so ran user analytics"
        );
      }
      break;
    }

    if (value.event === "message" && value.data.delta.content) {
      // concatinate the content
      content += value.data.delta.content;
      // convert to html
      const htmlValue = window.md.render(content);
      // update the input
      editorCreativePrompt.container.children[0].innerHTML = htmlValue;
    }
  }
};
/**
const generateCreativePromptRewrite = async () => {
  store.isAIWorking = true;

  //
  //
  //
  // rewriter
  const response = await fetch(
    "https://live.api-server.io/run/v1/64b6b6c372294f330409b0f7",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken(),
      },
      body: JSON.stringify({
        location: store.fields.location,
        budget: store.fields.budget,
        deliverable_1_seconds: store.fields.deliverable_1_seconds,
        brand_name: store.fields.brand_name,
        genre: findGenrePromptById(store.fields.genre),
        style_keywords: getCreativeStyleTextArrayByIds(
          store.fields.style_keywords
        ),
        ad_purpose: findAdPurposePromptById(store.fields.ad_purpose),
        style_description: store.fields.style_description,
        brand_target_audience: store.fields.brand_target_audience,
        brand_service_or_product: store.fields.brand_service_or_product,
        brand_identity_or_message: store.fields.brand_identity_or_message,
        brand_topics_to_highlight: store.fields.brand_topics_to_highlight,
        inspiration_script: store.fields.inspiration_script,
        inspiration_summary: store.fields.inspiration_summary,
        inspiration_pitch: store.fields.inspiration_pitch,

        content: editorCreativePrompt.getText(),
        rewritePrompt: store.rewritePrompt,
        rewriteSelectionStart: store.rewriteSelectionStart,
        rewriteSelectionLength: store.rewriteSelectionLength,
      }),
    }
  );

  let reader = response.body.getReader();
  let generator = $app.generators.ndjson(reader);
  let content = "";

  while (true) {
    let { done, value } = await generator.next();

    if (done) {
      console.log("Done!");
      store.isAIWorking = false;
      break;
    }

    if (value.event === "message" && value.data.delta.content) {
      // concatinate the content
      content += value.data.delta.content;
      // convert to html
      const htmlValue = window.md.render(content);
      // update the input
      editorCreativePrompt.container.children[0].innerHTML = htmlValue;
    }
  }
};*/

//
//
// ⚡ script writer ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const generateScript = async () => {
  store.isAIWorking = true;

  if (store.fields.jsonInsights === "") {
    // Wait for the researchInsights function to complete
    await researchInsights().catch((error) => {
      console.error("Failed to fetch insights:", error);
      // Handle the error (e.g., set an error message in your UI)
    });
  }

  if (!store.fields.genre) {
    //genre dropdown
    let cloneGenre = store.fields.chosenPremise[6];
    store.fields.genre = cloneGenre;
    console.log("clonegenre is " + cloneGenre);
    let optionGenre = $("#cc_genre")
      .find("option[value='" + cloneGenre + "']")
      .filter(":first");
    console.log("optionGenre is " + optionGenre);
    let genreText = optionGenre.text();
    console.log("genreText is " + genreText);
    let genreDropdown = $('.w-dropdown-link:contains("' + genreText + '")');
    console.log("genreDropdown is" + genreDropdown);
    const clickGenre = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    console.log("clickGenre is " + clickGenre);
    // Dispatch the click event
    genreDropdown.get(0).dispatchEvent(clickGenre);
    //$("#cc_clonedGenre").addClass("cc_cloned");
    console.log(cloneGenre);
  }

  if (!store.fields.ad_purpose) {
    //purpose dropdown
    let clonePurpose = store.fields.chosenPremise[5];
    //console.log(clonePurpose + " is clonePurpose");
    console.log("clonePurpose " + clonePurpose);
    store.fields.ad_purpose = clonePurpose;
    let optionPurpose = $("[cc_data='ad-purpose']")
      .find("option[value='" + clonePurpose + "']")
      .filter(":first");
    //console.log(optionPurpose + " is optionPurpose");
    console.log("optionPurpose ", optionPurpose);
    let purposeText = optionPurpose.text();
    console.log("purposeText:", purposeText);
    console.log(
      "purposeDropdown selector result:",
      $('.w-dropdown-link:contains("' + purposeText + '")')
    );

    let purposeDropdown = $('.w-dropdown-link:contains("' + purposeText + '")');
    //console.log(purposeDropdown " is purposeDropdown");
    console.log("purposeDropdown ", purposeDropdown);
    const clickPurpose = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    console.log("Before dispatching click event for purposeDropdown");
    // Dispatch the click event
    purposeDropdown.get(0).dispatchEvent(clickPurpose);
    //$("#cc_clonedPurpose").addClass("cc_cloned");
    console.log("After dispatching click event for purposeDropdown");
  }

  // Assuming store.fields.inspiration_script is a string
  //const current_inspiration_script = store.fields.inspiration_script;

  // Split the string into an array of words
  //const scriptWordsArray = current_inspiration_script.split(/\s+/);

  // Get the number of words
  //const numberOfWords = scriptWordsArray.length.toString();

  // Print the number of words
  //console.log("number of words:", numberOfWords);

  store.isInsightsResearching = false;
  console.log("Checking -> about to run endpoint for script writer:");
  const response = await fetch(
    "https://dev.api-server.io/run/v1/646ce4aeb0c1d0bf94ad07cc",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken(),
      },
      body: JSON.stringify({
        location: store.fields.location,
        budget: store.fields.budget,
        deliverable_1_seconds: store.fields.deliverable_1_seconds,
        brand_name: store.fields.brand_name,
        genre: findGenrePromptById(store.fields.genre),
        style_keywords: getCreativeStyleTextArrayByIds(
          store.fields.style_keywords
        ),
        ad_purpose: findAdPurposePromptById(store.fields.ad_purpose),
        style_description: store.fields.style_description,
        brand_target_audience: store.fields.brand_target_audience,
        brand_service_or_product: store.fields.brand_service_or_product,
        brand_identity_or_message: store.fields.brand_identity_or_message,
        brand_topics_to_highlight: store.fields.brand_topics_to_highlight,
        // creative_prompt: editorCreativePrompt.getText().trim(),
        inspiration_script: store.fields.inspiration_script,
        //inspiration_script_word_length: numberOfWords,
        genre_prompt: store.fields.genre_prompt,
        inspiration_summary: store.fields.inspiration_summary,
        inspiration_pitch: store.fields.inspiration_pitch,
        customerInsights: JSON.stringify(store.fields.jsonInsights.customer),
        chosenPremise: store.fields.chosenPremise[2],
        formatAdPurposeNumber: formatAdPurposeNumber(store.fields.ad_purpose),
        formatGenreNumber: formatGenreNumber(store.fields.genre),
        chosenEmotion: store.fields.chosenPremise[0],
        gptPrompt: store.fields.gptPrompt,
      }),
    }
  );

  console.log("Checking -> : response of script writer", response);

  let reader = response.body.getReader();
  let generator = $app.generators.ndjson(reader);
  let content = "";

  while (true) {
    let { done, value } = await generator.next();

    if (done) {
      console.log("Done!");
      store.isAIWorking = false;
      if (store.fields.script.length > 10) {
        userAnalytics(0, 0, 1, 0);
        console.log(
          "Checking -> : script writer ran successfully, so ran user analytics"
        );
      }
      break;
    }

    if (value.event === "message" && value.data.delta.content) {
      // concatinate the content
      content += value.data.delta.content;
      // convert to html
      const htmlValue = window.md.render(content);
      // update the input
      editorScript.container.children[0].innerHTML = htmlValue;
    }
  }
};

//
//
// ⚡ logistics writer ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const generateGearAndLegal = async () => {
  store.isAIWorking = true;

  const response = await fetch(
    "https://live.api-server.io/run/v1/646cef803c42aae0b9ed8831",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken(),
      },
      body: JSON.stringify({
        location: store.fields.location,
        budget: store.fields.budget,
        deliverable_1_seconds: store.fields.deliverable_1_seconds,
        brand_name: store.fields.brand_name,
        genre: findGenrePromptById(store.fields.genre),
        style_keywords: getCreativeStyleTextArrayByIds(
          store.fields.style_keywords
        ),
        ad_purpose: findAdPurposePromptById(store.fields.ad_purpose),
        style_description: store.fields.style_description,
        brand_target_audience: store.fields.brand_target_audience,
        brand_service_or_product: store.fields.brand_service_or_product,
        brand_identity_or_message: store.fields.brand_identity_or_message,
        brand_topics_to_highlight: store.fields.brand_topics_to_highlight,
        //creative_prompt: editorCreativePrompt.getText().trim(),
        script: editorScript.getText().trim(),
      }),
    }
  );

  let reader = response.body.getReader();
  let generator = $app.generators.ndjson(reader);
  let content = "";

  while (true) {
    let { done, value } = await generator.next();

    if (done) {
      console.log("Done!");
      store.isAIWorking = false;
      break;
    }

    if (value.event === "message" && value.data.delta.content) {
      // concatinate the content
      content += value.data.delta.content;
      // convert to html
      const htmlValue = window.md.render(content);
      // update the input
      editorGearAndLegal.container.children[0].innerHTML = htmlValue;
    }
  }
};

//
//
// ⚡ storyboarder regenerate ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const regenerateStoryboard = async (event) => {
  console.log(event);

  // Extract the event handler button and find the attributes to send their values as the inputs for the fetch
  const button = event.target;
  console.log("button", button);
  const input = $(button).closest(":has(input)").find("input").first();
  console.log("input", input);
  const sceneNumber = input.attr("sceneNumber");
  console.log("sceneNumber", sceneNumber);
  const shotNumber = input.attr("shotNumber");
  console.log("shotNumber", shotNumber);

  // Update the status of the shot in storyboard JSON
  updateShotStatus(
    store.storyboardJSON,
    sceneNumber,
    shotNumber,
    "regenerating"
  );

  console.log(event);
  store.isAIWorking = true;

  const response = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:IY_ab71y/storyboards/regenerate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // This line is important
      },
      body: JSON.stringify({
        inputJobId: store.storyboardJobId,
        inputShotNumber: shotNumber,
        inputSceneNumber: sceneNumber,
        inputFeedback: input.val(),
        inputStoryboardJSON: store.storyboardJSON,
        inputAspectRatio: store.fields.storyboardAspectRatio,
      }),
    }
  );
  console.log("My Response Log for storyboard regen api :", response);
  if (!response.ok) {
    store.isAIWorking = false;
  }
  if (response.ok) {
    const data = await response.json(); // Parse the JSON in the response
    console.log("new storyboard_json:", data.storyboard_json); // Access the job_id from the parsed data
    store.storyboardJSON = data.storyboard_json;
  }
};

// Define the updateShotStatus function
function updateShotStatus(storyboard, sceneNumber, shotNumber, newStatus) {
  // Loop through each scene in the storyboard
  storyboard.forEach((scene) => {
    // Check if the scene matches the provided sceneNumber
    if (scene.sceneNumber == sceneNumber) {
      // Loop through the shotElements in the found scene
      scene.shotElements.forEach((shot) => {
        // Check if the shotElement matches the provided shotNumber
        if (shot.shotNumber == shotNumber) {
          // Update the status of the matching shotElement
          shot.status = newStatus;
        }
      });
    }
  });
}

//
//
// ⚡ workspace creation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const createWorkspace = async () => {
  store.isCreatingWorkspace = true;

  const response = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:ZUu16G-Q/create-workspace",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // inputConcept: editorCreativePrompt.getText().trim(),
        inputScript: editorScript.getText().trim(),
        inputBudget: store.budget,
        inputAspectRatio: store.fields.storyboardAspectRatio,
        inputNumberOfShots: store.storyboardNumberOfShots,
        inputNumberOfScenes: store.storyboardNumberOfScenes,
      }),
    }
  );
  console.log("My Response Log for storyboard:", response);
  const data = await response.json(); // Parse the JSON in the response
  console.log("Job ID:", data.job_id); // Access the job_id from the parsed data
  store.storyboardJobId = data.job_id;
  checkPingStoryboard(data.job_id);
};

const checkPingWorkspace = async (job_id) => {
  console.log(
    "Calling the fetch for checkPingStoryboard Function, here is the job id:",
    job_id
  );
  const response = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:IY_ab71y/storyboards/ping/" + job_id,
    {
      method: "GET",
    }
  );

  if (response.status > 399 || response.status < 200) {
    store.isAIWorking = false;
    store.storyboardStatus = "Error";
    return;
  }

  const data = await response.json(); // Parse the JSON in the response
  console.log("storboard json:", data.storyboard_json); // Access the job_id from the parsed data
  // store.storyboardStatus = "";

  if (data.string_status == "Thinking") {
    store.storyboardStatus = "Thinking";
    setTimeout(() => {
      checkPingStoryboard(job_id);
      console.log("rerunning checkPingStoryboard function for thinking");
      store.storyboardJSON = data.storyboard_json;
      console.log("current storyboard_json:", data.storyboard_json); // Access the job_id from the parsed data
    }, 30000);
  } else if (data.string_status == "Generating") {
    store.storyboardStatus = "Generating";
    setTimeout(() => {
      checkPingStoryboard(job_id);
      console.log("rerunning checkPingStoryboard function for generating");
      store.storyboardJSON = data.storyboard_json;
      console.log("current storyboard_json:", data.storyboard_json); // Access the job_id from the parsed data
    }, 30000);
  } else if (data.string_status == "Finished") {
    store.storyboardJSON = data.storyboard_json;
    store.storyboardStatus = "Finished";
    store.isAIWorking = false;
  } else if (data.string_status == "Error") {
    store.storyboardJSON = data.storyboard_json;
    store.storyboardStatus = "Error";
    store.isAIWorking = false;
  }
};

const cancelStoryboard = () => {
  store.storyboardStatus = "";
};

//
//
// ⚡ storyboarder ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const generateStoryboard = async () => {
  store.isAIWorking = true;
  store.storyboardJSON = "";
  store.storyboardStatus = "Thinking";

  console.log("Checking -> : running generateStoryboard()");
  console.log("Checking -> : aspectRatio", store.storyboardAspectRatio);

  const response = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:IY_ab71y/storyboards/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // inputConcept: editorCreativePrompt.getText().trim(),
        inputScript: editorScript.getText().trim(),
        inputBudget: store.fields.budget,
        inputAspectRatio: store.fields.storyboardAspectRatio,
        inputNumberOfShots: store.storyboardNumberOfShots,
        inputNumberOfScenes: store.storyboardNumberOfScenes,
      }),
    }
  );

  console.log("My Response Log for storyboard:", response);
  const data = await response.json(); // Parse the JSON in the response
  console.log("Job ID:", data.job_id); // Access the job_id from the parsed data
  store.storyboardJobId = data.job_id;
  checkPingStoryboard(data.job_id);
};

const checkPingStoryboard = async (job_id) => {
  console.log(
    "Calling the fetch for checkPingStoryboard Function, here is the job id:",
    job_id
  );
  const response = await fetch(
    "https://x8ki-letl-twmt.n7.xano.io/api:IY_ab71y/storyboards/ping/" + job_id,
    {
      method: "GET",
    }
  );

  if (response.status > 399 || response.status < 200) {
    store.isAIWorking = false;
    store.storyboardStatus = "Error";
    return;
  }

  const data = await response.json(); // Parse the JSON in the response
  console.log("storboard json:", data.storyboard_json); // Access the job_id from the parsed data
  // store.storyboardStatus = "";

  if (data.string_status == "Thinking") {
    store.storyboardStatus = "Thinking";
    setTimeout(() => {
      checkPingStoryboard(job_id);
      console.log("rerunning checkPingStoryboard function for thinking");
      store.storyboardJSON = data.storyboard_json;
      console.log("current storyboard_json:", data.storyboard_json); // Access the job_id from the parsed data
    }, 30000);
  } else if (data.string_status == "Generating") {
    store.storyboardStatus = "Generating";
    setTimeout(() => {
      checkPingStoryboard(job_id);
      console.log("rerunning checkPingStoryboard function for generating");
      store.storyboardJSON = data.storyboard_json;
      console.log("current storyboard_json:", data.storyboard_json); // Access the job_id from the parsed data
    }, 30000);
  } else if (data.string_status == "Finished") {
    store.storyboardJSON = data.storyboard_json;
    store.storyboardStatus = "Finished";
    store.isAIWorking = false;
    userAnalytics(0, 0, 0, 1);
  } else if (data.string_status == "Error") {
    store.storyboardJSON = data.storyboard_json;
    store.storyboardStatus = "Error";
    store.isAIWorking = false;
  }
};

$(".cc_suggestions-placeholder.is--cc_concept").on("click", function () {
  // Get the text from the clicked element
  let textToCopy = $(this).text();

  // Insert the text into the Quill editor 'editorBrandTopicsToHighlight'
  let length = editorBrandTopicsToHighlight.getLength();

  // Check if the editor is empty (length == 1), then just insert the text
  if (length === 1) {
    // Check if the first character is a newline, which indicates an empty editor
    let firstChar = editorBrandTopicsToHighlight.getText(0, 1);
    if (firstChar.trim() === "") {
      // Editor is truly empty, insert without adding a newline
      editorBrandTopicsToHighlight.insertText(0, textToCopy);
    } else {
      // Editor is not empty, add a newline before the text
      editorBrandTopicsToHighlight.insertText(length, "\n" + textToCopy);
    }
  } else {
    // The editor already has content, insert the text on a new line
    editorBrandTopicsToHighlight.insertText(length, "\n" + textToCopy);
  }
});

$(".cc_suggestions-placeholder.is--cc_script").on("click", function () {
  // Get the text from the clicked element
  let textToCopy = $(this).text();

  // Insert the text into the Quill editor 'editorScriptGPTPrompt'
  let length = editorScriptGPTPrompt.getLength();

  // Check if the editor is empty (length == 1), then just insert the text
  if (length === 1) {
    // Check if the first character is a newline, which indicates an empty editor
    let firstChar = editorScriptGPTPrompt.getText(0, 1);
    if (firstChar.trim() === "") {
      // Editor is truly empty, insert without adding a newline
      editorScriptGPTPrompt.insertText(0, textToCopy);
    } else {
      // Editor is not empty, add a newline before the text
      editorScriptGPTPrompt.insertText(length, "\n" + textToCopy);
    }
  } else {
    // The editor already has content, insert the text on a new line
    editorScriptGPTPrompt.insertText(length, "\n" + textToCopy);
  }
});

$(".cc_suggestions-placeholder.is--cc_brand-info").on("click", function () {
  // Get the text from the clicked element
  let textToCopy = $(this).text();

  // Insert the text into the Quill editor 'editorBrandServiceOrProduct'
  let length = editorBrandServiceOrProduct.getLength();

  // Check if the editor is empty (length == 1), then just insert the text
  if (length === 1) {
    // Check if the first character is a newline, which indicates an empty editor
    let firstChar = editorBrandServiceOrProduct.getText(0, 1);
    if (firstChar.trim() === "") {
      // Editor is truly empty, insert without adding a newline
      editorBrandServiceOrProduct.insertText(0, textToCopy);
    } else {
      // Editor is not empty, add a newline before the text
      editorBrandServiceOrProduct.insertText(length, "\n" + textToCopy);
    }
  } else {
    // The editor already has content, insert the text on a new line
    editorBrandServiceOrProduct.insertText(length, "\n" + textToCopy);
  }
});

//
//
// ⚡ mount app ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const mounted = async () => {
  store.creativeStyles = await getCreativeStyles();

  if (document.querySelector('[upload-field-name="videoFile"]')) {
    // import video
    const importVideoWidget = window.uploadcare.Widget(
      '[role=uploadcare-uploader][upload-field-name="videoFile"]'
    );
    importVideoWidget.onChange(function (file) {
      if (file) {
        file.done((info) => {
          // Reset the field as it only supports one image
          store.fields.videoFile = [];

          store.fields.videoFile.push({ url: info.cdnUrl });
          console.log("Checking -> videofile:", store.fields.videoFile);

          store.videoFilePreviewURL = info.cdnUrl;
        });
      }
    });
  }
  // get a widget reference
  const coverImageWidget = window.uploadcare.Widget(
    '[role=uploadcare-uploader][upload-field-name="cover_image"]'
  );
  coverImageWidget.onChange(function (file) {
    if (file) {
      file.done((info) => {
        // Reset the field as it only supports one image
        store.fields.cover_image = [];
        store.fields.cover_image.push({ url: info.cdnUrl });
        store.coverImagePreviewUrl = info.cdnUrl;
      });
    }
  });

  // get a widget reference
  const imageInspoWidget = window.uploadcare.MultipleWidget(
    '[role=uploadcare-uploader][upload-field-name="image_inspo"]'
  );
  // listen to the "change" event
  imageInspoWidget.onChange(function (group) {
    // get a list of file instances
    group.files().forEach((file) => {
      // once each file is uploaded, get its CDN URL from the fileInfo object
      file.done((fileInfo) => {
        store.fields.image_inspo.push({ url: fileInfo.cdnUrl });
      });
    });
  });

  // get a widget reference
  const attachmentsWidget = window.uploadcare.MultipleWidget(
    '[role=uploadcare-uploader][upload-field-name="attachments"]'
  );
  // listen to the "change" event
  attachmentsWidget.onChange(function (group) {
    // get a list of file instances
    group.files().forEach((file) => {
      // once each file is uploaded, get its CDN URL from the fileInfo object
      file.done((fileInfo) => {
        store.fields.attachments.push({ url: fileInfo.cdnUrl });
      });
    });
  });

  editorStyleDescription.on("text-change", function (delta, oldDelta, source) {
    store.fields.style_description =
      editorStyleDescription.container.children[0].innerHTML;
  });

  editorBrandServiceOrProduct.on(
    "text-change",
    function (delta, oldDelta, source) {
      store.fields.brand_service_or_product =
        editorBrandServiceOrProduct.container.children[0].innerHTML;

      // Assuming you want to count text length, not HTML length:
      const textLength = editorBrandServiceOrProduct.getText().trim().length; // trim() to remove trailing spaces/newlines

      // Calculate width based on text length (customize this logic as needed)
      let widthPercentage = Math.min(100, (textLength / 250) * 100); // Caps at 100%

      // Determine color based on text length
      let color = textLength > 250 ? "#2cc32c" : "#f56780"; // Uses hex codes for green and red

      const lengthBar = document.querySelector(
        '[cc_data="brandInformationLengthBar"]'
      );
      if (lengthBar) {
        lengthBar.style.width = widthPercentage + "%";
        lengthBar.style.backgroundColor = color;
      }
      handleWriterValidation();
    }
  );

  editorBrandIdentityOrMessage.on(
    "text-change",
    function (delta, oldDelta, source) {
      store.fields.brand_identity_or_message =
        editorBrandIdentityOrMessage.container.children[0].innerHTML;
    }
  );

  /*
  //
  //
  // Sync Editors
  function syncEditors(sourceEditor, targetEditor) {
    const sourceContent = sourceEditor.getContents();
    const targetSelection = targetEditor.getSelection();

    // Update target editor content without losing selection
    targetEditor.setContents(sourceContent);

    // If there was a selection, restore it
    if (targetSelection) {
      // Adjust selection index if it exceeds the current content length
      const maxLength = targetEditor.getLength();
      const newIndex = Math.min(targetSelection.index, maxLength - 1);
      targetEditor.setSelection(newIndex, targetSelection.length);
    }
  }
  
  // Attach event listeners
  editorBrandTopicsToHighlight.on("text-change", (delta, oldDelta, source) => {
    if (source === "user") {
      syncEditors(editorBrandTopicsToHighlight, editorScriptGPTPrompt);
    }
  });



      // AI Quill events
    editorCreativePrompt.on("text-change", function (delta, oldDelta, source) {
      console.log(
        "Checking -> : text change creative prompt",
        editorCreativePrompt.container.children[0].innerHTML
      );
      store.fields.creative_prompt =
        editorCreativePrompt.container.children[0].innerHTML;

      if (editorCreativePrompt.getText().trim().length > 150) {
        store.isReadyRateConcept = true;
      } else {
        store.isReadyRateConcept = false;
      }
    });

      if (document.querySelector("#editorGearAndLegal")) {
    editorGearAndLegal.on("text-change", function (delta, oldDelta, source) {
      store.fields.gear_and_legal =
        editorGearAndLegal.container.children[0].innerHTML;
    });
  }
  
  */

  editorScriptGPTPrompt.on("text-change", (delta, oldDelta, source) => {
    store.fields.brand_topics_to_highlight =
      editorScriptGPTPrompt.container.children[0].innerHTML;
  });

  editorDescription.on("text-change", function (delta, oldDelta, source) {
    store.fields.description =
      editorDescription.container.children[0].innerHTML;
  });

  editorScript.on("text-change", function (delta, oldDelta, source) {
    store.fields.script = editorScript.container.children[0].innerHTML;

    if (editorScript.getText().trim().length > 150) {
      store.isReadyRateScript = true;
    } else {
      store.isReadyRateScript = false;
    }
  });

  // Define a reusable callback function
  function handleSelectionChange(range, oldRange, source, quill) {
    store.rewriteSelectionStart = null;
    store.rewriteSelectionLength = 0;

    if (range) {
      displaySelectionTooltip();
      store.showRewritePrompt = true;
      if (range.length === 0) {
        store.rewriteSelectionStart = range.index;
        store.rewriteSelectionLength = 0;
        console.log("User cursor is on", range.index);
      } else {
        let text = quill.getText(range.index, range.length);
        store.rewriteSelectionStart = range.index;
        store.rewriteSelectionLength = range.length;
        console.log("User has highlighted", text);
      }
    } else {
      // Cursor not in the editor
      //store.showRewritePrompt = false;
    }
  }

  const MENU_HEIGHT = 45;
  const menu = document.querySelector(".tooltip");
  const tooltipWidth = menu.offsetWidth;

  function displaySelectionTooltip() {
    if (store.showRewritePrompt) {
      const sel = document.getSelection();
      const range = sel.getRangeAt(0);

      const { top, left, width } = range.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      const tooltipTop = top + scrollTop - MENU_HEIGHT;
      const tooltipLeft = left + width / 2 - tooltipWidth / 2;

      menu.style.display = "block";
      menu.style.top = `${tooltipTop}px`;
      menu.style.left = `${tooltipLeft}px`;
    } else {
      menu.style.display = "none";
    }
  }

  editorCreativePrompt.on(
    "selection-change",
    function (range, oldRange, source) {
      handleSelectionChange(range, oldRange, source, editorCreativePrompt);
    }
  );
};

const budgetUpdated = (evt) => {
  const budgetInput = evt?.target;
  let budgetValue = budgetInput.value;
  budgetValue = budgetValue.replaceAll(",", "").replace("$", "");

  // Limit budget to 5 digits
  if (budgetValue.length > 5) {
    budgetValue = budgetValue.slice(0, 5);
  }

  budgetInput.value = currencyFormatter.format(budgetValue).replace("$", "");
  store.fields.budget = budgetValue;
};

const getBackgroundStyle = (url) => {
  let styles = {};
  if (url !== "") {
    styles = { backgroundImage: `url(${url})` };
  }
  return styles;
};

const addVideoInspo = () => {
  if (store.fields.video_inspo.length < 3) {
    store.fields.video_inspo.push("");
  }
};

const handleWriterValidation = () => {
  console.log("Checking -> handling writer validation:");

  const conditionsSum =
    (store.fields.budget > 0 ? 1 : 0) +
    (store.fields.deliverable_1_seconds > 6 ? 1 : 0) +
    (store.fields.brand_name.length > 2 ? 1 : 0) +
    (editorBrandServiceOrProduct.getText().trim().length > 250 ? 1 : 0);

  if (conditionsSum > 3) {
    console.log("All conditions met. the total is", conditionsSum);
  } else {
    console.log("some conditions met", conditionsSum);
  }

  const percentageNumber = (conditionsSum / 4) * 100;
  console.log("Checking -> percentageNumber:", percentageNumber);
  console.log(
    "Checking -> isWriterValidationBar:",
    store.fields.isWriterValidationBar
  );

  store.fields.isWriterValidationBar = conditionsSum;

  // set height and colors
  let heightPercentage = percentageNumber;

  // Determine color based on text length
  let color = store.fields.isWriterValidationBar === 4 ? "#2cc32c" : "#f56780"; // Uses hex codes for green and red

  const lengthBarConcept = document.querySelector(
    '[cc_data="writerValidationBarConcept"]'
  );

  const lengthBarScript = document.querySelector(
    '[cc_data="writerValidationBarScript"]'
  );
  if (lengthBarConcept) {
    lengthBarConcept.style.height = heightPercentage + "%";
    lengthBarConcept.style.backgroundColor = color;
  }

  if (lengthBarScript) {
    lengthBarScript.style.height = heightPercentage + "%";
    lengthBarScript.style.backgroundColor = color;
  }

  console.log(
    "Checking -> isWriterValidationBar:",
    store.fields.isWriterValidationBar
  );
};

const app = createApp({
  // exposed to all expressions
  mounted,
  store,
  WebflowFormComponent,
  getBackgroundStyle,
  addVideoInspo,
  budgetUpdated,
  generateCreativePrompt,
  generateScript,
  generateGearAndLegal,
  generateStoryboard,
  regenerateStoryboard,
  logAll,
  tryImportAgain,
  analyzeVideo,
  rateMyConcept,
  rateMyScript,
  createWorkspace,
  checkPingWorkspace,
  researchInsights,
  keywordText,
  premiseClick,
  handleWriterValidation,
  cancelStoryboard,

  get getCheckedCreativeStyles() {
    return store.creativeStyles.filter((skill) =>
      store.fields.style_keywords.includes(skill.airtable_id)
    );
  },
});

// this is for the ai rewriter. unhide elements on webflow
/*
$(document).ready(function () {
  const MENU_HEIGHT = 45;
  const menu = document.querySelector(".tooltip");
  const tooltipWidth = menu.offsetWidth;

  // Get the required elements
  const ccWriterQuill = $(".is--cc_writer-quill");
  const ccRewriteFloat = $(".is--cc_rewrite-float");
  const ccRewriteButton = $(".is--cc_rewrite");
  const ccRewritePrompt = $(".is--cc_rewrite-prompt");

  document.addEventListener("selectionchange", () => {
    const sel = document.getSelection();
    const range = sel.getRangeAt(0);

    let isSelectionInQuill = false;

    ccWriterQuill.each(function (index) {
      if ($(this)[0].contains(range.commonAncestorContainer)) {
        isSelectionInQuill = true;
        return false; // Exit the loop if selection is found within a quill
      }
    });

    if (isSelectionInQuill && (range.toString().length > 0 || highlightText)) {
      const { top, left, width } = range.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      const tooltipTop = top + scrollTop - MENU_HEIGHT;
      const tooltipLeft = left + width / 2 - tooltipWidth / 2;

      menu.style.display = "block";
      menu.style.top = `${tooltipTop}px`;
      menu.style.left = `${tooltipLeft}px`;
    } else {
      menu.style.display = "none";
    }
  });

  // Hide the tooltip when the page loads
  window.addEventListener("load", () => {
    menu.style.display = "none";
  });

  // Event listener for typing within ccWriterQuill elements
  ccWriterQuill.on("input", () => {
    highlightText = ""; // Clear the highlightText when typing
  });

  let highlightText = "";
  let clickCounter = 0;

  // ccRewriteFloat.hide(); // Hide the rewrite float element on page load

  // ccWriterQuill.on("focusin", () => {
  //   ccRewriteFloat.show();
  //   clickCounter = 0; // Reset click counter whenever Quill gains focus
  // });

  // $(document).on("mousedown", function (event) {
  //   let target = $(event.target);
  //   if (
  //     !target.closest(ccRewriteFloat).length &&
  //     !target.is(ccWriterQuill) &&
  //     !target.closest(ccWriterQuill).length
  //   ) {
  //     if (highlightText) {
  //       highlightText = "";
  //       ccRewriteButton.prop("disabled", true);
  //       ccRewriteButton.css("opacity", "0.6");
  //     } else if (clickCounter === 1) {
  //       ccRewriteFloat.hide();
  //       clickCounter = 0; // Reset click counter after float is hidden
  //     }
  //     clickCounter++;
  //   }
  // });

  ccRewriteButton.on("click", function () {
    if (highlightText !== "") {
      var alertText = highlightText + " " + ccRewritePrompt.val();
      alert(alertText);
    }
  });

  ccRewriteButton.on("mousedown", function (event) {
    event.stopPropagation();
  });

  ccWriterQuill.on("mouseup touchend", function () {
    setTimeout(function () {
      const selection = window.getSelection().toString();
      if (selection !== "") {
        highlightText = selection;
        ccRewriteButton.prop("disabled", false);
        ccRewriteButton.css("opacity", "1");
      } else {
        highlightText = "";
        ccRewriteButton.prop("disabled", true);
        ccRewriteButton.css("opacity", "0.6");
      }
    }, 0);
  });
});*/

export { app };
