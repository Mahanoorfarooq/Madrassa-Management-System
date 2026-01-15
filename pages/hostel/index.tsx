import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  Home,
  ClipboardCheck,
  Users,
  Building2,
  Bed,
  Filter,
} from "lucide-react";

export default function HostelDashboard() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allocs, setAllocs] = useState<any[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "free" | "occupied">(
    "all"
  );

  useEffect(() => {
    const load = async () => {
      const [h, r, a] = await Promise.all([
        api.get("/api/hostel/hostels"),
        api.get("/api/hostel/rooms"),
        api.get("/api/hostel/allocations", { params: { active: true } }),
      ]);
      setHostels(h.data?.hostels || []);
      setRooms(r.data?.rooms || []);
      setAllocs(a.data?.allocations || []);
    };
    load();
  }, []);

  const totalBeds = rooms.reduce((sum, r: any) => sum + (r.beds || 0), 0);
  const occupiedBeds = allocs.filter((a: any) => a.isActive).length;
  const freeBeds = Math.max(totalBeds - occupiedBeds, 0);

  const hostelStats = useMemo(() => {
    if (!hostels.length || !allocs.length) {
      return { labels: [] as string[], values: [] as number[] };
    }
    const labels: string[] = [];
    const values: number[] = [];
    hostels.forEach((h: any) => {
      const hid = String(h._id);
      const count = allocs.filter((a: any) => {
        if (!a.isActive || !a.hostelId) return false;
        const allocHostelId =
          typeof a.hostelId === "string"
            ? a.hostelId
            : a.hostelId._id
            ? String(a.hostelId._id)
            : "";
        return allocHostelId === hid;
      }).length;
      if (count > 0) {
        labels.push(h.name);
        values.push(count);
      }
    });
    return { labels, values };
  }, [hostels, allocs]);

  const getRoomIdFromAlloc = (a: any) => {
    if (!a.roomId) return "";
    if (typeof a.roomId === "string") return a.roomId;
    return a.roomId._id || "";
  };

  const filteredHostels = selectedHostelId
    ? hostels.filter((h: any) => String(h._id) === selectedHostelId)
    : hostels;

  return (
    <HostelLayout title="ہاسٹل ڈیش بورڈ">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ہاسٹل ڈیش بورڈ</h1>
              <p className="text-white/80 text-xs">
                ہاسٹل، کمروں اور بیڈ الوکیشن کی مجموعی صورتحال
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <div>
                  <p className="text-[10px] text-blue-100">کل ہاسٹل</p>
                  <p className="text-sm font-bold">{hostels.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <div>
                  <p className="text-[10px] text-blue-100">کل کمرے</p>
                  <p className="text-sm font-bold">{rooms.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4" />
                <div>
                  <p className="text-[10px] text-blue-100">کل بیڈز</p>
                  <p className="text-sm font-bold">{totalBeds}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="text-[10px] text-blue-100">خالی بیڈز</p>
                  <p className="text-sm font-bold">{freeBeds}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-300" />
                <div>
                  <p className="text-[10px] text-blue-100">مصروف بیڈز</p>
                  <p className="text-sm font-bold">{occupiedBeds}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                ہاسٹل
              </label>
              <select
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                بیڈ کی حیثیت
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === "all"
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  سب بیڈز
                </button>
                <button
                  onClick={() => setStatusFilter("free")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === "free"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  خالی ({freeBeds})
                </button>
                <button
                  onClick={() => setStatusFilter("occupied")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === "occupied"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  مصروف ({occupiedBeds})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hostels & Rooms */}
        {filteredHostels.map((h: any) => {
          const hostelRooms = rooms.filter(
            (r: any) => String(r.hostelId) === String(h._id)
          );
          if (!hostelRooms.length) return null;

          return (
            <div
              key={h._id}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
            >
              {/* Hostel Header */}
              <div className="bg-gray-50 border-b-2 border-gray-200 px-5 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {h.name}
                  </h2>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                    {hostelRooms.length} کمرے
                  </span>
                </div>
              </div>

              {/* Rooms */}
              <div className="p-5 space-y-4">
                {hostelRooms.map((room: any) => {
                  const roomAllocs = allocs.filter(
                    (a: any) =>
                      String(getRoomIdFromAlloc(a)) === String(room._id) &&
                      a.isActive
                  );
                  const bedNumbers: string[] = [];
                  const total = Number(room.beds || 0);
                  for (let i = 1; i <= total; i++) {
                    bedNumbers.push(String(i));
                  }
                  roomAllocs.forEach((a: any) => {
                    if (!bedNumbers.includes(a.bedNo)) {
                      bedNumbers.push(a.bedNo);
                    }
                  });

                  return (
                    <div
                      key={room._id}
                      className="border border-gray-200 rounded-lg bg-gray-50/50 p-4"
                    >
                      {/* Room Header */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                        <div className="text-sm font-bold text-gray-800">
                          کمرہ {room.roomNo}
                        </div>
                        <div className="flex gap-2 text-[11px]">
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">
                            خالی: {total - roomAllocs.length}
                          </span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                            مصروف: {roomAllocs.length}
                          </span>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium">
                            کل: {total}
                          </span>
                        </div>
                      </div>

                      {/* Beds Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {bedNumbers.map((bedNo) => {
                          const alloc = roomAllocs.find(
                            (a: any) => a.bedNo === bedNo
                          );
                          const isOccupied = !!alloc;
                          if (statusFilter === "free" && isOccupied) {
                            return null;
                          }
                          if (statusFilter === "occupied" && !isOccupied) {
                            return null;
                          }
                          const student = alloc?.studentId;
                          const studentLabel = student
                            ? [student.fullName, student.rollNumber]
                                .filter(Boolean)
                                .join(" - ")
                            : "خالی";

                          return (
                            <div
                              key={bedNo}
                              className={`rounded-lg border-2 p-3 text-right transition-all hover:shadow-md ${
                                isOccupied
                                  ? "bg-red-50 border-red-300"
                                  : "bg-emerald-50 border-emerald-300"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Bed
                                  className={`w-4 h-4 ${
                                    isOccupied
                                      ? "text-red-600"
                                      : "text-emerald-600"
                                  }`}
                                />
                                <div
                                  className={`text-base font-bold ${
                                    isOccupied
                                      ? "text-red-700"
                                      : "text-emerald-700"
                                  }`}
                                >
                                  {bedNo}
                                </div>
                              </div>
                              <div
                                className={`text-xs font-semibold mb-1 ${
                                  isOccupied
                                    ? "text-red-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                {isOccupied ? "مصروف" : "خالی"}
                              </div>
                              <div className="text-[11px] text-gray-600 truncate">
                                {studentLabel}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </HostelLayout>
  );
}
