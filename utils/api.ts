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
        document.cookie =
          "software_activated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        localStorage.removeItem("allowed_modules");
        window.location.href = "/activate";
      }
    }
    // Gracefully handle unauthorized/forbidden by returning an empty success response
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("madrassa_token");
        } catch {}
      }
      // Return a synthetic empty response so pages don't crash due to unhandled rejections
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: "OK",
        headers: error.response?.headers || {},
        config: error.config,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
