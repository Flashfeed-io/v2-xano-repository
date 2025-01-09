import { getHeaders, getCurrentBaseUrl } from './constants.js';

// Reusable token check function
export const checkAndGetToken = (store, redirectOnFailure = true) => {
  if (!store.token) {
    console.log("[DEBUG] No token found in store");
    if (redirectOnFailure) {
      alert('No authentication token found. Please log in.');
      window.location.href = "/login";
    }
    return null;
  }
  console.log("[DEBUG] Token found:", store.token.substring(0, 10) + '...');
  return store.token;
};

export const getUserData = async (store) => {
  const isAuthenticated = await verifyAuth(store);
  
  if (!isAuthenticated) {
    alert('Authentication required. Redirecting to login page...');
    window.location.href = "/login";
    return;
  }
};

export const verifyAuth = async (store) => {
  const token = checkAndGetToken(store, false);
  if (!token) return false;

  try {
    const url = `${getCurrentBaseUrl()}/auth/me`;
    const headers = getHeaders(token);
    
    console.log("[DEBUG] verifyAuth request:", {
      url,
      headers,
      token: token.substring(0, 10) + '...'
    });

    const response = await fetch(url, {
      method: "GET",
      headers: headers
    });

    console.log("[DEBUG] verifyAuth response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers)
    });

    if (!response.ok) {
      // If response is 401 or 403, token is invalid or expired
      if (response.status === 401 || response.status === 403) {
        console.log("[DEBUG] Token expired or invalid");
        // Clear invalid token
        document.cookie = 'ff_auth=; Max-Age=0';
        store.token = '';
        alert('Your session has expired or is invalid. Please log in again.');
        return false;
      }

      const errorData = await response.json().catch(() => null);
      console.error("[DEBUG] Error response data:", errorData);
      
      throw new Error(
        errorData?.message || 
        `Server responded with status ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("[DEBUG] verifyAuth success:", data);
    return true;
  } catch (error) {
    console.error("[DEBUG] Error in verifyAuth:", error);
    alert('Error verifying authentication: ' + error.message);
    return false;
  }
};

export const logout = async (store) => {
  const token = checkAndGetToken(store, false);
  if (!token) {
    alert('Already logged out. Redirecting to login page...');
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch(`${getCurrentBaseUrl()}/auth/logout`, {
      method: "POST",
      headers: getHeaders(token)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Clear token regardless of response
    document.cookie = 'ff_auth=; Max-Age=0';
    store.token = '';
    alert('Successfully logged out. Redirecting to login page...');
    window.location.href = "/login";
  } catch (error) {
    console.error("Error logging out:", error);
    // Clear token even if request fails
    document.cookie = 'ff_auth=; Max-Age=0';
    store.token = '';
    alert('Error during logout: ' + error.message + '\nRedirecting to login page...');
    window.location.href = "/login";
  }
};
