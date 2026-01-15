import { useEffect, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";

interface DeptOption {
  _id: string;
  name: string;
  code?: string;
}

interface Option {
  _id: string;
  label: string;
}

interface DarsRow {
  _id: string;
  title: string;
  code?: string;
  book?: string;
  departmentId?: string;
  classId?: string;
  isActive?: boolean;
}

export default function NisabDarsPage() {
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<Option[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const [items, setItems] = useState<DarsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", code: "", book: "" });

  const loadDepartments = async () => {
    try {
      const res = await api.get("/api/departments");
      setDepartments(res.data?.departments || []);
    } catch {
      setDepartments([]);
    }
  };

  const loadClasses = async () => {
    if (!departmentId) {
      setClasses([]);
      return;
    }
    const res = await api.get("/api/classes", { params: { departmentId } });
    setClasses(
      (res.data?.classes || []).map((c: any) => ({
        _id: c._id,
        label: c.className || c.title,
      }))
    );
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/nisab/dars", {
        params: {
          departmentId: departmentId || undefined,
          classId: classId || undefined,
          q: q.trim() || undefined,
        },
      });
      setItems(res.data?.dars || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ نہیں ہو سکا۔");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    (async () => {
      await loadClasses();
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, classId]);

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/nisab/dars", {
        title: form.title.trim(),
        code: form.code.trim() || undefined,
        book: form.book.trim() || undefined,
        departmentId: departmentId || undefined,
        classId: classId || undefined,
      });
      setForm({ title: "", code: "", book: "" });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ۔");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("کیا آپ واقعی حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/nisab/dars/${id}`);
    await load();
  };

  return (
    <NisabLayout title="مضامین / دروس">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">شعبہ</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                کلاس (اختیاری)
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={!departmentId}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm bg-white disabled:bg-gray-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">تلاش</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") load();
                }}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="عنوان / کوڈ / کتاب"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2">
              <button
                onClick={load}
                className="rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all"
              >
                ریفریش
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-right mb-3">
            <h2 className="text-sm font-bold text-gray-800">نیا مضمون / درس</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">عنوان</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">کوڈ</label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">کتاب</label>
              <input
                value={form.book}
                onChange={(e) =>
                  setForm((p) => ({ ...p, book: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                disabled={loading || !form.title.trim()}
                onClick={add}
                className="rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                شامل کریں
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full text-sm text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">عنوان</th>
                <th className="px-3 py-2 font-semibold text-gray-700">کوڈ</th>
                <th className="px-3 py-2 font-semibold text-gray-700">کتاب</th>
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
              {items.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="px-3 py-2 font-semibold text-gray-900">
                    {s.title}
                  </td>
                  <td className="px-3 py-2 font-mono">{s.code || "—"}</td>
                  <td className="px-3 py-2">{s.book || "—"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => remove(s._id)}
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
    </NisabLayout>
  );
}
