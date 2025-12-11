import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function RoomsListPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [hostelId, setHostelId] = useState<string>("");

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
  }, []);

  return (
    <HostelLayout title="کمرے">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">ہاسٹل</label>
          <select
            value={hostelId}
            onChange={(e) => setHostelId(e.target.value)}
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
        <div className="flex items-end justify-end gap-2 md:col-span-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            تازہ کریں
          </button>
          <Link
            href="/hostel/rooms/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white"
          >
            نیا کمرہ
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">ہاسٹل</th>
              <th className="px-3 py-2 font-semibold text-gray-700">
                کمرہ نمبر
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">بیڈز</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r: any) => (
              <tr key={r._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  {hostels.find((h) => h._id === String(r.hostelId))?.name ||
                    "-"}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/hostel/rooms/${r._id}`}
                    className="text-primary hover:underline"
                  >
                    {r.roomNo}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.beds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HostelLayout>
  );
}
