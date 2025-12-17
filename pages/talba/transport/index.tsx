import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

interface RouteRow {
  _id: string;
  name: string;
  code?: string;
  fee?: number;
  isActive?: boolean;
}

export default function TalbaTransportRoutesPage() {
  const [items, setItems] = useState<RouteRow[]>([]);
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [fee, setFee] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/transport-routes");
      setItems(res.data?.routes || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "روٹس لوڈ نہیں ہو سکے۔");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/transport-routes", {
        name: name.trim(),
        code: code.trim() || undefined,
        fee: fee.trim() ? Number(fee) : undefined,
      });
      setName("");
      setCode("");
      setFee("");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا۔");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("کیا آپ واقعی یہ روٹ حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/transport-routes/${id}`);
    await load();
  };

  return (
    <TalbaLayout title="ٹرانسپورٹ روٹس">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                روٹ کا نام
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="مثال: روٹ A"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                کوڈ (اختیاری)
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="A1"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                فیس (اختیاری)
              </label>
              <input
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="2000"
              />
            </div>
            <div className="flex justify-end">
              <button
                disabled={loading}
                onClick={add}
                className="rounded bg-primary text-white px-5 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                شامل کریں
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full text-sm text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">نام</th>
                <th className="px-3 py-2 font-semibold text-gray-700">کوڈ</th>
                <th className="px-3 py-2 font-semibold text-gray-700">فیس</th>
                <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    لوڈ ہو رہا ہے...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    کوئی ریکارڈ موجود نہیں۔
                  </td>
                </tr>
              )}
              {items.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-3 py-2 font-semibold text-gray-900">
                    {r.name}
                  </td>
                  <td className="px-3 py-2 font-mono">{r.code || "—"}</td>
                  <td className="px-3 py-2">
                    {typeof r.fee === "number" ? r.fee : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => remove(r._id)}
                      className="rounded border border-red-200 text-red-700 px-3 py-1.5 text-xs font-semibold hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TalbaLayout>
  );
}
