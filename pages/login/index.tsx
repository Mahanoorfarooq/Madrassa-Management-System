import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!username || !password) {
      setError("یوزر نام اور پاس ورڈ درکار ہیں۔");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulated API call - replace with your actual endpoint
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse errors and fall back to generic message
      }

      if (!res.ok) {
        const message = data?.message || "غلط یوزر نام یا پاس ورڈ۔";
        setError(message);
        return;
      }

      const token: string | undefined = data?.token;
      const redirect: string | undefined = data?.user?.redirect;

      if (token && typeof window !== "undefined") {
        localStorage.setItem("madrassa_token", token);
      }

      if (typeof window !== "undefined") {
        window.location.href = redirect || "/";
      }
    } catch (err: any) {
      setError("سروَر سے رابطہ ممکن نہیں۔ براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      {/* Home button */}
      <Link
        href="/"
        className="absolute top-12 right-12 h-12 w-12 rounded-lg bg-grey-200 shadow-sm hover:shadow-md border border-slate-200 flex items-center justify-center transition-all duration-200 hover:scale-105"
        aria-label="ہوم"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-8 w-8 text-slate-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>

      {/* Main card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <span className="text-4xl">🕌</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-8">لاگ اِن</h1>
            <p className="text-emerald-50 text-sm">
              جامعہ مینجمنٹ سسٹم تک رسائی حاصل کریں
            </p>
          </div>

          <div className="px-8 py-8">
            {/* Error message */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 text-right border border-red-100">
                <div className="flex items-center justify-end gap-2">
                  <span>{error}</span>
                  <span>⚠️</span>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-5 text-right">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  یوزر نام
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && submit()}
                  placeholder="اپنا یوزر نام درج کریں"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  پاس ورڈ
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && submit()}
                  placeholder="اپنا پاس ورڈ درج کریں"
                  required
                />
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="w-full mt-6 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>درج ہو رہا ہے…</span>
                  </div>
                ) : (
                  <span>لاگ اِن کریں</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Powered by Academia Pro © 2025
        </p>
      </div>
    </div>
  );
}
