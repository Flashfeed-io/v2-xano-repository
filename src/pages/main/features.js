import { $fetch } from "ohmyfetch";
import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";

const store = reactive({
  prompt: 1,
});

function animateTyping(element, text, append = false) {
  var formattedText = formatText(text);
  var lines = formattedText.split("\n");
  var fullText = "";
  var lineIndex = 0;
  var charIndex = 0;

  // Only clear any existing interval and content if we are not appending
  if (!append) {
    if (window.__typingInterval) clearInterval(window.__typingInterval);
    element.innerHTML = "";
  } else {
    // If appending, start from the end of the existing content
    fullText = element.innerHTML.replace(/<br>/g, "\n"); // Convert back to newline characters
  }

  window.__typingInterval = setInterval(function () {
    if (lineIndex < lines.length) {
      var line = lines[lineIndex];
      if (charIndex < line.length) {
        fullText += line[charIndex] === "\n" ? "<br>" : line[charIndex];
        element.innerHTML = fullText.replace(/\n/g, "<br>"); // Update the element's HTML
        charIndex++;
      } else {
        lineIndex++;
        charIndex = 0;
        if (lineIndex < lines.length) {
          fullText += "<br>"; // Add a line break for the next line
        }
      }
      if (lineIndex >= lines.length) {
        clearInterval(window.__typingInterval);
      }
    }
  }, 7);
}

function formatText(text) {
  // Example placeholder for text formatting logic
  return text; // Simply return the text for now, you can implement formatting as needed
}

// This is the internal function that actually does the typing animation
const writeOnTextInternal = (promptNumber) => {
  store.prompt = promptNumber;
  console.trace("Trace for writeOnText function call");
  console.log("promptNumber is", promptNumber);
  let text = "";
  switch (promptNumber) {
    case 1:
      text = `I like this video but I have an eCommerce brand that sells clothing. We sell women's clothing.
      
      I want the advertisement to be a little more family friendly too. My budget is $300.`;
      break;
    case 2:
      text = `We're doing a product launch video and want to use this as inspiration.
      
      Our product is at https://resumebuild.ai, The benefits are:
      • A.I. Bullet Generation
      • A.I. Keyword Targeting
      • Real-time content analysis
      • A.I. Cover letter & Resignation letter writer`;
      break;
    case 3:
      text = `I love the visuals of this ad and the writing style, but my business sells boutique perfume.
      
      Make something like this but shorter. My budget is only $200 and I don't have a team.`;
      break;
  }
  let target = document.querySelector(".cc_writer-demo-cta");
  if (target) {
    target.innerHTML = ""; // Clear existing content
    animateTyping(target, text);
  }
};

// Debounced function to prevent multiple executions in quick succession
window.dbwotTimeout = null;
const debouncedWriteOnText = (promptNumber) => {
  if (window.dbwotTimeout) clearTimeout(window.dbwotTimeout);
  window.dbwotTimeout = setTimeout(() => {
    writeOnTextInternal(promptNumber);
    window.dbwotTimeout = null;
  }, 200);
};

// Function to log all values in the store
const logStoreValues = () => {
  Object.keys(store).forEach((key) => {
    console.log(`${key}: ${store[key]}`);
  });
};

// Mounting the app
const mounted = async () => {
  store.prompt = 1;
  window.console.log("Mounted");
  debouncedWriteOnText(store.prompt); // Initialize with the first prompt
};

const app = createApp({
  mounted,
  store,
  debouncedWriteOnText, // Use the debounced function for typing
  WebflowFormComponent,
  logStoreValues,
  animateTyping,
  formatText,
  writeOnTextInternal,
});

export { app };
