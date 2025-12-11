import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";

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
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-2xl ml-auto text-right space-y-4"
      >
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">تاریخ</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set({ date: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">خوراک</label>
            <select
              value={form.mealType}
              onChange={(e) => set({ mealType: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="breakfast">ناشتہ</option>
              <option value="lunch">دوپہر</option>
              <option value="dinner">رات</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              کل طلبہ (اختیاری)
            </label>
            <input
              type="number"
              min={0}
              value={form.totalStudents || ""}
              onChange={(e) => set({ totalStudents: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">کل خرچ</label>
            <input
              type="number"
              min={0}
              value={form.totalCost || 0}
              onChange={(e) => set({ totalCost: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">نوٹس</label>
          <input
            value={form.notes || ""}
            onChange={(e) => set({ notes: e.target.value })}
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
