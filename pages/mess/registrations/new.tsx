import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import {
  UserCheck,
  Save,
  AlertCircle,
  User,
  ChefHat,
  Calendar,
  CheckCircle,
} from "lucide-react";

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
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نئی رجسٹریشن شامل کریں</h1>
              <p className="text-white/80 text-xs">
                طالب علم کی میس میں رجسٹریشن کریں
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
              {/* Student and Kitchen Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    طالب علم منتخب کریں
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.studentId || ""}
                    onChange={(e) => set({ studentId: e.target.value })}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="">طالب علم منتخب کریں</option>
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
                      const label = hostelInfo
                        ? `${base} (${hostelInfo})`
                        : base;
                      return (
                        <option key={s._id} value={s._id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-gray-500" />
                    کچن منتخب کریں
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.kitchenId || ""}
                    onChange={(e) => set({ kitchenId: e.target.value })}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="">کچن منتخب کریں</option>
                    {kitchens.map((h: any) => (
                      <option key={h._id} value={h._id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    شروع کی تاریخ
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.fromDate}
                    onChange={(e) => set({ fromDate: e.target.value })}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    اختتام کی تاریخ
                    <span className="text-xs text-gray-500 font-normal">
                      (اختیاری)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.toDate || ""}
                    onChange={(e) => set({ toDate: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.isActive}
                    onChange={(e) => set({ isActive: e.target.checked })}
                    className="w-5 h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary/10 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      رجسٹریشن فعال ہے
                    </span>
                  </div>
                </label>
                <p className="text-xs text-gray-600 mt-2 mr-8">
                  اگر یہ آپشن منتخب ہے تو طالب علم فوری طور پر میس سے کھانا لے
                  سکتا ہے
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/mess/registrations")}
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
