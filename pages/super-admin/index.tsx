import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

interface DashboardStats {
  totalJamias: number;
  activeJamias: number;
  inactiveJamias: number;
}

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Basic guard in case middleware is bypassed somehow
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("madrassa_token")
        : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/super-admin/jamias");
        const jamias = (res.data?.jamias || []) as any[];
        const total = jamias.length;
        const active = jamias.filter((j) => j.isActive && !j.isDeleted).length;
        const inactive = jamias.filter(
          (j) => !j.isActive && !j.isDeleted
        ).length;
        setStats({
          totalJamias: total,
          activeJamias: active,
          inactiveJamias: inactive,
        });
      } catch (e: any) {
        setError(e?.response?.data?.message || "ڈیش بورڈ لوڈ کرنے میں مسئلہ");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-lightBg p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-right">
        Super Admin ڈیش بورڈ
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm text-right">
          {error}
        </div>
      )}

      {loading && <p className="text-right text-sm">لوڈ ہو رہا ہے...</p>}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="کل جامعات" value={stats.totalJamias} />
          <StatCard label="فعال جامعات" value={stats.activeJamias} />
          <StatCard label="غیر فعال جامعات" value={stats.inactiveJamias} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 text-right">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
