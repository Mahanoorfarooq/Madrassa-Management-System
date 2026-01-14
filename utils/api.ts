import axios from "axios";

export const api = axios.create();

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("madrassa_token");
    if (!token) {
      const cookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("auth_token="));
      if (cookie) token = cookie.split("=")[1];
    }
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
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("madrassa_token");
        } catch {}
        // Expire auth cookie to keep client and middleware in sync
        document.cookie =
          "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        const next = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        window.location.replace(`/login?next=${next}`);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
