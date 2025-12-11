import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";

export default function NewRegistrationPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    fromDate: new Date().toISOString().substring(0, 10),
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const [a, k] = await Promise.all([
        api.get("/api/hostel/allocations", { params: { active: true } }),
        api.get("/api/mess/kitchens"),
      ]);

      const allocations = a.data?.allocations || [];
      const byId: Record<string, any> = {};
      allocations.forEach((al: any) => {
        const s = al.studentId;
        if (!s) return;
        const id = typeof s === "string" ? s : s._id;
        if (!id) return;
        if (!byId[id]) {
          const hostel = al.hostelId;
          const room = al.roomId;
          byId[id] = {
            _id: id,
            fullName: (s as any).fullName,
            rollNumber: (s as any).rollNumber,
            hostelName:
              hostel && typeof hostel !== "string"
                ? (hostel as any).name
                : undefined,
            roomNo:
              room && typeof room !== "string"
                ? (room as any).roomNo
                : undefined,
            bedNo: al.bedNo,
          };
        }
      });
      setStudents(Object.values(byId));
      setKitchens(k.data?.kitchens || []);
    };
    boot();
  }, []);

  const set = (patch: any) => setForm((s: any) => ({ ...s, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/mess/registrations", {
        studentId: form.studentId,
        kitchenId: form.kitchenId,
        fromDate: form.fromDate,
        toDate: form.toDate || undefined,
        isActive: !!form.isActive,
      });
      router.push("/mess/registrations");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <MessLayout title="نئی رجسٹریشن">
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
            <label className="block text-xs text-gray-700 mb-1">طالب علم</label>
            <select
              value={form.studentId || ""}
              onChange={(e) => set({ studentId: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="">انتخاب کریں</option>
              {students.map((s: any) => {
                const base = [s.fullName, s.rollNumber]
                  .filter(Boolean)
                  .join(" - ");
                const hostelInfo = [
                  s.hostelName && `ہاسٹل ${s.hostelName}`,
                  s.roomNo && `کمرہ ${s.roomNo}`,
                  s.bedNo && `بیڈ ${s.bedNo}`,
                ]
                  .filter(Boolean)
                  .join(" / ");
                const label = hostelInfo ? `${base} (${hostelInfo})` : base;
                return (
                  <option key={s._id} value={s._id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">کچن</label>
            <select
              value={form.kitchenId || ""}
              onChange={(e) => set({ kitchenId: e.target.value })}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="">انتخاب کریں</option>
              {kitchens.map((h: any) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          <div className="flex items-end justify-end gap-2">
            <label className="text-xs text-gray-700">فعال</label>
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => set({ isActive: e.target.checked })}
            />
          </div>
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
