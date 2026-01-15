import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import {
  BarChart3,
  Calendar,
  RefreshCw,
  FileText,
  Receipt,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function FinanceReportsPage() {
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: new Date().toISOString().substring(0, 10),
    to: new Date().toISOString().substring(0, 10),
  });
  const [receipts, setReceipts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  // loader removed per request

  const load = async () => {
    const [r, i] = await Promise.all([
      api.get("/api/finance/receipts", {
        params: { from: range.from, to: range.to },
      }),
      api.get("/api/finance/invoices", {
        params: { from: range.from, to: range.to },
      }),
    ]);
    setReceipts(r.data?.receipts || []);
    setInvoices(i.data?.invoices || []);
  };

  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const received = useMemo(
    () => receipts.reduce((s, x) => s + (x.amountPaid || 0), 0),
    [receipts]
  );
  const billed = useMemo(
    () => invoices.reduce((s, x) => s + (x.total || 0), 0),
    [invoices]
  );
  const balance = billed - received;

  return (
    <FinanceLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">مالیاتی رپورٹس</h1>
              <p className="text-white/80 text-xs">
                انوائسز اور وصولیوں کا خلاصہ
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-secondary/10 border-r-4 border-secondary rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-secondary">
              اس صفحہ پر آپ منتخب تاریخوں کے درمیان بننے والی انوائسز اور موصول
              ہونے والی رقوم کا خلاصہ دیکھ سکتے ہیں، تاکہ فوری طور پر بِلڈ اور
              رِسیوڈ رقم کا فرق واضح ہو سکے۔
            </p>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            تاریخ کی حد منتخب کریں
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                از تاریخ
              </label>
              <input
                type="date"
                value={range.from}
                onChange={(e) =>
                  setRange((r) => ({ ...r, from: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                تا تاریخ
              </label>
              <input
                type="date"
                value={range.to}
                onChange={(e) =>
                  setRange((r) => ({ ...r, to: e.target.value }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تازہ کریں</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">کل انوائس شدہ</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₨ {billed.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {invoices.length} انوائسز
                </p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">کل موصول شدہ</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ₨ {received.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {receipts.length} وصولیاں
                </p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3">
                <Receipt className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">باقی رقم</p>
                <p
                  className={`text-2xl font-bold ${
                    balance > 0
                      ? "text-red-600"
                      : balance < 0
                      ? "text-emerald-600"
                      : "text-gray-600"
                  }`}
                >
                  ₨ {balance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {balance > 0
                    ? "باقی ہے"
                    : balance < 0
                    ? "زیادہ وصول"
                    : "برابر"}
                </p>
              </div>
              <div
                className={`${
                  balance > 0
                    ? "bg-red-100"
                    : balance < 0
                    ? "bg-emerald-100"
                    : "bg-gray-100"
                } rounded-lg p-3`}
              >
                <TrendingUp
                  className={`w-7 h-7 ${
                    balance > 0
                      ? "text-red-600"
                      : balance < 0
                      ? "text-emerald-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Comparison */}
        {(billed > 0 || received > 0) && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              بصری موازنہ
            </h2>
            <div className="space-y-4">
              {/* Invoice Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      انوائس شدہ
                    </span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    ₨ {billed.toLocaleString()}
                  </span>
                </div>
                <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg transition-all duration-500"
                    style={{
                      width: `${
                        Math.max(billed, received) > 0
                          ? (billed / Math.max(billed, received)) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Receipt Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">
                      موصول شدہ
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    ₨ {received.toLocaleString()}
                  </span>
                </div>
                <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg transition-all duration-500"
                    style={{
                      width: `${
                        Math.max(billed, received) > 0
                          ? (received / Math.max(billed, received)) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Balance Bar */}
              {balance !== 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className={`w-4 h-4 ${
                          balance > 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {balance > 0 ? "باقی رقم" : "زیادہ وصول"}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        balance > 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      ₨ {Math.abs(balance).toLocaleString()}
                    </span>
                  </div>
                  <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`absolute h-full rounded-lg transition-all duration-500 ${
                        balance > 0
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                      }`}
                      style={{
                        width: `${
                          Math.max(billed, received) > 0
                            ? (Math.abs(balance) / Math.max(billed, received)) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {billed === 0 && received === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-2">
                منتخب تاریخوں میں کوئی ڈیٹا نہیں
              </p>
              <p className="text-xs text-gray-400">
                مختلف تاریخیں منتخب کر کے دوبارہ کوشش کریں
              </p>
            </div>
          </div>
        )}
      </div>
    </FinanceLayout>
  );
}
