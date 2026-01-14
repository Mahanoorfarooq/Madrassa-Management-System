import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

// Labels shown at the top of the login page, keyed by either user role or module key
const roleLabels: Record<string, string> = {
  // role-based logins
  admin: "ایڈمن / پرنسپل لاگ اِن",
  teacher: "استاد لاگ اِن",
  student: "طالب علم لاگ اِن",
  staff: "عملہ لاگ اِن",
  // module-based logins
  talba: "طلبہ ماڈیول لاگ اِن",
  usataza: "اساتذہ ماڈیول لاگ اِن",
  finance: "فنانس ماڈیول لاگ اِن",
  hostel: "ہاسٹل ماڈیول لاگ اِن",
  mess: "میس ماڈیول لاگ اِن",
  nisab: "نصاب ماڈیول لاگ اِن",
  library: "لائبریری ماڈیول لاگ اِن",
  hazri: "حاضری ماڈیول لاگ اِن",
};

// Role-based module landing pages
const dashboardByRole: Record<string, string> = {
  admin: "/modules/madrassa",
  teacher: "/teacher",
  student: "/dashboard/student",
  staff: "/dashboard/staff",
};

// If the URL is /login/talba or /login/hostel etc, redirect to that module's dashboard
const moduleDashboardByKey: Record<string, string> = {
  talba: "/talba",
  usataza: "/usataza",
  finance: "/finance",
  hostel: "/hostel",
  mess: "/mess",
  nisab: "/nisab",
  library: "/library",
  hazri: "/hazri",
};

export default function RoleLoginPage() {
  const router = useRouter();
  const { role } = router.query;

  // Hard-disable the /login/admin path and use the shared /login page instead
  useEffect(() => {
    if (typeof role === "string") {
      router.replace("/login");
    }
  }, [role, router]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title =
    typeof role === "string" && roleLabels[role] ? roleLabels[role] : "لاگ اِن";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { username, password });
      const { token, user, allowedModules } = res.data || {};
      if (token && user) {
        if (typeof window !== "undefined") {
          // Persist token for client and middleware
          localStorage.setItem("madrassa_token", token);
          document.cookie = `auth_token=${token}; Path=/; SameSite=Lax`;
          if (allowedModules) {
            try {
              localStorage.setItem(
                "allowed_modules",
                JSON.stringify(allowedModules)
              );
            } catch {}
          }
        }

        const userRole = user.role as string;
        const currentKey = typeof role === "string" ? role : undefined;
        // Prefer explicit next param
        const params = new URLSearchParams(window.location.search);
        const nextParam = params.get("next");
        const fallback =
          (userRole && dashboardByRole[userRole]) ||
          (currentKey && moduleDashboardByKey[currentKey]) ||
          "/";
        const target =
          nextParam && nextParam.startsWith("/") ? nextParam : fallback;
        router.replace(target);
      } else {
        setError("لاگ اِن میں مسئلہ پیش آیا، دوبارہ کوشش کریں۔");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "غلط یوزر نام یا پاس ورڈ۔";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBg px-4 relative">
      <Link
        href="/"
        className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm h-12 w-12 text-gray-600 hover:bg-gray-50"
        aria-label="ہوم"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-4.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 border border-gray-100">
        <h1 className="text-xl font-bold text-center text-primary mb-4">
          {title}
        </h1>
        <p className="text-center text-xs text-gray-600 mb-4">
          اپنا یوزر نام اور پاس ورڈ درج کریں
        </p>
        {error && (
          <div className="mb-3 rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-sm text-gray-700 mb-1">یوزر نام</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">پاس ورڈ</label>
            <input
              type="password"
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded py-2 text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
