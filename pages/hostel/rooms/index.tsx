import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import { DoorOpen, Plus, RefreshCw, Bed, Filter } from "lucide-react";

export default function RoomsListPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [hostelId, setHostelId] = useState<string>("");
  // loader removed per request

  const load = async () => {
    const r = await api.get("/api/hostel/rooms", {
      params: { hostelId: hostelId || undefined },
    });
    setRooms(r.data?.rooms || []);
  };

  useEffect(() => {
    const boot = async () => {
      const h = await api.get("/api/hostel/hostels");
      setHostels(h.data?.hostels || []);
      await load();
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HostelLayout title="کمرے">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <DoorOpen className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">کمروں کی فہرست</h1>
                <p className="text-white/80 text-xs">
                  تمام کمرے دیکھیں اور منظم کریں
                </p>
              </div>
            </div>
            <Link
              href="/hostel/rooms/new"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نیا کمرہ
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                ہاسٹل
              </label>
              <select
                value={hostelId}
                onChange={(e) => setHostelId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام ہاسٹلز</option>
                {hostels.map((h: any) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                تازہ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <DoorOpen className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                کوئی کمرہ نہیں ملا
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      ہاسٹل
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      کمرہ نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      بیڈز
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rooms.map((r: any, index) => (
                    <tr
                      key={r._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-3 text-gray-700">
                        {hostels.find((h) => h._id === String(r.hostelId))
                          ?.name || "-"}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/hostel/rooms/${r._id}`}
                          className="text-primary hover:text-primary/90 font-medium hover:underline"
                        >
                          {r.roomNo}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Bed className="w-3.5 h-3.5 text-gray-400" />
                          {r.beds}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </HostelLayout>
  );
}
