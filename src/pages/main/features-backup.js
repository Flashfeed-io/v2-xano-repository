import { $fetch } from "ohmyfetch";
import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";

const store = reactive({
  prompt: 1,
});

function animateTyping(element, text) {
  var formattedText = formatText(text);
  var lines = formattedText.split("\n");
  var lineIndex = 0;
  var charIndex = 0;
  var interval = setInterval(function () {
    if (lineIndex < lines.length) {
      var line = lines[lineIndex];
      if (charIndex < line.length) {
        var charsToShow = line.substring(charIndex, charIndex + 5); // Adjust the number of characters to show per interval
        element.append(charsToShow);
        charIndex += 5; // Adjust the increment value to match the number of characters shown
      } else {
        element.append("<br>");
        lineIndex++;
        charIndex = 0;
        element.scrollTop(element.prop("scrollHeight")); // Scroll to the bottom
      }
    } else {
      clearInterval(interval);
    }
  }, 200); // Adjust typing speed by changing the interval (in milliseconds)
}

function formatText(text) {
  //var formattedText = text;
  //formattedText = formattedText.replace(/\[(.*?)\]/g, "<$1>"); // Convert [tag] to HTML tags
  return formattedText;
}

// Function to log all values in the store
const writeOnText = (promptNumber) => {
  console.trace("Trace for writeOnText function call"); // This will print the call stack
  console.log("promptNumber is", promptNumber);
  let text = "";
  switch (promptNumber) {
    case 1:
      text = `🎞 Concept / Storyline1`;
      break;
    case 2:
      text = `🎞 Concept / Storyline2`;
      break;
    case 3:
      text = `🎞 Concept / Storyline3`;
      break;
  }

  let target = $(".cc_writer-demo-cta");
  if (target.length) {
    target.empty();
    animateTyping(target, text);
    //$(this).remove();
  }

  animateTyping(document.querySelector(".cc_writer-demo-cta"), text);
};

// Function to log all values in the store
const logStoreValues = () => {
  // Use Object.keys to iterate over all keys in the store object
  Object.keys(store).forEach((key) => {
    console.log(`${key}: ${store[key]}`); // Log the key and its value
  });
};

// mounting the app
const mounted = async () => {
  store.prompt = 1;
  window.console.log("Mounted");
};

const app = createApp({
  // exposed to all expressions
  mounted,
  store,
  writeOnText,
  WebflowFormComponent,
  logStoreValues,
  animateTyping,
  formatText,
});

export { app };
