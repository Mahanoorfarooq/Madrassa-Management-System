import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import {
  UserPlus,
  Building2,
  DoorOpen,
  Bed,
  Calendar,
  CheckSquare,
  X,
  Save,
} from "lucide-react";

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
      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-md mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">نئی الوکیشن</h2>
              <p className="text-indigo-100 text-sm">
                طالب علم کو کمرے میں الاٹ کریں
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 mb-5 flex items-center gap-2 border border-red-200">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                طالب علم
              </label>
              <select
                value={form.studentId || ""}
                onChange={(e) => set({ studentId: e.target.value })}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="">انتخاب کریں</option>
                {students.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    {s.fullName} - {s.rollNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Hostel and Room */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  ہاسٹل
                </label>
                <select
                  value={form.hostelId || ""}
                  onChange={(e) => onHostelChange(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-purple-600" />
                  کمرہ
                </label>
                <select
                  value={form.roomId || ""}
                  onChange={(e) => set({ roomId: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
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

            {/* Bed Number and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Bed className="w-4 h-4 text-blue-600" />
                  بیڈ نمبر
                </label>
                <input
                  value={form.bedNo || ""}
                  onChange={(e) => set({ bedNo: e.target.value })}
                  placeholder="بیڈ نمبر"
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  از
                </label>
                <input
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => set({ fromDate: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تک (اختیاری)
                </label>
                <input
                  type="date"
                  value={form.toDate || ""}
                  onChange={(e) => set({ toDate: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <input
                type="checkbox"
                id="isActive"
                checked={!!form.isActive}
                onChange={(e) => set({ isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-200"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                فعال
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/hostel/allocations")}
              className="flex items-center gap-2 rounded-lg bg-gray-100 text-gray-700 px-5 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-all"
            >
              <X className="w-4 h-4" />
              منسوخ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              محفوظ کریں
            </button>
          </div>
        </form>
      </div>
    </HostelLayout>
  );
}
