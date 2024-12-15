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
