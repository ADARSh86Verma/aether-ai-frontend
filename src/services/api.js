import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

/* ================================
   AUTH TOKEN HELPERS
================================ */

export function saveAuthToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
  }
}

export function getAuthToken() {
  return localStorage.getItem("access_token");
}

export function clearAuthToken() {
  localStorage.removeItem("access_token");
}

/* ================================
   AXIOS INSTANCE
================================ */

const api = axios.create({
  baseURL: API_URL,
  timeout: 180000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   REQUEST INTERCEPTOR
================================ */

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   RESPONSE INTERCEPTOR
================================ */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    /*
     * Optional:
     * अगर backend 401 दे तो token साफ कर सकते हैं।
     * अभी automatically logout नहीं कर रहे हैं,
     * ताकि existing auth flow खराब न हो।
     */

    return Promise.reject(error);
  }
);

export default api;