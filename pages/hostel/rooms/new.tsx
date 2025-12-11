import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function NewRoomPage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const h = await api.get("/api/hostel/hostels");
      setHostels(h.data?.hostels || []);
    };
    load();
  }, []);

  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/hostel/rooms", {
        hostelId: form.hostelId,
        roomNo: form.roomNo,
        beds: Number(form.beds || 0),
      });
      router.push("/hostel/rooms");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <HostelLayout title="نیا کمرہ">
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
          <label className="block text-xs text-gray-700 mb-1">ہاسٹل</label>
          <select
            value={form.hostelId || ""}
            onChange={(e) => set({ hostelId: e.target.value })}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">انتخاب کریں</option>
            {hostels.map((h: any) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              کمرہ نمبر
            </label>
            <input
              value={form.roomNo || ""}
              onChange={(e) => set({ roomNo: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">بیڈز</label>
            <input
              type="number"
              min={1}
              value={form.beds || 1}
              onChange={(e) => set({ beds: e.target.value })}
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
