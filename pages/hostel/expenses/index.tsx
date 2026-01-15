import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import {
  DollarSign,
  Building2,
  Calendar,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

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
      <div className="p-6 space-y-5" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-5 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">ہاسٹل اخراجات</h2>
              <p className="text-white/80 text-sm">
                ہاسٹل کے اخراجات کا ریکارڈ
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                ہاسٹل
              </label>
              <select
                value={hostelId}
                onChange={(e) => setHostelId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              >
                <option value="">تمام ہاسٹلز</option>
                {hostels.map((h: any) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                از
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تک
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={load}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                تازہ کریں
              </button>
              <Link
                href="/hostel/expenses/new"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                نیا خرچ
              </Link>
            </div>
          </div>
        </div>

        {/* Total Card */}
        <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">
                  کل اخراجات
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₨ {total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    تاریخ
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    ہاسٹل
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    کیٹیگری
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    رقم
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    نوٹس
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((x: any) => (
                  <tr
                    key={x._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {String(x.date).substring(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {hostels.find((h) => h._id === String(x.hostelId))
                        ?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/hostel/expenses/${x._id}`}
                        className="text-primary hover:text-primary/90 font-medium hover:underline"
                      >
                        {x.category}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        ₨ {Number(x.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {x.notes || "-"}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-gray-400"
                      colSpan={5}
                    >
                      <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <div className="text-sm">کوئی اخراجات نہیں ملے</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HostelLayout>
  );
}
