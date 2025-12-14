import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  FileText,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const STATUS = [
  { value: "unpaid", label: "غیر ادائیگی", color: "bg-red-100 text-red-700" },
  {
    value: "partial",
    label: "جزوی ادائیگی",
    color: "bg-amber-100 text-amber-700",
  },
  {
    value: "paid",
    label: "ادائیگی",
    color: "bg-emerald-100 text-emerald-700",
  },
] as const;

export default function InvoicesListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [q, setQ] = useState<string>("");
  // loader removed per request

  const load = async () => {
    const res = await api.get("/api/finance/invoices", {
      params: {
        departmentId: departmentId || undefined,
        status: status || undefined,
        period: period || undefined,
        q: q || undefined,
      },
    });
    setItems(res.data?.invoices || []);
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

  const statusCounts = useMemo(() => {
    return {
      unpaid: items.filter((x) => x.status === "unpaid").length,
      partial: items.filter((x) => x.status === "partial").length,
      paid: items.filter((x) => x.status === "paid").length,
    };
  }, [items]);

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">انوائسز کی فہرست</h1>
                <p className="text-purple-100 text-xs">تمام انوائسز دیکھیں</p>
              </div>
            </div>
            <Link
              href="/finance/invoices/new"
              className="inline-flex items-center gap-2 bg-white text-purple-600 hover:bg-purple-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نئی انوائس
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <div>
                  <p className="text-[10px] text-purple-100">کل</p>
                  <p className="text-sm font-bold">{items.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-300" />
                <div>
                  <p className="text-[10px] text-purple-100">غیر ادا</p>
                  <p className="text-sm font-bold">{statusCounts.unpaid}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                <div>
                  <p className="text-[10px] text-purple-100">جزوی</p>
                  <p className="text-sm font-bold">{statusCounts.partial}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="text-[10px] text-purple-100">ادا شدہ</p>
                  <p className="text-sm font-bold">{statusCounts.paid}</p>
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
                شعبہ
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">تمام شعبہ جات</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                حالت
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                سال-مہینہ
              </label>
              <input
                placeholder="YYYY-MM"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  انوائس نمبر
                </div>
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تازہ کریں</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                کوئی انوائس نہیں ملی
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      انوائس نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      شعبہ
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      پیریڈ
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      حالت
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      کل رقم
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((t: any, index) => {
                    const statusInfo = STATUS.find((s) => s.value === t.status);
                    return (
                      <tr
                        key={t._id}
                        className={`hover:bg-purple-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/finance/invoices/${t._id}`}
                            className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                          >
                            {t.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {t.departmentId?.name || "-"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                            {t.period || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              statusInfo?.color || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {statusInfo?.label || t.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-semibold text-gray-800">
                            ₨ {Number(t.total || 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
                  <tr>
                    <td
                      className="px-5 py-3 font-bold text-gray-800"
                      colSpan={4}
                    >
                      کل
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-800">
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
