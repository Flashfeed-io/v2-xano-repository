import { $fetch } from "ohmyfetch";

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
      // log to the console
      window.console.log("mounted: WebflowFormComponent");

      // get the form element
      const form = el.querySelector("form");

      if (form) {
        // set the action and redirect urls
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

    // methods
    async submit(event) {
      // prevent the default event
      event.preventDefault();

      // set the status to loading
      this.status = statusEnum.loading;
      console.log("Submitting form...");
      $("[cc_data='submit-validation']").addClass("cc_request-loading");

      try {
        console.log("Submitting to:", this.actionUrl, "with fields:", props.fields);
        
        // Prepare headers based on whether this is an authenticated route
        const headers = {};
        if (props.requiresAuth !== false) {
          const token = localStorage.getItem('xanoToken');
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }

        // post the form data to the api
        const response = await $fetch(this.actionUrl, {
          method: "POST",
          body: props.fields,
          headers
        });

        console.log("Form submission successful:", response);

        // If this is a login/signup endpoint and we got a token back, store it
        if (response.authToken) {
          localStorage.setItem('xanoToken', response.authToken);
          console.log('Stored Xano auth token');
        }

        // redirect on success if the redirectUrl has been set
        if (this.redirectUrl) {
          window.location.assign(this.redirectUrl);
        }

        // call the on success callback
        if (props?.onSuccess && typeof props.onSuccess === "function") {
          props.onSuccess(response);
        }

        // update the status
        this.status = statusEnum.success;
        $("[cc_data='submit-validation']").removeClass("cc_request-loading");
      } catch (error) {
        console.log("Form submission error:", error);
        this.status = statusEnum.error;
        $("[cc_data='submit-validation']").removeClass("cc_request-loading");
        
        // Store the error message if available
        if (error.response?.data) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = "An unexpected error occurred. Please try again.";
        }
      }
    },
  };
}
