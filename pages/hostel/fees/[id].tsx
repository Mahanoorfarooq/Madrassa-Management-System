import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function EditHostelFeePage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [form, setForm] = useState<any>({
    periodicity: "monthly",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const r = await api.get(`/api/hostel/fees/${id}`);
      setForm(r.data?.fee || { periodicity: "monthly", isActive: true });
      setLoading(false);
    };
    load();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.put(`/api/hostel/fees/${id}`, {
        title: form.title,
        amount: Number(form.amount || 0),
        periodicity: form.periodicity,
        isActive: !!form.isActive,
      });
      router.push("/hostel/fees");
    } catch (e: any) {
      setError(e?.response?.data?.message || "اپ ڈیٹ میں مسئلہ");
    }
  };

  if (loading)
    return <HostelLayout title="ہاسٹل فیس">لوڈ ہو رہا ہے...</HostelLayout>;

  return (
    <HostelLayout title="ہاسٹل فیس میں ترمیم">
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
          <label className="block text-xs text-gray-700 mb-1">عنوان</label>
          <input
            value={form.title || ""}
            onChange={(e) => set({ title: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">رقم</label>
            <input
              type="number"
              min={0}
              value={form.amount || 0}
              onChange={(e) => set({ amount: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">پیériڈ</label>
            <select
              value={form.periodicity}
              onChange={(e) => set({ periodicity: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="monthly">ماہانہ</option>
              <option value="once">ایک دفعہ</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <label className="text-xs text-gray-700">فعال</label>
          <input
            type="checkbox"
            checked={!!form.isActive}
            onChange={(e) => set({ isActive: e.target.checked })}
          />
        </div>
        <div className="flex justify-end">
          <button className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold">
            محفوظ کریں
          </button>
        </div>
      </form>
    </HostelLayout>
  );
}
