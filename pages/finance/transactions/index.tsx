import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  Receipt,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit,
} from "lucide-react";

const TYPES = [
  { value: "student_fee", label: "طلبہ فیس", isIncome: true },
  { value: "hostel_fee", label: "ہاسٹل فیس", isIncome: true },
  { value: "mess_fee", label: "میس فیس", isIncome: true },
  { value: "other_income", label: "دیگر آمدنی", isIncome: true },
  { value: "salary", label: "تنخواہ", isIncome: false },
  { value: "other_expense", label: "دیگر اخراجات", isIncome: false },
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

  const income = useMemo(
    () =>
      items
        .filter((x) => TYPES.find((t) => t.value === x.type && t.isIncome))
        .reduce((s, x) => s + (x.amount || 0), 0),
    [items]
  );

  const expense = useMemo(
    () =>
      items
        .filter((x) => TYPES.find((t) => t.value === x.type && !t.isIncome))
        .reduce((s, x) => s + (x.amount || 0), 0),
    [items]
  );

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Receipt className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">معاملات کی فہرست</h1>
                <p className="text-blue-100 text-xs">
                  تمام مالیاتی معاملات دیکھیں
                </p>
              </div>
            </div>
            <Link
              href="/finance/transactions/new"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نیا معاملہ
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="text-[10px] text-blue-100">آمدنی</p>
                  <p className="text-sm font-bold">
                    ₨ {income.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-300" />
                <div>
                  <p className="text-[10px] text-blue-100">اخراجات</p>
                  <p className="text-sm font-bold">
                    ₨ {expense.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <div>
                  <p className="text-[10px] text-blue-100">کل معاملات</p>
                  <p className="text-sm font-bold">{items.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                قسم
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">تمام اقسام</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                از تاریخ
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                تا تاریخ
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  تفصیل میں تلاش
                </div>
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={load}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>تازہ کریں</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <Receipt className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                کوئی معاملہ نہیں ملا
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      تاریخ
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      قسم
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      تفصیل
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      رقم
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((t, index) => {
                    const typeInfo = TYPES.find((x) => x.value === t.type);
                    return (
                      <tr
                        key={t._id}
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700">
                              {t.date
                                ? new Date(t.date).toLocaleDateString("ur-PK")
                                : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              typeInfo?.isIncome
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {typeInfo?.label || t.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {t.description || "-"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-semibold text-gray-800">
                            ₨ {Number(t.amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/finance/transactions/${t._id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            ترمیم
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
                  <tr>
                    <td
                      className="px-5 py-3 font-bold text-gray-800"
                      colSpan={3}
                    >
                      کل
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-800">
                      ₨ {total.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </FinanceLayout>
  );
}
