import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { Modal } from "@/components/ui/Modal";

interface DeptOption {
  _id: string;
  name: string;
  code?: string;
}

interface HalaqahRow {
  _id: string;
  name: string;
  departmentId?: string;
  isActive?: boolean;
}

export default function TalbaHalaqahPage() {
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [items, setItems] = useState<HalaqahRow[]>([]);
  const [q, setQ] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/halaqah", {
        params: { departmentId: departmentId || undefined },
      });
      setItems(res.data?.halaqah || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "حلقہ فہرست لوڈ نہیں ہو سکی۔");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/departments");
        setDepartments(res.data?.departments || []);
      } catch {
        setDepartments([]);
      }
    })();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  const add = async () => {
    if (!name.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/halaqah", {
        name: name.trim(),
        departmentId: departmentId || undefined,
      });
      setName("");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا۔");
    } finally {
      setLoading(false);
    }
  };

  const askRemove = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!deleteId) return;
    await api.delete(`/api/halaqah/${deleteId}`);
    await load();
    setConfirmOpen(false);
    setDeleteId(null);
  };

  return (
    <TalbaLayout title="حلقہ مینجمنٹ">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                شعبہ (اختیاری)
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="">تمام</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                حلقہ کا نام
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="مثال: حلقہ الف"
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
          <div className="flex justify-end p-3 border-b bg-gray-50">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="حلقہ تلاش کریں..."
              className="w-full md:w-72 rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <table className="min-w-full text-sm text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">نام</th>
                <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    لوڈ ہو رہا ہے...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    کوئی ریکارڈ موجود نہیں۔
                  </td>
                </tr>
              )}
              {items
                .filter((h) =>
                  (h.name || "").toLowerCase().includes(q.toLowerCase())
                )
                .map((h) => (
                  <tr key={h._id} className="border-t">
                    <td className="px-3 py-2 font-semibold text-gray-900">
                      {h.name}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => askRemove(h._id)}
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

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
        title="تصدیق حذف"
      >
        <div className="space-y-4 text-right">
          <p>کیا آپ واقعی یہ حلقہ حذف کرنا چاہتے ہیں؟</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setConfirmOpen(false);
                setDeleteId(null);
              }}
              className="rounded border px-4 py-2 text-xs"
            >
              منسوخ کریں
            </button>
            <button
              onClick={confirmRemove}
              className="rounded bg-red-600 text-white px-4 py-2 text-xs font-semibold hover:bg-red-700"
            >
              حذف کریں
            </button>
          </div>
        </div>
      </Modal>
    </TalbaLayout>
  );
}
