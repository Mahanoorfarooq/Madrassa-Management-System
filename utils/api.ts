import axios from "axios";

export const api = axios.create();

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("madrassa_token");
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 402) {
      if (typeof window !== "undefined") {
        // Clear activation cookie on client side to trigger middleware if needed
        document.cookie = "software_activated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        localStorage.removeItem("allowed_modules");
        window.location.href = "/activate";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
