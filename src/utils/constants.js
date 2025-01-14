 // Environment configuration
export const ENV = {
  PRODUCTION: 'production',
  TEST: 'test'
};

// Current environment - change this to switch between environments
export const CURRENT_ENV = ENV.PRODUCTION;

// API Headers configuration
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Data-Source': CURRENT_ENV === ENV.PRODUCTION ? 'live' : 'test',
    'X-Branch': 'v1'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[DEBUG] Headers with token:', headers);
  } else {
    console.log('[DEBUG] Headers without token:', headers);
  }

  return headers;
};

// Base URLs
export const API_BASE_URL = {
  [ENV.PRODUCTION]: 'https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem',
  [ENV.TEST]: 'https://x6c9-ohwk-nih4.n7d.xano.io/api:Y296zGem'
};

// Get the current base URL based on environment
export const getCurrentXanoUrl = () => {
  const url = API_BASE_URL[CURRENT_ENV];
  console.log('[DEBUG] Using base URL:', url);
  return url;
};