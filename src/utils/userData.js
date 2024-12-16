export const getUserData = async (store) => {
  if (!store.token) {
    console.log("No token found. User not logged in.");
    window.location.href = "/";
    return;
  }

  try {
    const response = await fetch("https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${store.token}`,
      },
    });
    const data = await response.json();
    store.user = data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    window.location.href = "/";
  }
};

export const logout = async (store) => {
  try {
    const response = await fetch("https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${store.token}`,
      },
    });
    
    if (!response.ok) {
      console.error("Logout failed:", response.status);
    }
    
    // Clear local data regardless of server response
    localStorage.removeItem('xanoToken');
    store.token = '';
    store.user = {};
    window.location.href = "/";
  } catch (error) {
    console.error("Error during logout:", error);
    // Still clear local data even if request fails
    localStorage.removeItem('xanoToken');
    store.token = '';
    store.user = {};
    window.location.href = "/";
  }
};
