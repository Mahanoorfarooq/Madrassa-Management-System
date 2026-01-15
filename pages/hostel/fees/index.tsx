import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";
import {
  Banknote,
  Plus,
  RefreshCw,
  Filter,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";

export default function HostelFeesPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [hostelId, setHostelId] = useState<string>("");
  const [active, setActive] = useState<string>("true");
  // removed loader per request

  const load = async () => {
    const r = await api.get("/api/hostel/fees", {
      params: {
        hostelId: hostelId || undefined,
        active: active || undefined,
      },
    });
    setItems(r.data?.fees || []);
  };

  useEffect(() => {
    const boot = async () => {
      const h = await api.get("/api/hostel/hostels");
      setHostels(h.data?.hostels || []);
      await load();
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalMonthly = useMemo(
    () =>
      items
        .filter((x: any) => x.periodicity === "monthly")
        .reduce((s: number, x: any) => s + (x.amount || 0), 0),
    [items]
  );

  return (
    <HostelLayout title="ہاسٹل فیس">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Banknote className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ہاسٹل فیس کی فہرست</h1>
                <p className="text-white/80 text-xs">
                  تمام ہاسٹل فیس دیکھیں اور منظم کریں
                </p>
              </div>
            </div>
            <Link
              href="/hostel/fees/new"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نئی فیس
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        {totalMonthly > 0 && (
          <div className="bg-primary/10 rounded-xl shadow-md p-5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">کل ماہانہ فیس</div>
                <div className="text-2xl font-bold text-primary">
                  ₨ {totalMonthly.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                ہاسٹل
              </label>
              <select
                value={hostelId}
                onChange={(e) => setHostelId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام</option>
                {hostels.map((h: any) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                حالت
              </label>
              <select
                value={active}
                onChange={(e) => setActive(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام</option>
                <option value="true">فعال</option>
                <option value="false">غیر فعال</option>
              </select>
            </div>
            <div className="md:col-span-3 flex items-end">
              <button
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
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
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Banknote className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی فیس نہیں ملی
              </h3>
              <p className="text-sm text-gray-500">نئی فیس شامل کریں</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Building2 className="w-4 h-4" />
                        ہاسٹل
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      عنوان
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4" />
                        پیریڈ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Banknote className="w-4 h-4" />
                        رقم
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      حالت
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((f: any, index) => (
                    <tr
                      key={f._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          {hostels.find((h) => h._id === String(f.hostelId))
                            ?.name || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/hostel/fees/${f._id}`}
                          className="text-primary hover:text-primary/90 font-medium hover:underline"
                        >
                          {f.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {f.periodicity === "monthly" ? "ماہانہ" : "ایک دفعہ"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-800">
                          ₨ {Number(f.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                            f.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {f.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              فعال
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              غیر فعال
                            </>
                          )}
                        </span>
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
