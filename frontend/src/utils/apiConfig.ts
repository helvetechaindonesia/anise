export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Global fetch interceptor to bypass Ngrok browser warning
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  config = config || {};
  config.headers = {
    ...config.headers,
    'ngrok-skip-browser-warning': '69420'
  };
  return originalFetch(resource, config);
};
