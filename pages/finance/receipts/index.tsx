import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function ReceiptsListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/finance/receipts", {
        params: { departmentId: departmentId || undefined, q: q || undefined },
      });
      setItems(res.data?.receipts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
      await load();
    };
    boot();
  }, []);

  const total = useMemo(
    () => items.reduce((s, x) => s + (x.amountPaid || 0), 0),
    [items]
  );

  return (
    <FinanceLayout title="وصولیاں">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">شعبہ</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">تمام</option>
            {departments.map((d: any) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">
            رسید نمبر تلاش
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-end justify-end gap-2 md:col-span-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            تازہ کریں
          </button>
          <Link
            href="/finance/receipts/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            نئی رسید
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">رسید</th>
              <th className="px-3 py-2 font-semibold text-gray-700">
                طالب علم
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">شعبہ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">تاریخ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">رقم</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t: any) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{t.receiptNo}</td>
                <td className="px-3 py-2">{t.studentId?.name || "-"}</td>
                <td className="px-3 py-2">{t.departmentId?.name || "-"}</td>
                <td className="px-3 py-2">{String(t.date).substring(0, 10)}</td>
                <td className="px-3 py-2">
                  ₨ {Number(t.amountPaid || 0).toLocaleString()}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-gray-400 text-xs"
                  colSpan={5}
                >
                  کوئی ریکارڈ موجود نہیں۔
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50">
              <td className="px-3 py-2 font-semibold" colSpan={4}>
                کل
              </td>
              <td className="px-3 py-2 font-semibold">
                ₨ {total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </FinanceLayout>
  );
}
