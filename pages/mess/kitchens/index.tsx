import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import {
  ChefHat,
  Search,
  Plus,
  RefreshCw,
  UtensilsCrossed,
  DollarSign,
} from "lucide-react";

export default function KitchensListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const r = await api.get("/api/mess/kitchens", {
      params: { q: q || undefined },
    });
    setItems(r.data?.kitchens || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MessLayout title="کچن">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <ChefHat className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">کچن کی فہرست</h1>
                <p className="text-blue-100 text-xs">
                  تمام کچن دیکھیں اور منظم کریں
                </p>
              </div>
            </div>
            <Link
              href="/mess/kitchens/new"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نیا کچن
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  تلاش کریں
                </div>
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="کچن کا نام تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی کچن نہیں ملا
              </h3>
              <p className="text-sm text-gray-500">نیا کچن شامل کریں</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <ChefHat className="w-4 h-4" />
                        نام
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <UtensilsCrossed className="w-4 h-4" />
                        یومیہ مینو
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <DollarSign className="w-4 h-4" />
                        فی طالب علم لاگت
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((h: any, index) => (
                    <tr
                      key={h._id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/mess/kitchens/${h._id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          {h.name}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {h.dailyMenu || "-"}
                      </td>
                      <td className="px-5 py-4">
                        {h.perStudentCost ? (
                          <span className="font-semibold text-gray-800">
                            ₨ {Number(h.perStudentCost).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MessLayout>
  );
}
