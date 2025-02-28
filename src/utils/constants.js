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
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};