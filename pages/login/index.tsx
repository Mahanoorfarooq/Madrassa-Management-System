import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (!username || !password) {
      setError("یوزر نام اور پاس ورڈ درکار ہیں۔");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        const message = data?.message || "غلط یوزر نام یا پاس ورڈ۔";
        setError(message);
        return;
      }

      const token: string | undefined = data?.token;
      const redirect: string | undefined = data?.user?.redirect;

      if (token && typeof window !== "undefined") {
        // Persist token for axios Authorization header usage
        localStorage.setItem("madrassa_token", token);
        // Also set cookie so Next.js middleware can authorize SSR/route access
        document.cookie = `auth_token=${token}; Path=/; SameSite=Lax`;
        if (data.allowedModules) {
          localStorage.setItem(
            "allowed_modules",
            JSON.stringify(data.allowedModules),
          );
        }
      }

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const nextParam = params.get("next");
        const target =
          nextParam && nextParam.startsWith("/")
            ? nextParam
            : redirect || "/teacher";
        // Use client-side navigation to avoid full reload
        router.replace(target);
      }
    } catch (err: any) {
      setError("سروَر سے رابطہ ممکن نہیں۔ براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Image Overlay - Zoomed out for better quality */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("/login-bg.png")`,
          backgroundSize: "600px", // Increased size from 300px
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="w-full max-w-[380px] z-10 p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col items-stretch overflow-hidden">
          {/* Orange Header Section - Now much tighter */}
          <div className="bg-secondary pt-2 pb-4 flex flex-col items-center text-white relative overflow-hidden">
            {/* Even Larger Logo with aggressive margins to shrink the box */}
            <div className="relative w-64 h-64 -my-10">
              <Image
                src="/logo-new.png"
                alt="Madrassa Logo"
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-sm invert brightness-0"
              />
            </div>

            <p
              className="text-[10px] opacity-90 font-urdu text-center leading-relaxed max-w-[240px] -mt-2 relative z-10"
              style={{ fontFamily: "Noto Nastaliq Urdu, serif" }}
            >
              جامعہ مینجمنٹ سسٹم تک رسائی حاصل کریں
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-[10px] px-2 py-1.5 rounded text-right border border-red-100 font-urdu">
                {error} ⚠️
              </div>
            )}

            <div className="relative">
              <label className="block text-right text-[10px] font-semibold text-gray-400 mb-1 absolute -top-2 right-4 bg-white px-1 font-urdu z-10">
                یوزر کا نام
              </label>
              <input
                type="text"
                placeholder="یوزر نام"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-right dir-rtl placeholder:text-slate-300 font-urdu"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && submit()}
              />
            </div>

            <div className="relative">
              <label className="block text-right text-[10px] font-semibold text-gray-400 mb-1 absolute -top-2 right-4 bg-white px-1 font-urdu z-10">
                پاس ورڈ
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="پاس ورڈ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-right dir-rtl placeholder:text-slate-300 font-urdu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && submit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary transition-colors"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-secondary hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-200 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-urdu text-base">لاگ ان کریں</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.75 2.25H21a.75.75 0 01.75.75v18a.75.75 0 01-.75.75h-5.25a.75.75 0 010-1.5H20.25V3.75h-4.5a.75.75 0 01-.75-.75zm6.133 8.683a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L19.438 10.5 16.5 7.562a.75.75 0 011.06-1.06l4.25 4.25z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M12.75 12a.75.75 0 01.75.75v.01l-6 .005a.75.75 0 010-1.5l6-.005V12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <p className="text-slate-400 text-xs font-urdu opacity-80">
                Powered by Itqanify 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
