import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function NewHostelPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/hostel/hostels", {
        name: form.name,
        capacity: Number(form.capacity || 0),
        rooms: Number(form.rooms || 0),
        wardenName: form.wardenName || undefined,
      });
      router.push("/hostel/hostels");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <HostelLayout title="نیا ہاسٹل">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">گنجائش</label>
            <input
              type="number"
              min={0}
              value={form.capacity || 0}
              onChange={(e) => set({ capacity: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">کمرے</label>
            <input
              type="number"
              min={0}
              value={form.rooms || 0}
              onChange={(e) => set({ rooms: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">وارڈن</label>
            <input
              value={form.wardenName || ""}
              onChange={(e) => set({ wardenName: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
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
