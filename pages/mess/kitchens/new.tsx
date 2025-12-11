import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";

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
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-2xl ml-auto text-right space-y-4"
      >
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-700 mb-1">نام</label>
          <input
            value={form.name || ""}
            onChange={(e) => set({ name: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">یومیہ مینو</label>
          <input
            value={form.dailyMenu || ""}
            onChange={(e) => set({ dailyMenu: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              ناشتہ وقت
            </label>
            <input
              value={form.breakfastTime || ""}
              onChange={(e) => set({ breakfastTime: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              دوپہر وقت
            </label>
            <input
              value={form.lunchTime || ""}
              onChange={(e) => set({ lunchTime: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">رات وقت</label>
            <input
              value={form.dinnerTime || ""}
              onChange={(e) => set({ dinnerTime: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            فی طالب علم لاگت (اختیاری)
          </label>
          <input
            type="number"
            min={0}
            value={form.perStudentCost || ""}
            onChange={(e) => set({ perStudentCost: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end">
          <button className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold">
            محفوظ کریں
          </button>
        </div>
      </form>
    </MessLayout>
  );
}
