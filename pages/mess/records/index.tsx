import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";

export default function MessRecordsPage() {
  const [from, setFrom] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [to, setTo] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [mealType, setMealType] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const r = await api.get("/api/mess/records", {
      params: { from, to, mealType: mealType || undefined },
    });
    setItems(r.data?.records || []);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  const total = useMemo(
    () =>
      items.reduce((s: number, x: any) => s + (Number(x.totalCost) || 0), 0),
    [items]
  );

  return (
    <MessLayout title="ریکارڈ/اخراجات">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 text-right">
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
        <div>
          <label className="text-xs text-gray-600 mb-1 block">خوراک</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">تمام</option>
            <option value="breakfast">ناشتہ</option>
            <option value="lunch">دوپہر</option>
            <option value="dinner">رات</option>
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
            href="/mess/records/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white"
          >
            نیا ریکارڈ
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">تاریخ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">خوراک</th>
              <th className="px-3 py-2 font-semibold text-gray-700">کل طلبہ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">کل خرچ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">نوٹس</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x: any) => (
              <tr key={x._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{String(x.date).substring(0, 10)}</td>
                <td className="px-3 py-2">
                  {x.mealType === "breakfast"
                    ? "ناشتہ"
                    : x.mealType === "lunch"
                    ? "دوپہر"
                    : "رات"}
                </td>
                <td className="px-3 py-2">{x.totalStudents ?? "-"}</td>
                <td className="px-3 py-2">
                  ₨ {Number(x.totalCost || 0).toLocaleString()}
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
    </MessLayout>
  );
}
