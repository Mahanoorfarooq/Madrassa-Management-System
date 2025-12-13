import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { Home, ClipboardCheck, Users } from "lucide-react";

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
        <p className="text-sm text-gray-600 text-right max-w-2xl ml-auto">
          یہاں سے آپ ہاسٹل، کمروں اور بیڈ الوکیشن کی مجموعی صورتحال دیکھ سکتے
          ہیں، ساتھ ہی ہر ہاسٹل میں مصروف بیڈز کا خلاصہ بھی گراف کی صورت میں
          موجود ہے۔
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="کل ہاسٹل"
            value={hostels.length}
            icon={<Home className="w-4 h-4" />}
          />
          <StatCard
            title="کل کمرے"
            value={rooms.length}
            icon={<ClipboardCheck className="w-4 h-4" />}
          />
          <StatCard
            title="فعال الوکیشنز"
            value={allocs.length}
            icon={<Users className="w-4 h-4" />}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">ہاسٹل</label>
            <select
              value={selectedHostelId}
              onChange={(e) => setSelectedHostelId(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm"
            >
              <option value="">تمام</option>
              {hostels.map((h: any) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end gap-2 md:col-span-3 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-full border ${
                statusFilter === "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              سب بیڈز
            </button>
            <button
              onClick={() => setStatusFilter("free")}
              className={`px-3 py-1.5 rounded-full border ${
                statusFilter === "free"
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              خالی ({freeBeds})
            </button>
            <button
              onClick={() => setStatusFilter("occupied")}
              className={`px-3 py-1.5 rounded-full border ${
                statusFilter === "occupied"
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              مصروف ({occupiedBeds})
            </button>
          </div>
        </div>

        {hostelStats.labels.length > 0 && (
          <SimpleBarChart
            title="ہر ہاسٹل میں مصروف بیڈز"
            labels={hostelStats.labels}
            values={hostelStats.values}
          />
        )}

        {filteredHostels.map((h: any) => {
          const hostelRooms = rooms.filter(
            (r: any) => String(r.hostelId) === String(h._id)
          );
          if (!hostelRooms.length) return null;
          return (
            <div key={h._id} className="mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-2 text-right">
                {h.name}
              </h2>
              <div className="space-y-4">
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
                      className="border rounded-lg bg-white p-3"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-gray-800">
                          کمرہ {room.roomNo}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          کل بیڈز: {total}، مصروف: {roomAllocs.length}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
                              className={`rounded-lg border px-3 py-2 text-right text-xs ${
                                isOccupied
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
                              }`}
                            >
                              <div className="font-bold mb-1">بیڈ {bedNo}</div>
                              <div className="mb-1">
                                {isOccupied ? "مصروف" : "خالی"}
                              </div>
                              <div className="text-[11px] truncate">
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
