import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import { Building2, Users, DoorOpen, UserCheck, X, Save } from "lucide-react";

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
      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-5 text-white shadow-md mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">نیا ہاسٹل</h2>
              <p className="text-white/80 text-sm">ہاسٹل کی تفصیلات درج کریں</p>
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
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                نام <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name || ""}
                onChange={(e) => set({ name: e.target.value })}
                required
                placeholder="ہاسٹل کا نام"
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            {/* Capacity, Rooms, Warden */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  گنجائش
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.capacity || 0}
                  onChange={(e) => set({ capacity: e.target.value })}
                  placeholder="کل طلبہ"
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-primary" />
                  کمرے
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.rooms || 0}
                  onChange={(e) => set({ rooms: e.target.value })}
                  placeholder="کل کمرے"
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  وارڈن
                </label>
                <input
                  value={form.wardenName || ""}
                  onChange={(e) => set({ wardenName: e.target.value })}
                  placeholder="وارڈن کا نام"
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/hostel/hostels")}
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
