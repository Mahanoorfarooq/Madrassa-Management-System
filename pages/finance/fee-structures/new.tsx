import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  Layers,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";

export default function NewFeeStructurePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [type, setType] = useState<string>("student_fee");
  const [effectiveFrom, setEffectiveFrom] = useState<string>(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [effectiveTo, setEffectiveTo] = useState<string>("");
  const [items, setItems] = useState<
    { name: string; amount: number; periodicity: "monthly" | "once" }[]
  >([]);
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
    };
    load();
  }, []);

  const addItem = () =>
    setItems((s) => [...s, { name: "", amount: 0, periodicity: "monthly" }]);
  const removeItem = (idx: number) =>
    setItems((s) => s.filter((_, i) => i !== idx));
  const updateItem = (
    idx: number,
    patch: Partial<{
      name: string;
      amount: number;
      periodicity: "monthly" | "once";
    }>
  ) =>
    setItems((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/finance/fee-structures", {
        departmentId: departmentId || undefined,
        type,
        items,
        effectiveFrom,
        effectiveTo: effectiveTo || undefined,
        isActive: true,
        notes: notes || undefined,
      });
      router.push("/finance/fee-structures");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نیا فیس ڈھانچہ</h1>
              <p className="text-indigo-100 text-xs">فیس کا ڈھانچہ بنائیں</p>
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
              <FileText className="w-4 h-4 text-indigo-600" />
              بنیادی معلومات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  شعبہ
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">شعبہ منتخب کریں</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  قسم
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="student_fee">طلبہ فیس</option>
                  <option value="hostel_fee">ہاسٹل فیس</option>
                  <option value="mess_fee">میس فیس</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    نافذ از
                  </div>
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    تک (اختیاری)
                  </div>
                </label>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                فیس کی آئیٹمز
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-xs font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                آئیٹم شامل کریں
              </button>
            </div>
            <div className="space-y-3">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="md:col-span-5">
                    <input
                      value={it.name}
                      onChange={(e) =>
                        updateItem(idx, { name: e.target.value })
                      }
                      placeholder="عنوان (مثلاً: ماہانہ فیس)"
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="md:col-span-3">
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
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select
                      value={it.periodicity}
                      onChange={(e) =>
                        updateItem(idx, { periodicity: e.target.value as any })
                      }
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="monthly">ماہانہ</option>
                      <option value="once">ایک دفعہ</option>
                    </select>
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
              {items.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Layers className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    کوئی آئیٹم شامل نہیں۔ اوپر بٹن سے آئیٹم شامل کریں
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              نوٹس (اختیاری)
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اضافی معلومات..."
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
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
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>محفوظ ہو رہا ہے...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>محفوظ کریں</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </FinanceLayout>
  );
}
