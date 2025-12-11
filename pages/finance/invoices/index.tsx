import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

const STATUS = [
  { value: "unpaid", label: "غیر ادائیگی" },
  { value: "partial", label: "جزوی ادائیگی" },
  { value: "paid", label: "ادائیگی" },
] as const;

export default function InvoicesListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/finance/invoices", {
        params: {
          departmentId: departmentId || undefined,
          status: status || undefined,
          period: period || undefined,
          q: q || undefined,
        },
      });
      setItems(res.data?.invoices || []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(
    () => items.reduce((s, x) => s + (x.total || 0), 0),
    [items]
  );

  return (
    <FinanceLayout title="انوائسز">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 text-right">
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
        <div>
          <label className="text-xs text-gray-600 mb-1 block">حالت</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">تمام</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">سا ل-مہینہ</label>
          <input
            placeholder="YYYY-MM"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">
            انوائس نمبر تلاش
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-end justify-end gap-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            تازہ کریں
          </button>
          <Link
            href="/finance/invoices/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            نئی انوائس
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">انوائس</th>
              <th className="px-3 py-2 font-semibold text-gray-700">شعبہ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">پیériڈ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">حالت</th>
              <th className="px-3 py-2 font-semibold text-gray-700">کل رقم</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t: any) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link
                    href={`/finance/invoices/${t._id}`}
                    className="text-primary hover:underline"
                  >
                    {t.invoiceNo}
                  </Link>
                </td>
                <td className="px-3 py-2">{t.departmentId?.name || "-"}</td>
                <td className="px-3 py-2">{t.period || "-"}</td>
                <td className="px-3 py-2">
                  {STATUS.find((s) => s.value === t.status)?.label || t.status}
                </td>
                <td className="px-3 py-2">
                  ₨ {Number(t.total || 0).toLocaleString()}
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
