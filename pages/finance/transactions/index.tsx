import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

const TYPES = [
  { value: "student_fee", label: "طلبہ فیس" },
  { value: "hostel_fee", label: "ہاسٹل فیس" },
  { value: "mess_fee", label: "میس فیس" },
  { value: "salary", label: "تنخواہ" },
  { value: "other_income", label: "دیگر آمدنی" },
  { value: "other_expense", label: "دیگر اخراجات" },
] as const;

export default function FinanceTransactionsList() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/finance/transactions", {
        params: {
          q: q || undefined,
          type: type || undefined,
          from: from || undefined,
          to: to || undefined,
        },
      });
      setItems(res.data?.transactions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(
    () => items.reduce((s, x) => s + (x.amount || 0), 0),
    [items]
  );

  return (
    <FinanceLayout title="معاملات">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">قسم</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">تمام</option>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">از تاریخ</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">تا تاریخ</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">
            تفصیل میں تلاش
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
            href="/finance/transactions/new"
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            نیا معاملہ
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">تاریخ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">قسم</th>
              <th className="px-3 py-2 font-semibold text-gray-700">تفصیل</th>
              <th className="px-3 py-2 font-semibold text-gray-700">رقم</th>
              <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  {t.date ? new Date(t.date).toLocaleDateString() : "-"}
                </td>
                <td className="px-3 py-2">
                  {TYPES.find((x) => x.value === t.type)?.label || t.type}
                </td>
                <td className="px-3 py-2">{t.description || "-"}</td>
                <td className="px-3 py-2">
                  ₨ {Number(t.amount || 0).toLocaleString()}
                </td>
                <td className="px-3 py-2 flex gap-2 justify-end">
                  <Link
                    href={`/finance/transactions/${t._id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    ترمیم
                  </Link>
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
              <td className="px-3 py-2 font-semibold" colSpan={3}>
                کل
              </td>
              <td className="px-3 py-2 font-semibold">
                ₨ {total.toLocaleString()}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </FinanceLayout>
  );
}
