import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const isDev = process.env.NODE_ENV !== "production";
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // same-origin by default

export const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: false,
});

function normalizeAxiosError(error: any) {
  // Network or CORS or server down
  if (error?.code === "ECONNABORTED") {
    return {
      status: 0,
      code: "TIMEOUT",
      message: "ریکویسٹ کی مدت ختم ہوگئی۔ دوبارہ کوشش کریں۔",
      details: isDev ? error.message : undefined,
    };
  }
  if (!error?.response) {
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message: "سرور دستیاب نہیں ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں۔",
      details: isDev ? error?.message : undefined,
    };
  }

  const status = error.response.status as number;
  let message = "کچھ غلط ہوگیا۔";
  let code = "HTTP_ERROR";

  if (status === 400) {
    code = "BAD_REQUEST";
    message = error.response.data?.message || "درخواست میں غلطی ہے۔";
  } else if (status === 401) {
    code = "UNAUTHORIZED";
    message = error.response.data?.message || "براہ کرم لاگ اِن کریں۔";
  } else if (status === 403) {
    code = "FORBIDDEN";
    message = error.response.data?.message || "یہ عمل ممنوع ہے۔";
  } else if (status === 404) {
    code = "NOT_FOUND";
    message = error.response.data?.message || "API راستہ نہیں ملا۔";
  } else if (status >= 500) {
    code = "SERVER_ERROR";
    message = error.response.data?.message || "سرور میں خرابی پیش آئی ہے۔";
  }

  return {
    status,
    code,
    message,
    details: isDev ? error.response?.data || error.message : undefined,
  };
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("madrassa_token");
    if (!token) {
      const cookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("auth_token="));
      if (cookie) token = cookie.split("=")[1];
    }
    if (token) {
      // Ensure headers object is mutable for axios v1
      const headers = (config.headers ?? {}) as Record<string, any>;
      headers["Authorization"] = `Bearer ${token}`;
      config.headers = headers as any;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // If backend already returns {success, message, data}, pass through
    return response;
  },
  (error: AxiosError | any) => {
    const norm = normalizeAxiosError(error);
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error("API Error:", {
        url: (error?.config as any)?.url,
        method: (error?.config as any)?.method,
        status: norm.status,
        code: norm.code,
        details: norm.details,
      });
    }

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
          window.location.pathname + window.location.search,
        );
        window.location.replace(`/login?next=${next}`);
      }
    }
    return Promise.reject(norm);
  },
);

export default api;
