import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function HostelFeesPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [hostelId, setHostelId] = useState<string>("");
  const [active, setActive] = useState<string>("true");

  const load = async () => {
    const r = await api.get("/api/hostel/fees", {
      params: { hostelId: hostelId || undefined, active: active || undefined },
    });
    setItems(r.data?.fees || []);
  };

  useEffect(() => {
    const boot = async () => {
      const h = await api.get("/api/hostel/hostels");
      setHostels(h.data?.hostels || []);
      await load();
    };
    boot();
  }, []);

  const totalMonthly = useMemo(
    () =>
      items
        .filter((x: any) => x.periodicity === "monthly")
        .reduce((s: number, x: any) => s + (x.amount || 0), 0),
    [items]
  );

  return (
    <HostelLayout title="ہاسٹل فیس">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-right">
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
        <div>
          <label className="text-xs text-gray-600 mb-1 block">حالت</label>
          <select
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">تمام</option>
            <option value="true">فعال</option>
            <option value="false">غیر فعال</option>
          </select>
        </div>
        <div className="flex items-end justify-end gap-2 md:col-span-3">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            تازہ کریں
          </button>
          <Link
            href="/hostel/fees/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white"
          >
            نئی فیس
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">ہاسٹل</th>
              <th className="px-3 py-2 font-semibold text-gray-700">عنوان</th>
              <th className="px-3 py-2 font-semibold text-gray-700">پیériڈ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">رقم</th>
              <th className="px-3 py-2 font-semibold text-gray-700">حالت</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f: any) => (
              <tr key={f._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  {hostels.find((h) => h._id === String(f.hostelId))?.name ||
                    "-"}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/hostel/fees/${f._id}`}
                    className="text-primary hover:underline"
                  >
                    {f.title}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {f.periodicity === "monthly" ? "ماہانہ" : "ایک دفعہ"}
                </td>
                <td className="px-3 py-2">
                  ₨ {Number(f.amount || 0).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {f.isActive ? "فعال" : "غیر فعال"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50">
              <td className="px-3 py-2 font-semibold" colSpan={3}>
                کل ماہانہ
              </td>
              <td className="px-3 py-2 font-semibold" colSpan={2}>
                ₨ {totalMonthly.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </HostelLayout>
  );
}
