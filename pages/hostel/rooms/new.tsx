import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import {
  DoorOpen,
  Save,
  Building2,
  Hash,
  Bed,
  AlertCircle,
} from "lucide-react";

export default function NewRoomPage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await api.post("/api/hostel/rooms", {
        hostelId: form.hostelId,
        roomNo: form.roomNo,
        beds: Number(form.beds || 0),
      });
      router.push("/hostel/rooms");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostelLayout title="نیا کمرہ">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <DoorOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">نیا کمرہ شامل کریں</h1>
              <p className="text-teal-100 text-xs">
                نیا کمرہ بنائیں اور تفصیلات درج کریں
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-5">
              {/* Hostel Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  ہاسٹل منتخب کریں
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.hostelId || ""}
                  onChange={(e) => set({ hostelId: e.target.value })}
                  required
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                >
                  <option value="">ہاسٹل منتخب کریں</option>
                  {hostels.map((h: any) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Room Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    کمرہ نمبر
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.roomNo || ""}
                    onChange={(e) => set({ roomNo: e.target.value })}
                    placeholder="مثال: 101"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                </div>

                {/* Number of Beds */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Bed className="w-4 h-4 text-gray-500" />
                    بیڈز کی تعداد
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.beds || 1}
                    onChange={(e) => set({ beds: e.target.value })}
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.push("/hostel/rooms")}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 text-sm font-semibold transition-all"
            >
              منسوخ کریں
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 text-sm font-semibold shadow-md disabled:opacity-60 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  محفوظ ہو رہا ہے...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  محفوظ کریں
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </HostelLayout>
  );
}
