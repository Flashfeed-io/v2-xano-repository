import { $fetch } from "ohmyfetch";
import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";
import Quill from "quill";
import { Datepicker } from "vanillajs-datepicker";
import {
  findGenrePromptById,
  findAdPurposePromptById
} from "../../prompt_config";

const quillOptions = {
  theme: "snow",
  modules: {
    toolbar: [
      ["bold", "italic"], // Bold and italic
      [{ list: "ordered" }, { list: "bullet" }] // Ordered and bullet lists
    ]
  }
};

const editorStyleDescription = new Quill(
  "#editorStyleDescription",
  quillOptions
);
const editorBrandServiceOrProduct = new Quill(
  "#editorBrandServiceOrProduct",
  quillOptions
);

const editorBrandIdentityOrMessage = new Quill(
  "#editorBrandIdentityOrMessage",
  quillOptions
);
const editorBrandTopicsToHighlight = new Quill(
  "#editorBrandTopicsToHighlight",
  quillOptions
);

const editorDescription = new Quill("#editorDescription", quillOptions);

// Ad concept
const editorCreativePrompt = new Quill("#editorCreativePrompt", quillOptions);
// Ad script
const editorScript = new Quill("#editorScript", quillOptions);
// Ad logistics
const editorGearAndLegal = new Quill("#editorGearAndLegal", quillOptions);

const elStartDate = document.getElementById("cc_startDate");
elStartDate.addEventListener("changeDate", (event) => {
  store.fields.start_date = event.detail.date;
});
const startDatePicker = new Datepicker(elStartDate, {});

const elDueDate = document.getElementById("cc_deliveryDate");
elDueDate.addEventListener("changeDate", (event) => {
  store.fields.due_date = event.detail.date;
});
const dueDatePicker = new Datepicker(elDueDate, {});

$("#deliverable_1").val("4K Video");
$("#deliverable_1")
  .siblings("label")
  .find(".form-checkbox-square")
  .addClass("w--redirected-checked");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0
});

//clone functionality code
$(document).ready(function () {
  //client side validation

  //deliverable seconds
  $("[deliverable-1-seconds=true]").on("input dragover drop paste", function (
    event
  ) {
    event.preventDefault();

    if (event.type === "input") {
      // Remove any non-numeric characters
      $(this).val(
        $(this)
          .val()
          .replace(/[^0-9]/g, "")
      );

      // Limit the input length to 3 digits
      if ($(this).val().length > 3) {
        $(this).val($(this).val().slice(0, 3));
      }
    }
  });

  const fieldTitle = $("#cc_title");
  store.fields.title = fieldTitle.val();

  const fieldLocation = $("#cc_location");
  store.fields.location = fieldLocation.val();

  //public project toggle radio code
  $("input[type='radio'][name='cc_public-workspace']").change(function () {
    var $wrapper = $(this).parent(".cc_radio_select-wrap");
    $wrapper.addClass("cc_is--selected");
    $wrapper.siblings(".cc_radio_select-wrap").removeClass("cc_is--selected");

    // Remove 'is--white' class from all 'tooltip_inner' elements
    $(".cc_radio_select-wrap").find(".tooltip_inner").removeClass("is--white");

    if ($(this).val() === "Private") {
      store.fields.workspace = "Private";
      $wrapper.find(".tooltip_inner").addClass("is--white");
      $wrapper.siblings().find(".tooltip_inner").removeClass("is--white");
    } else {
      store.fields.workspace = "Under Review"; // Set the value to an empty string
      $wrapper.find(".tooltip_inner").addClass("is--white");
      $wrapper.siblings().find(".tooltip_inner").removeClass("is--white");
    }

    toggleVisibility();
  });

  // Find the first label in the group of cc_public-workspace
  var firstLabel = $("input[type='radio'][name='cc_public-workspace']")
    .first()
    .closest("label");

  // Add the w--redirected-checked class to its first child element
  firstLabel.find(":first-child").addClass("w--redirected-checked");

  function toggleVisibility() {
    if (store.fields.workspace === "Under Review") {
      $('[public-enabled="false"]').hide();
      $('[public-enabled="true"]').show();

      fieldTitle.val("Video Advertisement");
      store.fields.title = "Video Advertisement";
      fieldLocation.val("Worldwide");
      store.fields.location = "Worldwide";
    } else {
      $('[public-enabled="false"]').show();
      $('[public-enabled="true"]').hide();
    }
  }

  // Initial visibility set
  toggleVisibility();

  const urlParams = new URLSearchParams(window.location.search);
  const cloneParam = urlParams.get("clone");
  const checkLocalStorageExists = localStorage.getItem("recordid");

  let translateGenre = localStorage.getItem("genre-airtable-id");
  store.fields.genre = translateGenre;

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
  // clone values from clone video button
  if (cloneParam && checkLocalStorageExists) {
    // Clone parameter exists, utilize local storage values
    $("[cloneable-video-url=true]").css({
      "pointer-events": "none",
      opacity: "0.6",
      display: "none"
    });
    const cloneValue = localStorage.getItem("video");
    $("[video-inspiration-1=true]").val(cloneValue);

    const cloneTitle = localStorage.getItem("title");
    $("#cc_clone-title").text(cloneTitle);

    const cloneRecordID = localStorage.getItem("recordid");
    $("#video_inspiration_airtable_record_id").val(cloneRecordID);
    store.fields.video_inspiration_airtable_record_id = [cloneRecordID];

    const cloneLength = localStorage.getItem("ad_length");
    $("[deliverable-1-seconds=true]").val(cloneLength);
    $("[deliverable-1-seconds=true]").addClass("cc_cloned");
    store.fields.deliverable_1_seconds = cloneLength;

    const cloneDeliverable1 = localStorage.getItem("deliverable_1");
    $("[deliverable_1=true]").val(cloneDeliverable1);
    //why doesnt this work with deliverable_1=true..?
    $("#deliverable_1").addClass("cc_cloned");
    store.fields.deliverable_1 = cloneDeliverable1;
    $("#deliverable_1")
      .siblings("label")
      .find(".form-checkbox-square")
      .addClass("w--redirected-checked");

    const cloneScript = localStorage.getItem("script");
    $("#cc_script").val(cloneScript);
    store.fields.inspiration_pitch = cloneScript;

    const cloneSummary = localStorage.getItem("summary");
    store.fields.inspiration_summary = cloneSummary;

    const clonePitch = localStorage.getItem("pitch");
    store.fields.inspiration_pitch = clonePitch;

    const cloneThumbnail = localStorage.getItem("videoimg");
    if (cloneThumbnail) {
      const thumbnailElement = $("#cc_inspiration-thumbnail");
      thumbnailElement.attr("src", cloneThumbnail);
      $("#cc_no-inspiration").remove();
    }

    const cloneBudget = localStorage.getItem("budget");
    $("[import-budget=true]").val(cloneBudget);
    $("[import-budget=true]").addClass("cc_cloned");
    store.fields.budget = cloneBudget;

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
      view: window
    });
    console.log("clickGenre is " + clickGenre);
    // Dispatch the click event
    genreDropdown.get(0).dispatchEvent(clickGenre);
    $("#cc_clonedGenre").addClass("cc_cloned");
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
    let optionPurpose = $("#cc_ad-purpose")
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
      view: window
    });

    console.log("Before dispatching click event for purposeDropdown");
    // Dispatch the click event
    purposeDropdown.get(0).dispatchEvent(clickPurpose);
    $("#cc_clonedPurpose").addClass("cc_cloned");
    console.log("After dispatching click event for purposeDropdown");

    //
    //
    //
    // clone date
    $("#cc_startDate").addClass("cc_cloned");
    $("#cc_deliveryDate").addClass("cc_cloned");
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
    $("#cc_clonedStyles").addClass("cc_cloned");

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
  }
});

const store = reactive({
  creativeStyles: [],
  coverImagePreviewUrl: "",
  isWorldwide: false,
  startDateAsap: false,
  dueDateAsap: false,
  isAIWorking: false,
  fields: {
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

    video_inspo: [""],
    video_inspiration_airtable_record_id: [],
    image_inspo: [],
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
    script: "",
    gear_and_legal: "",

    tier: "recXWLp6CM9bxcXvi",
    cover_image: [],
    attachments: [],

    showRewritePrompt: false,
    rewritePrompt: "",
    rewriteSelectionStart: null,
    rewriteSelectionLength: 0
  }
});

const getCreativeStyles = async () => {
  const response = await fetch(
    "https://live.api-server.io/run/v1/63247325f53f9b56f2a69a16",
    {
      method: "GET"
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

const generateCreativePrompt = async () => {
  store.isAIWorking = true;

  //
  //
  // concept writer
  const response = await fetch(
    "https://live.api-server.io/run/v1/645a5a18ac05f887e8ac410f",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken()
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
        rewriteSelectionLength: store.rewriteSelectionLength
      })
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
};

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
        Authorization: "Bearer " + MemberStack.getToken()
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
        rewriteSelectionLength: store.rewriteSelectionLength
      })
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
};

const generateScript = async () => {
  store.isAIWorking = true;

  //
  //
  // script writer
  const response = await fetch(
    "https://live.api-server.io/run/v1/646ce4aeb0c1d0bf94ad07cc",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken()
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
        creative_prompt: editorCreativePrompt.getText().trim(),
        inspiration_script: store.fields.inspiration_script,
        genre_prompt: store.fields.genre_prompt,
        inspiration_summary: store.fields.inspiration_summary,
        inspiration_pitch: store.fields.inspiration_pitch
      })
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
      editorScript.container.children[0].innerHTML = htmlValue;
    }
  }
};

//
//
// logistics writer
const generateGearAndLegal = async () => {
  store.isAIWorking = true;

  const response = await fetch(
    "https://live.api-server.io/run/v1/646cef803c42aae0b9ed8831",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken()
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
        creative_prompt: editorCreativePrompt.getText().trim(),
        script: editorScript.getText().trim()
      })
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

const mounted = async () => {
  store.creativeStyles = await getCreativeStyles();

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

  editorBrandServiceOrProduct.on("text-change", function (
    delta,
    oldDelta,
    source
  ) {
    store.fields.brand_service_or_product =
      editorBrandServiceOrProduct.container.children[0].innerHTML;
  });

  editorBrandIdentityOrMessage.on("text-change", function (
    delta,
    oldDelta,
    source
  ) {
    store.fields.brand_identity_or_message =
      editorBrandIdentityOrMessage.container.children[0].innerHTML;
  });

  editorBrandTopicsToHighlight.on("text-change", function (
    delta,
    oldDelta,
    source
  ) {
    store.fields.brand_topics_to_highlight =
      editorBrandTopicsToHighlight.container.children[0].innerHTML;
  });

  editorDescription.on("text-change", function (delta, oldDelta, source) {
    store.fields.description =
      editorDescription.container.children[0].innerHTML;
  });

  // AI Quill events
  editorCreativePrompt.on("text-change", function (delta, oldDelta, source) {
    store.fields.creative_prompt =
      editorCreativePrompt.container.children[0].innerHTML;
  });

  editorScript.on("text-change", function (delta, oldDelta, source) {
    store.fields.script = editorScript.container.children[0].innerHTML;
  });

  editorGearAndLegal.on("text-change", function (delta, oldDelta, source) {
    store.fields.gear_and_legal =
      editorGearAndLegal.container.children[0].innerHTML;
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

  editorCreativePrompt.on("selection-change", function (
    range,
    oldRange,
    source
  ) {
    handleSelectionChange(range, oldRange, source, editorCreativePrompt);
  });
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

const app = createApp({
  // exposed to all expressions
  mounted,
  store,
  WebflowFormComponent,
  getBackgroundStyle,
  addVideoInspo,
  budgetUpdated,
  generateCreativePrompt,
  generateCreativePromptRewrite,
  generateScript,
  generateGearAndLegal,

  get getCheckedCreativeStyles() {
    return store.creativeStyles.filter((skill) =>
      store.fields.style_keywords.includes(skill.airtable_id)
    );
  }
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
