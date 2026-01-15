import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { MessLayout } from "@/components/layout/MessLayout";
import {
  UserCheck,
  Plus,
  RefreshCw,
  Filter,
  Calendar,
  User,
  Building2,
  DoorOpen,
  Bed,
  ChefHat,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function RegistrationsListPage() {
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [allocMap, setAllocMap] = useState<Record<string, any>>({});
  const [kitchenId, setKitchenId] = useState("");
  const [active, setActive] = useState("true");

  const load = async () => {
    const [r, a] = await Promise.all([
      api.get("/api/mess/registrations", {
        params: {
          kitchenId: kitchenId || undefined,
          active: active || undefined,
        },
      }),
      api.get("/api/hostel/allocations", { params: { active: true } }),
    ]);
    setItems(r.data?.registrations || []);

    const map: Record<string, any> = {};
    (a.data?.allocations || []).forEach((al: any) => {
      const s = al.studentId;
      if (!s) return;
      const id = String((s as any)._id || s);
      if (!id) return;
      if (!map[id]) {
        map[id] = {
          hostelName: al.hostelId?.name,
          roomNo: al.roomId?.roomNo,
          bedNo: al.bedNo,
        };
      }
    });
    setAllocMap(map);
  };

  useEffect(() => {
    const boot = async () => {
      const k = await api.get("/api/mess/kitchens");
      setKitchens(k.data?.kitchens || []);
      await load();
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MessLayout title="رجسٹریشن">
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">رجسٹریشن کی فہرست</h1>
                <p className="text-white/80 text-xs">
                  تمام میس رجسٹریشنز دیکھیں اور منظم کریں
                </p>
              </div>
            </div>
            <Link
              href="/mess/registrations/new"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              نئی رجسٹریشن
            </Link>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-gray-500" />
                کچن
              </label>
              <select
                value={kitchenId}
                onChange={(e) => setKitchenId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام کچن</option>
                {kitchens.map((h: any) => (
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
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <UserCheck className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی رجسٹریشن نہیں ملی
              </h3>
              <p className="text-sm text-gray-500">نئی رجسٹریشن شامل کریں</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <User className="w-4 h-4" />
                        طالب علم
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Building2 className="w-4 h-4" />
                        ہاسٹل / کمرہ / بیڈ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <ChefHat className="w-4 h-4" />
                        کچن
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4" />
                        از
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4" />
                        تک
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      حالت
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it: any, index) => (
                    <tr
                      key={it._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800 truncate">
                              {it.studentId
                                ? [
                                    it.studentId.fullName,
                                    it.studentId.rollNumber,
                                  ]
                                    .filter(Boolean)
                                    .join(" - ") || "-"
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {(() => {
                          const sid = String(it.studentId?._id || it.studentId);
                          const info = allocMap[sid];
                          if (!info)
                            return (
                              <span className="text-gray-400 text-xs">-</span>
                            );
                          return (
                            <div className="flex flex-wrap gap-1.5 text-xs">
                              {info.hostelName && (
                                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                                  <Building2 className="w-3 h-3" />
                                  {info.hostelName}
                                </span>
                              )}
                              {info.roomNo && (
                                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                                  <DoorOpen className="w-3 h-3" />
                                  {info.roomNo}
                                </span>
                              )}
                              {info.bedNo && (
                                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                                  <Bed className="w-3 h-3" />
                                  {info.bedNo}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium">
                          <ChefHat className="w-3.5 h-3.5" />
                          {it.kitchenId?.name || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {String(it.fromDate).substring(0, 10)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {it.toDate ? String(it.toDate).substring(0, 10) : "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                            it.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {it.isActive ? (
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
    </MessLayout>
  );
}
