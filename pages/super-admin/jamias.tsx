import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

interface JamiaRow {
  _id: string;
  name: string;
  address?: string;
  isActive: boolean;
  isDeleted: boolean;
  settings?: {
    feeCurrency?: string;
    academicYear?: string;
  };
}

export default function SuperAdminJamiasPage() {
  const router = useRouter();
  const [items, setItems] = useState<JamiaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newFeeCurrency, setNewFeeCurrency] = useState("");
  const [newAcademicYear, setNewAcademicYear] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("madrassa_token")
        : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/super-admin/jamias");
      setItems(res.data?.jamias || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "جامعات لوڈ کرنے میں مسئلہ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createJamia = async () => {
    if (!newName.trim()) return;
    try {
      setCreating(true);
      setError(null);
      await api.post("/api/super-admin/jamias", {
        name: newName.trim(),
        address: newAddress.trim() || undefined,
        settings: {
          feeCurrency: newFeeCurrency.trim() || undefined,
          academicYear: newAcademicYear.trim() || undefined,
        },
      });
      setNewName("");
      setNewAddress("");
      setNewFeeCurrency("");
      setNewAcademicYear("");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "نیا جامعہ بنانے میں مسئلہ");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (jamia: JamiaRow) => {
    try {
      setError(null);
      await api.put(`/api/super-admin/jamias/${jamia._id}`, {
        isActive: !jamia.isActive,
      });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "اسٹیٹس تبدیل کرنے میں مسئلہ");
    }
  };

  const softDelete = async (jamia: JamiaRow) => {
    if (!window.confirm("کیا آپ واقعی اس جامعہ کو غیر فعال کرنا چاہتے ہیں؟")) {
      return;
    }
    try {
      setError(null);
      await api.delete(`/api/super-admin/jamias/${jamia._id}`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "جامعہ غیر فعال کرنے میں مسئلہ");
    }
  };

  return (
    <div className="min-h-screen bg-lightBg p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-right">جامعہ مینجمنٹ</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm text-right">
          {error}
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <h2 className="text-lg font-semibold text-right">
          نیا جامعہ شامل کریں
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="جامعہ کا نام"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="پتہ"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="فیس کرنسی (مثلاً PKR)"
            value={newFeeCurrency}
            onChange={(e) => setNewFeeCurrency(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="اکیڈمک سال (مثلاً 2024-25)"
            value={newAcademicYear}
            onChange={(e) => setNewAcademicYear(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-2">
          <button
            onClick={createJamia}
            disabled={creating}
            className="px-4 py-2 rounded bg-primary text-white text-sm disabled:opacity-60"
          >
            {creating ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-right">تمام جامعات</h2>
          {loading && (
            <span className="text-xs text-gray-500">لوڈ ہو رہا ہے...</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2">نام</th>
                <th className="px-3 py-2">پتہ</th>
                <th className="px-3 py-2">کرنسی</th>
                <th className="px-3 py-2">اکیڈمک سال</th>
                <th className="px-3 py-2">اسٹیٹس</th>
                <th className="px-3 py-2">ایکشن</th>
              </tr>
            </thead>
            <tbody>
              {items.map((j) => (
                <tr key={j._id} className="border-t">
                  <td className="px-3 py-2">{j.name}</td>
                  <td className="px-3 py-2">{j.address || "-"}</td>
                  <td className="px-3 py-2">
                    {j.settings?.feeCurrency || "-"}
                  </td>
                  <td className="px-3 py-2">
                    {j.settings?.academicYear || "-"}
                  </td>
                  <td className="px-3 py-2">
                    {j.isDeleted ? (
                      <span className="text-xs text-red-500">غیر فعال</span>
                    ) : j.isActive ? (
                      <span className="text-xs text-green-600">فعال</span>
                    ) : (
                      <span className="text-xs text-yellow-600">
                        عارضی غیر فعال
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 space-x-2 space-x-reverse">
                    <button
                      onClick={() => toggleActive(j)}
                      className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                    >
                      {j.isActive ? "غیر فعال کریں" : "فعال کریں"}
                    </button>
                    <button
                      onClick={() => softDelete(j)}
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                    >
                      مستقل غیر فعال
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm text-gray-500"
                  >
                    کوئی جامعہ موجود نہیں۔
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
