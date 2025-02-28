import { toast } from "/src/utils/toastManager.js";
import { getHeaders } from '/src/utils/constants.js';

const statusEnum = Object.freeze({
  idle: 0,
  error: 1,
  success: 2,
  loading: 3
});

export function WebflowFormComponent(props = {}) {
  return {
    // variables
    actionUrl: null,
    redirectUrl: null,
    status: statusEnum.idle,
    errorMessage: null,

    // lifecycle hooks
    mounted(el) {
      window.console.log("mounted: WebflowFormComponent");
      const form = el.querySelector("form");

      if (form) {
        this.actionUrl = form.getAttribute("action");
        this.redirectUrl = form.getAttribute("data-redirect");
        
        // Add submit event listener to the form
        form.addEventListener("submit", (e) => this.submit(e));
      } else {
        throw Error("WebflowFormComponent requires a <form> element!");
      }
    },

    // getters
    get isIdle() {
      return this.status === statusEnum.idle;
    },
    get isError() {
      return this.status === statusEnum.error;
    },
    get isSuccess() {
      return this.status === statusEnum.success;
    },
    get isLoading() {
      return this.status === statusEnum.loading;
    },

    // Status change watcher
    async watchStatus(newStatus) {
      console.log('watchStatus called with status:', newStatus);
      console.log('Current error message:', this.errorMessage);
      
      // Update store status
      if (props.store) {
        props.store.isError = newStatus === statusEnum.error;
        props.store.isSuccess = newStatus === statusEnum.success;
        props.store.message = this.errorMessage || '';
      }
      
      if (newStatus === statusEnum.error) {
        console.log('Attempting to show error toast with message:', this.errorMessage);
        toast.error(this.errorMessage || "An error occurred. Please contact support if this problem persists.");
      } else if (newStatus === statusEnum.success) {
        console.log('Attempting to show success toast');
        toast.success(props.successMessage || "Success!");
      }
    },

    // methods
    async submit(event) {
      event.preventDefault();
      event.stopPropagation();
      
      // If already loading, don't submit again
      if (this.status === statusEnum.loading) {
        return;
      }
      
      this.status = statusEnum.loading;
      
      // Add loading class
      const submitBtn = document.querySelector("[cc_data='submit-validation']");
      if (submitBtn) {
        submitBtn.classList.add("cc_request-loading");
      }
      
      try {
        console.log("Submitting to:", this.actionUrl, "with fields:", props.fields);
        
        const headers = {
          'Content-Type': 'application/json',
          ...getHeaders()
        };
        if (props.requiresAuth !== false) {
          const token = document.cookie.split(';').find(c => c.trim().startsWith('ff_auth=')).split('=')[1];
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }

        const response = await fetch(this.actionUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(props.fields)
        });

        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
          console.log('Response not OK, status:', response.status);
          console.log('Error data:', data);
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        console.log("Form submission successful:", data);

        if (data.authToken) {
          document.cookie = `ff_auth=${data.authToken}; path=/;`;
          if (props.store) {
            props.store.token = data.authToken;
            console.log('Updated token in store');
          }
        }

        this.status = statusEnum.success;
        console.log('Setting status to success');
        await this.watchStatus(this.status);

        if (this.redirectUrl) {
          window.location.assign(this.redirectUrl);
        }

        if (props?.onSuccess && typeof props.onSuccess === "function") {
          props.onSuccess(data);
        }

      } catch (error) {
        console.log("Form submission error:", error);
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        
        this.errorMessage = error.message || "An unexpected error occurred. Please try again.";
        console.log('Setting error message to:', this.errorMessage);
        
        this.status = statusEnum.error;
        console.log('Setting status to error');
        await this.watchStatus(this.status);
        
        if (submitBtn) {
          submitBtn.classList.remove("cc_request-loading");
        }
      } finally {
        // Remove loading class after completion (success or error)
        if (this.status !== statusEnum.error && submitBtn) {
          submitBtn.classList.remove("cc_request-loading");
        }
      }
    },
  };
}
