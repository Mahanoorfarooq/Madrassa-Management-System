import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import { Building2, Search, Plus, RefreshCw, User } from "lucide-react";

export default function HostelsListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  // loader removed per request

  const load = async () => {
    const r = await api.get("/api/hostel/hostels", {
      params: { q: q || undefined },
    });
    setItems(r.data?.hostels || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HostelLayout title="ہاسٹل">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ہاسٹلز کی فہرست</h1>
                <p className="text-purple-100 text-xs">
                  تمام ہاسٹلز دیکھیں اور منظم کریں
                </p>
              </div>
            </div>
            <Link
              href="/hostel/hostels/new"
              className="inline-flex items-center gap-2 bg-white text-purple-600 hover:bg-purple-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نیا ہاسٹل
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
                placeholder="ہاسٹل کا نام تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
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
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                کوئی ہاسٹل نہیں ملا
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      نام
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      گنجائش
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      کمرے
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      وارڈن
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((h: any, index) => (
                    <tr
                      key={h._id}
                      className={`hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/hostel/hostels/${h._id}`}
                          className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                        >
                          {h.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{h.capacity}</td>
                      <td className="px-5 py-3 text-gray-700">{h.rooms}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {h.wardenName || "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </HostelLayout>
  );
}
