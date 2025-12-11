import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function HostelsListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const r = await api.get("/api/hostel/hostels", {
      params: { q: q || undefined },
    });
    setItems(r.data?.hostels || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <HostelLayout title="ہاسٹل">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-right">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">تلاش</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end justify-end gap-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            تازہ کریں
          </button>
          <Link
            href="/hostel/hostels/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white"
          >
            نیا ہاسٹل
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">نام</th>
              <th className="px-3 py-2 font-semibold text-gray-700">گنجائش</th>
              <th className="px-3 py-2 font-semibold text-gray-700">کمرے</th>
              <th className="px-3 py-2 font-semibold text-gray-700">وارڈن</th>
            </tr>
          </thead>
          <tbody>
            {items.map((h: any) => (
              <tr key={h._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link
                    className="text-primary hover:underline"
                    href={`/hostel/hostels/${h._id}`}
                  >
                    {h.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{h.capacity}</td>
                <td className="px-3 py-2">{h.rooms}</td>
                <td className="px-3 py-2">{h.wardenName || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HostelLayout>
  );
}
