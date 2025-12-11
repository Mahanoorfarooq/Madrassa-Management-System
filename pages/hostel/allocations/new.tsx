import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function NewAllocationPage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    fromDate: new Date().toISOString().substring(0, 10),
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const [h, s] = await Promise.all([
        api.get("/api/hostel/hostels"),
        api.get("/api/students", {
          params: { status: "Active" },
        }),
      ]);
      setHostels(h.data?.hostels || []);
      setStudents(s.data?.students || []);
    };
    boot();
  }, []);

  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));

  const onHostelChange = async (hid: string) => {
    set({ hostelId: hid, roomId: "" });
    const r = await api.get("/api/hostel/rooms", { params: { hostelId: hid } });
    setRooms(r.data?.rooms || []);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/hostel/allocations", {
        hostelId: form.hostelId,
        roomId: form.roomId,
        studentId: form.studentId,
        bedNo: form.bedNo,
        fromDate: form.fromDate,
        toDate: form.toDate || undefined,
        isActive: !!form.isActive,
      });
      router.push("/hostel/allocations");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <HostelLayout title="نئی الوکیشن">
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
          <label className="block text-xs text-gray-700 mb-1">طالب علم</label>
          <select
            value={form.studentId || ""}
            onChange={(e) => set({ studentId: e.target.value })}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">انتخاب کریں</option>
            {students.map((s: any) => (
              <option key={s._id} value={s._id}>
                {s.fullName} - {s.rollNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">ہاسٹل</label>
            <select
              value={form.hostelId || ""}
              onChange={(e) => onHostelChange(e.target.value)}
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
          <div>
            <label className="block text-xs text-gray-700 mb-1">کمرہ</label>
            <select
              value={form.roomId || ""}
              onChange={(e) => set({ roomId: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="">انتخاب کریں</option>
              {rooms.map((r: any) => (
                <option key={r._id} value={r._id}>
                  {r.roomNo}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">بیڈ نمبر</label>
            <input
              value={form.bedNo || ""}
              onChange={(e) => set({ bedNo: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">از</label>
            <input
              type="date"
              value={form.fromDate}
              onChange={(e) => set({ fromDate: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              تک (اختیاری)
            </label>
            <input
              type="date"
              value={form.toDate || ""}
              onChange={(e) => set({ toDate: e.target.value })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
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
