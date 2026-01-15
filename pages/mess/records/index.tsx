import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import {
  Receipt,
  Plus,
  RefreshCw,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Coffee,
  UtensilsCrossed,
  Moon,
} from "lucide-react";

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

  const getMealIcon = (type: string) => {
    if (type === "breakfast") return <Coffee className="w-3.5 h-3.5" />;
    if (type === "lunch") return <UtensilsCrossed className="w-3.5 h-3.5" />;
    return <Moon className="w-3.5 h-3.5" />;
  };

  const getMealLabel = (type: string) => {
    if (type === "breakfast") return "ناشتہ";
    if (type === "lunch") return "دوپہر";
    return "رات";
  };

  return (
    <MessLayout title="ریکارڈ/اخراجات">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Receipt className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">میس ریکارڈ اور اخراجات</h1>
                <p className="text-white/80 text-xs">
                  تمام میس کے اخراجات دیکھیں
                </p>
              </div>
            </div>
            <Link
              href="/mess/records/new"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              نیا ریکارڈ
            </Link>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                از تاریخ
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                تا تاریخ
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-gray-500" />
                خوراک
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام</option>
                <option value="breakfast">ناشتہ</option>
                <option value="lunch">دوپہر</option>
                <option value="dinner">رات</option>
              </select>
            </div>
            <div className="md:col-span-3 flex items-end justify-end">
              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-3 py-2 text-sm font-medium shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                تازہ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Receipt className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی ریکارڈ نہیں ملا
              </h3>
              <p className="text-sm text-gray-500">نیا ریکارڈ شامل کریں</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4" />
                        تاریخ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <UtensilsCrossed className="w-4 h-4" />
                        خوراک
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Users className="w-4 h-4" />
                        کل طلبہ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <DollarSign className="w-4 h-4" />
                        کل خرچ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      نوٹس
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((x: any, index) => (
                    <tr
                      key={x._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {String(x.date).substring(0, 10)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                            x.mealType === "breakfast"
                              ? "bg-amber-100 text-amber-700"
                              : x.mealType === "lunch"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {getMealIcon(x.mealType)}
                          {getMealLabel(x.mealType)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          {x.totalStudents ?? "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-800">
                          ₨ {Number(x.totalCost || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {x.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td
                      className="px-5 py-3 font-bold text-gray-800"
                      colSpan={3}
                    >
                      کل اخراجات
                    </td>
                    <td
                      className="px-5 py-3 font-bold text-gray-800"
                      colSpan={2}
                    >
                      ₨ {total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </MessLayout>
  );
}
