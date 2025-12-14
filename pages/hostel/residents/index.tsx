import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import {
  Users,
  RefreshCw,
  Filter,
  Calendar,
  User,
  Building2,
  DoorOpen,
  Bed,
} from "lucide-react";

export default function ResidentsPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [hostelId, setHostelId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  // loader removed per request

  const loadRooms = async (hid: string) => {
    const r = await api.get("/api/hostel/rooms", {
      params: { hostelId: hid || undefined },
    });
    setRooms(r.data?.rooms || []);
  };

  const load = async () => {
    const r = await api.get("/api/hostel/allocations", {
      params: {
        hostelId: hostelId || undefined,
        roomId: roomId || undefined,
        active: true,
      },
    });
    setItems(r.data?.allocations || []);
  };

  useEffect(() => {
    const boot = async () => {
      const h = await api.get("/api/hostel/hostels");
      setHostels(h.data?.hostels || []);
      await loadRooms("");
      await load();
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HostelLayout title="ریذیڈنٹس">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ریذیڈنٹس کی فہرست</h1>
                <p className="text-amber-100 text-xs">
                  موجودہ رہائشی طلبہ دیکھیں اور تلاش کریں
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-xs text-amber-100">کل ریذیڈنٹس</div>
              <div className="text-2xl font-bold">{items.length}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                ہاسٹل
              </label>
              <select
                value={hostelId}
                onChange={(e) => {
                  setHostelId(e.target.value);
                  loadRooms(e.target.value);
                  setRoomId("");
                }}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">تمام ہاسٹلز</option>
                {hostels.map((h: any) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-gray-500" />
                کمرہ
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={!hostelId}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">تمام کمرے</option>
                {rooms.map((r: any) => (
                  <option key={r._id} value={r._id}>
                    {r.roomNo}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                تازہ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی ریذیڈنٹ نہیں ملا
              </h3>
              <p className="text-sm text-gray-500">
                فلٹرز تبدیل کر کے دوبارہ کوشش کریں
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <User className="w-4 h-4" />
                        طالب علم
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Building2 className="w-4 h-4" />
                        ہاسٹل
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <DoorOpen className="w-4 h-4" />
                        کمرہ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Bed className="w-4 h-4" />
                        بیڈ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4" />
                        داخلے کی تاریخ
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it: any, index) => (
                    <tr
                      key={it._id}
                      className={`hover:bg-amber-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800 truncate">
                              {it.studentId
                                ? [
                                    it.studentId.fullName || it.studentId.name,
                                    it.studentId.rollNumber,
                                  ]
                                    .filter(Boolean)
                                    .join(" - ") || "-"
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          {it.hostelId?.name || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                          <DoorOpen className="w-3.5 h-3.5" />
                          {it.roomId?.roomNo || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                          <Bed className="w-3.5 h-3.5" />
                          {it.bedNo}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {String(it.fromDate).substring(0, 10)}
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
