import axios from "axios";

function getToken() {
  return (
    window.localStorage.getItem("aether-auth-token") ||
    window.sessionStorage.getItem("aether-auth-token")
  );
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[AUTH] Unauthorized request");
    }
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export function saveAuthToken(token, remember = true) {
  window.localStorage.removeItem("aether-auth-token");
  window.sessionStorage.removeItem("aether-auth-token");
  (remember ? window.localStorage : window.sessionStorage).setItem(
    "aether-auth-token",
    token
  );
}

export function clearAuthToken() {
  window.localStorage.removeItem("aether-auth-token");
  window.sessionStorage.removeItem("aether-auth-token");
}

export function getAuthToken() {
  return getToken();
}

export default api;
