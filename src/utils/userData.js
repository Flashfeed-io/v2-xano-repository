import { getHeaders } from './constants.js';

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
  const userData = await verifyAuth(store);
  if (!userData) {
    alert('Authentication required. Redirecting to login page...');
    window.location.href = "/login";
    return;
  }
  return userData;
};

export const verifyAuth = async (store) => {
  const token = checkAndGetToken(store, false);
  if (!token) return false;

  try {
    const url = 'https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem/auth/me';
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
      const errorData = await response.json().catch(() => null);
      console.error("[DEBUG] Error response data:", errorData);
      
      // Call logout endpoint and clean up auth data on 401 Unauthorized (expired session)
      if (response.status === 401) {
        // Call logout endpoint first
        try {
          const logoutResponse = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem/auth/logout', {
            method: "POST",
            headers: getHeaders(token)
          });
          if (!logoutResponse.ok) {
            console.error("Logout endpoint returned error:", logoutResponse.status);
          }
        } catch (e) {
          console.error("Error calling logout endpoint:", e);
        }
        // Then clear client-side auth data
        document.cookie = 'ff_auth=; Max-Age=0';
        store.token = '';
        window.location.href = "/login";
        return false;
      }
      
      throw new Error(
        errorData?.message || 
        `Server responded with status ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("[DEBUG] verifyAuth success:", data);
    
    // Store the user data in the store
    store.user = data;
    return data;
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
    const response = await fetch('https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem/auth/logout', {
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
