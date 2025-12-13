import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function ResidentsPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [hostelId, setHostelId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

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
  }, []);

  return (
    <HostelLayout title="ریذیڈنٹس">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">ہاسٹل</label>
          <select
            value={hostelId}
            onChange={(e) => {
              setHostelId(e.target.value);
              loadRooms(e.target.value);
            }}
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
        <div>
          <label className="text-xs text-gray-600 mb-1 block">کمرہ</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">تمام</option>
            {rooms.map((r: any) => (
              <option key={r._id} value={r._id}>
                {r.roomNo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end justify-end md:col-span-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            تازہ کریں
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">
                طالب علم
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">ہاسٹل</th>
              <th className="px-3 py-2 font-semibold text-gray-700">کمرہ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">بیڈ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">از</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={it._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  {it.studentId
                    ? [
                        it.studentId.fullName || it.studentId.name,
                        it.studentId.rollNumber,
                      ]
                        .filter(Boolean)
                        .join(" - ") || "-"
                    : "-"}
                </td>
                <td className="px-3 py-2">{it.hostelId?.name || "-"}</td>
                <td className="px-3 py-2">{it.roomId?.roomNo || "-"}</td>
                <td className="px-3 py-2">{it.bedNo}</td>
                <td className="px-3 py-2">
                  {String(it.fromDate).substring(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HostelLayout>
  );
}
