import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

export default function HostelExpensesPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [hostelId, setHostelId] = useState<string>("");
  const [from, setFrom] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [to, setTo] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  const load = async () => {
    const r = await api.get("/api/hostel/expenses", {
      params: { hostelId: hostelId || undefined, from, to },
    });
    setItems(r.data?.expenses || []);
  };

  useEffect(() => {
    const boot = async () => {
      const h = await api.get("/api/hostel/hostels");
      setHostels(h.data?.hostels || []);
      await load();
    };
    boot();
  }, []);

  const total = useMemo(
    () => items.reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0),
    [items]
  );

  return (
    <HostelLayout title="ہاسٹل اخراجات">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 text-right">
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
          <label className="text-xs text-gray-600 mb-1 block">از</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">تک</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end justify-end gap-2 md:col-span-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            تازہ کریں
          </button>
          <Link
            href="/hostel/expenses/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white"
          >
            نیا خرچ
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">تاریخ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">ہاسٹل</th>
              <th className="px-3 py-2 font-semibold text-gray-700">کیٹیگری</th>
              <th className="px-3 py-2 font-semibold text-gray-700">رقم</th>
              <th className="px-3 py-2 font-semibold text-gray-700">نوٹس</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x: any) => (
              <tr key={x._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{String(x.date).substring(0, 10)}</td>
                <td className="px-3 py-2">
                  {hostels.find((h) => h._id === String(x.hostelId))?.name ||
                    "-"}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/hostel/expenses/${x._id}`}
                    className="text-primary hover:underline"
                  >
                    {x.category}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  ₨ {Number(x.amount || 0).toLocaleString()}
                </td>
                <td className="px-3 py-2">{x.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50">
              <td className="px-3 py-2 font-semibold" colSpan={3}>
                کل
              </td>
              <td className="px-3 py-2 font-semibold" colSpan={2}>
                ₨ {total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </HostelLayout>
  );
}
