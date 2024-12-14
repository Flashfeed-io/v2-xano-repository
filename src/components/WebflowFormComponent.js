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
    watchStatus(newStatus) {
      console.log('watchStatus called with status:', newStatus);
      console.log('Current error message:', this.errorMessage);
      console.log('Props available:', props);
      console.log('Scope available:', props?.$scope);
      
      if (newStatus === statusEnum.error && props?.$scope?.showErrorToast) {
        console.log('Attempting to show error toast with message:', this.errorMessage);
        props.$scope.showErrorToast(this.errorMessage || "An error occurred");
      } else if (newStatus === statusEnum.success && props?.$scope?.showSuccessToast) {
        console.log('Attempting to show success toast');
        props.$scope.showSuccessToast("Successfully submitted!");
      }
    },

    // methods
    async submit(event) {
      event.preventDefault();
      event.stopPropagation();
      this.status = statusEnum.loading;
      
      // Add loading class
      $("[cc_data='submit-validation']").addClass("cc_request-loading");
      
      try {
        console.log("Submitting to:", this.actionUrl, "with fields:", props.fields);
        
        const headers = {
          'Content-Type': 'application/json'
        };
        if (props.requiresAuth !== false) {
          const token = localStorage.getItem('xanoToken');
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
          // Handle error responses (400, 401, etc.)
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        console.log("Form submission successful:", data);

        if (data.authToken) {
          localStorage.setItem('xanoToken', data.authToken);
          if (props.store) {
            props.store.token = data.authToken;
            console.log('Updated token in store');
          }
        }

        this.status = statusEnum.success;
        console.log('Setting status to success');
        this.watchStatus(this.status);

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
        
        // Set error message from response if available
        this.errorMessage = error.message || "An unexpected error occurred. Please try again.";
        console.log('Setting error message to:', this.errorMessage);
        
        this.status = statusEnum.error;
        console.log('Setting status to error');
        this.watchStatus(this.status);
        
        // Remove loading class on error
        $("[cc_data='submit-validation']").removeClass("cc_request-loading");
      } finally {
        // Remove loading class after completion (success or error)
        if (this.status !== statusEnum.error) {
          $("[cc_data='submit-validation']").removeClass("cc_request-loading");
        }
      }
    },
  };
}
