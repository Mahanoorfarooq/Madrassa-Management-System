import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import {
  DollarSign,
  Building2,
  FileText,
  Repeat,
  CheckSquare,
  X,
  Save,
} from "lucide-react";

export default function NewHostelFeePage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    periodicity: "monthly",
    isActive: true,
  });
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
      await api.post("/api/hostel/fees", {
        hostelId: form.hostelId,
        title: form.title,
        amount: Number(form.amount || 0),
        periodicity: form.periodicity,
        isActive: !!form.isActive,
      });
      router.push("/hostel/fees");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    }
  };

  return (
    <HostelLayout title=" ">
      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-5 text-white shadow-md mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">نئی ہاسٹل فیس</h2>
              <p className="text-white/80 text-sm">فیس کی تفصیلات درج کریں</p>
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
            {/* Hostel Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                ہاسٹل
              </label>
              <select
                value={form.hostelId || ""}
                onChange={(e) => set({ hostelId: e.target.value })}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              >
                <option value="">انتخاب کریں</option>
                {hostels.map((h: any) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                عنوان
              </label>
              <input
                value={form.title || ""}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="فیس کا عنوان"
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            {/* Amount and Periodicity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  رقم
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.amount || 0}
                  onChange={(e) => set({ amount: e.target.value })}
                  placeholder="رقم درج کریں"
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-primary" />
                  پیریڈ
                </label>
                <select
                  value={form.periodicity}
                  onChange={(e) => set({ periodicity: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                >
                  <option value="monthly">ماہانہ</option>
                  <option value="once">ایک دفعہ</option>
                </select>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <input
                type="checkbox"
                id="isActive"
                checked={!!form.isActive}
                onChange={(e) => set({ isActive: e.target.checked })}
                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/10"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                فعال
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/hostel/fees")}
              className="flex items-center gap-2 rounded-lg bg-gray-100 text-gray-700 px-5 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-all"
            >
              <X className="w-4 h-4" />
              منسوخ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-5 py-2.5 text-sm font-semibold transition-all shadow-md"
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
