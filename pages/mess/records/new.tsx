import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import {
  Receipt,
  Save,
  AlertCircle,
  Calendar,
  UtensilsCrossed,
  Users,
  DollarSign,
  FileText,
} from "lucide-react";

export default function NewMessRecordPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({
    date: new Date().toISOString().substring(0, 10),
    mealType: "breakfast",
  });
  const [error, setError] = useState<string | null>(null);
  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/mess/records", {
        date: form.date,
        mealType: form.mealType,
        totalStudents: form.totalStudents
          ? Number(form.totalStudents)
          : undefined,
        totalCost: Number(form.totalCost || 0),
        notes: form.notes || undefined,
      });
      router.push("/mess/records");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <MessLayout title="نیا ریکارڈ">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نیا ریکارڈ شامل کریں</h1>
              <p className="text-white/80 text-xs">
                میس کا نیا اخراجات کا ریکارڈ بنائیں
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-5">
              {/* Date and Meal Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    تاریخ
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set({ date: e.target.value })}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                    خوراک کی قسم
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.mealType}
                    onChange={(e) => set({ mealType: e.target.value })}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="breakfast">ناشتہ</option>
                    <option value="lunch">دوپہر کا کھانا</option>
                    <option value="dinner">رات کا کھانا</option>
                  </select>
                </div>
              </div>

              {/* Students and Cost Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    کل طلبہ
                    <span className="text-xs text-gray-500 font-normal">
                      (اختیاری)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.totalStudents || ""}
                    onChange={(e) => set({ totalStudents: e.target.value })}
                    placeholder="طلبہ کی تعداد"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    کل اخراجات
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.totalCost || 0}
                    onChange={(e) => set({ totalCost: e.target.value })}
                    placeholder="رقم درج کریں"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  نوٹس
                  <span className="text-xs text-gray-500 font-normal">
                    (اختیاری)
                  </span>
                </label>
                <textarea
                  value={form.notes || ""}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="اضافی معلومات درج کریں..."
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/mess/records")}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 text-sm font-medium transition-all"
            >
              منسوخ کریں
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              محفوظ کریں
            </button>
          </div>
        </form>
      </div>
    </MessLayout>
  );
}
