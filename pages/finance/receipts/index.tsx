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
  User,
  Building,
  Calendar,
} from "lucide-react";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(
    () => items.reduce((s, x) => s + (x.amountPaid || 0), 0),
    [items]
  );

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Receipt className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">وصولیاں کی فہرست</h1>
                <p className="text-emerald-100 text-xs">تمام وصولیاں دیکھیں</p>
              </div>
            </div>
            <Link
              href="/finance/receipts/new"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نئی رسید
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <div>
                  <p className="text-[10px] text-emerald-100">کل وصولیاں</p>
                  <p className="text-sm font-bold">{items.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-[10px] text-emerald-100">کل رقم</p>
                  <p className="text-sm font-bold">
                    ₨ {total.toLocaleString()}
                  </p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                شعبہ
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">تمام شعبہ جات</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  رسید نمبر
                </div>
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <button
                onClick={load}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md disabled:opacity-60 transition-all"
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

        {/* Receipts Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <Receipt className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                کوئی رسید نہیں ملی
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      رسید نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      طالب علم
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      شعبہ
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      تاریخ
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      رقم
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((t: any, index) => (
                    <tr
                      key={t._id}
                      className={`hover:bg-emerald-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <span className="font-mono bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {t.receiptNo}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {t.studentId?.name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-gray-700">
                              {t.studentId?.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {t.departmentId?.name ? (
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700">
                              {t.departmentId?.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700">
                            {String(t.date).substring(0, 10)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-emerald-600">
                          ₨ {Number(t.amountPaid || 0).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
                  <tr>
                    <td
                      className="px-5 py-3 font-bold text-gray-800"
                      colSpan={4}
                    >
                      کل
                    </td>
                    <td className="px-5 py-3 font-bold text-emerald-600">
                      ₨ {total.toLocaleString()}
                    </td>
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
