import { useEffect, useState } from "react";
import Head from "next/head";
import { Eye, EyeOff, Key, ShieldCheck } from "lucide-react";
import { useRouter } from "next/router";
import api from "@/utils/api";

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
}

export default function SuperAdminUnlockPage() {
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/auth/me");
        const role = res.data?.user?.role as string | undefined;
        if (role !== "super_admin") {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  const submit = async () => {
    setError(null);

    if (!licenseKey.trim()) {
      setError("Super Admin License Key is required");
      return;
    }

    try {
      setLoading(true);
      const resp = await api.post("/api/super-admin/unlock", { licenseKey });

      const token: string | undefined = (resp as any)?.data?.token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("madrassa_token", token);
      }

      const isActivated = getCookieValue("software_activated") === "true";
      router.replace(isActivated ? "/super-admin" : "/super-admin/licenses");
    } catch (e: any) {
      setError(e?.message || "Invalid Super Admin License Key");
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("madrassa_token");
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Head>
        <title>Super Admin Unlock</title>
      </Head>

      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-saPrimary p-10 text-white text-center">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-secondary" />
          <h1 className="text-2xl font-black">Super Admin Unlock</h1>
          <p className="text-white/60 text-xs mt-2">
            Enter Super Admin License Key to continue
          </p>
        </div>

        <div className="p-10 space-y-6">
          <div className="relative">
            <label className="block text-right text-[10px] font-black text-slate-400 mb-2 mr-2">
              Enter Super Admin License Key
            </label>
            <input
              type={showKey ? "text" : "password"}
              placeholder="••••-••••-••••-••••"
              value={licenseKey.toUpperCase()}
              onChange={(e) => {
                setLicenseKey(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className={`w-full border-2 pr-12 ${
                error ? "border-red-500" : "border-slate-100"
              } rounded-2xl px-5 py-4 text-center tracking-[0.2em] focus:outline-none focus:border-secondary transition-all font-mono font-bold text-saPrimary bg-slate-50`}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-4 top-[42px] text-slate-400 hover:text-saPrimary transition-colors"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {error && (
              <p className="text-[10px] text-red-500 text-right mt-2 pr-2">
                {error}
              </p>
            )}
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-saPrimary hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all text-base active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <span>{loading ? "Verifying" : "Verify"}</span>
            <Key className="h-5 w-5 text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}
