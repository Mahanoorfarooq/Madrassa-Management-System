import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  FileText,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  User,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function NewInvoicePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ items: [], status: "unpaid" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const [dRes, sRes] = await Promise.all([
        api.get("/api/departments"),
        api.get("/api/students"),
      ]);
      setDepartments(dRes.data?.departments || []);
      setStudents(sRes.data?.students || []);
    };
    boot();
  }, []);

  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));
  const addItem = () =>
    setForm((s: any) => ({
      ...s,
      items: [...(s.items || []), { title: "", amount: 0 }],
    }));
  const removeItem = (idx: number) =>
    setForm((s: any) => ({
      ...s,
      items: s.items.filter((_: any, i: number) => i !== idx),
    }));
  const updateItem = (idx: number, patch: any) =>
    setForm((s: any) => ({
      ...s,
      items: s.items.map((it: any, i: number) =>
        i === idx ? { ...it, ...patch } : it
      ),
    }));

  const total = useMemo(
    () =>
      (form.items || []).reduce(
        (s: number, x: any) => s + (Number(x.amount) || 0),
        0
      ),
    [form.items]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/finance/invoices", {
        studentId: form.studentId,
        departmentId: form.departmentId || undefined,
        period: form.period,
        items: form.items,
        total,
        dueDate: form.dueDate || undefined,
        status: form.status,
        notes: form.notes || undefined,
      });
      router.push("/finance/invoices");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نئی انوائس</h1>
              <p className="text-purple-100 text-xs">انوائس بنائیں</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              بنیادی معلومات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  طالب علم
                </label>
                <select
                  value={form.studentId || ""}
                  onChange={(e) => set({ studentId: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">طالب علم منتخب کریں</option>
                  {students.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} - {s.rollNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5" />
                    شعبہ (اختیاری)
                  </div>
                </label>
                <select
                  value={form.departmentId || ""}
                  onChange={(e) => set({ departmentId: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">شعبہ منتخب کریں</option>
                  {departments.map((d: any) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    پیریڈ (YYYY-MM)
                  </div>
                </label>
                <input
                  value={form.period || ""}
                  onChange={(e) => set({ period: e.target.value })}
                  placeholder="مثلاً: 2025-01"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    آخری تاریخ (اختیاری)
                  </div>
                </label>
                <input
                  type="date"
                  value={form.dueDate || ""}
                  onChange={(e) => set({ dueDate: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                فیس کی آئیٹمز
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 text-xs font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                آئیٹم شامل کریں
              </button>
            </div>
            <div className="space-y-3">
              {(form.items || []).map((it: any, idx: number) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="md:col-span-6">
                    <input
                      value={it.title}
                      onChange={(e) =>
                        updateItem(idx, { title: e.target.value })
                      }
                      placeholder="عنوان (مثلاً: ماہانہ فیس)"
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <input
                      type="number"
                      min={0}
                      value={it.amount}
                      onChange={(e) =>
                        updateItem(idx, {
                          amount: parseFloat(e.target.value || "0"),
                        })
                      }
                      placeholder="رقم"
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-center">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="w-full rounded-lg bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
              {(form.items || []).length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    کوئی آئیٹم شامل نہیں۔ اوپر بٹن سے آئیٹم شامل کریں
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          {total > 0 && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-gray-800">
                    کل رقم:
                  </span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  ₨ {total.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Status & Notes */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">
              اضافی تفصیلات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  حالت
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set({ status: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="unpaid">غیر ادائیگی</option>
                  <option value="partial">جزوی ادائیگی</option>
                  <option value="paid">ادائیگی</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  نوٹس (اختیاری)
                </label>
                <input
                  value={form.notes || ""}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="اضافی معلومات..."
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 text-sm font-semibold transition-all"
            >
              منسوخ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>محفوظ کریں</span>
            </button>
          </div>
        </form>
      </div>
    </FinanceLayout>
  );
}
