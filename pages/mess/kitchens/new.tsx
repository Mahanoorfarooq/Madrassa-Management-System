import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import {
  ChefHat,
  Save,
  AlertCircle,
  Tag,
  UtensilsCrossed,
  Clock,
  DollarSign,
} from "lucide-react";

export default function NewKitchenPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/mess/kitchens", {
        name: form.name,
        dailyMenu: form.dailyMenu || "",
        breakfastTime: form.breakfastTime || undefined,
        lunchTime: form.lunchTime || undefined,
        dinnerTime: form.dinnerTime || undefined,
        perStudentCost: form.perStudentCost
          ? Number(form.perStudentCost)
          : undefined,
      });
      router.push("/mess/kitchens");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <MessLayout title="نیا کچن">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نیا کچن شامل کریں</h1>
              <p className="text-blue-100 text-xs">
                نیا کچن بنائیں اور تفصیلات درج کریں
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
              {/* Kitchen Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  کچن کا نام
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name || ""}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="مثال: مرکزی کچن"
                  required
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Daily Menu */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-gray-500" />
                  یومیہ مینو
                  <span className="text-xs text-gray-500 font-normal">
                    (اختیاری)
                  </span>
                </label>
                <textarea
                  value={form.dailyMenu || ""}
                  onChange={(e) => set({ dailyMenu: e.target.value })}
                  placeholder="آج کا کھانا درج کریں..."
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              {/* Meal Times */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-800">
                    کھانے کا وقت
                  </h3>
                  <span className="text-xs text-gray-500">(اختیاری)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      ناشتہ
                    </label>
                    <input
                      value={form.breakfastTime || ""}
                      onChange={(e) => set({ breakfastTime: e.target.value })}
                      placeholder="مثال: 8:00 AM"
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      دوپہر کا کھانا
                    </label>
                    <input
                      value={form.lunchTime || ""}
                      onChange={(e) => set({ lunchTime: e.target.value })}
                      placeholder="مثال: 1:00 PM"
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      رات کا کھانا
                    </label>
                    <input
                      value={form.dinnerTime || ""}
                      onChange={(e) => set({ dinnerTime: e.target.value })}
                      placeholder="مثال: 8:00 PM"
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Per Student Cost */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  فی طالب علم لاگت
                  <span className="text-xs text-gray-500 font-normal">
                    (اختیاری)
                  </span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.perStudentCost || ""}
                  onChange={(e) => set({ perStudentCost: e.target.value })}
                  placeholder="رقم درج کریں"
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/mess/kitchens")}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 text-sm font-medium transition-all"
            >
              منسوخ کریں
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-all"
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
