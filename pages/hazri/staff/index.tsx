import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
} from "lucide-react";

export default function StaffHazriPage() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [staff, setStaff] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const s = await api.get("/api/support-staff");
      setStaff(s.data?.staff || []);
      await load();
    })();
  }, [date]);

  const load = async () => {
    const r = await api.get("/api/hazri/staff", {
      params: { from: date, to: date },
    });
    setItems(r.data?.attendance || []);
  };

  const statusOf = (staffId: string) =>
    items.find(
      (x: any) => String(x.staffId?._id || x.staffId) === String(staffId)
    )?.status || "";

  const mark = async (
    staffId: string,
    status: "Present" | "Absent" | "Leave"
  ) => {
    await api.post("/api/hazri/staff", { staffId, date, status });
    await load();
  };

  const presentCount = items.filter((x: any) => x.status === "Present").length;
  const absentCount = items.filter((x: any) => x.status === "Absent").length;
  const leaveCount = items.filter((x: any) => x.status === "Leave").length;

  return (
    <HazriLayout title="عملہ حاضری">
      <div className="p-6 space-y-5 max-w-6xl mx-auto" dir="rtl">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">عملہ کی حاضری</h2>
                <p className="text-purple-100 text-sm">
                  تاریخ منتخب کریں اور نیچے فہرست میں موجود عملہ کے لیے حاضری
                  محفوظ کریں
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none outline-none text-white font-medium w-36"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-800">
                  {presentCount}
                </div>
                <div className="text-xs text-emerald-700">حاضر</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-800">
                  {absentCount}
                </div>
                <div className="text-xs text-red-700">غائب</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-800">
                  {leaveCount}
                </div>
                <div className="text-xs text-amber-700">رخصت</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-800">
                  {staff.length}
                </div>
                <div className="text-xs text-purple-700">کل عملہ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    نام
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    حالت
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    کارروائی
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((t: any) => (
                  <tr
                    key={t._id}
                    className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                          {t.name?.charAt(0) || "S"}
                        </div>
                        {t.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {statusOf(t._id) ? (
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            statusOf(t._id) === "Present"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : statusOf(t._id) === "Absent"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {statusOf(t._id)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => mark(t._id, "Present")}
                          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                        >
                          حاضر
                        </button>
                        <button
                          onClick={() => mark(t._id, "Absent")}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                        >
                          غائب
                        </button>
                        <button
                          onClick={() => mark(t._id, "Leave")}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-all shadow-sm hover:shadow-md"
                        >
                          رخصت
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-gray-400"
                      colSpan={3}
                    >
                      <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <div className="text-sm">کوئی عملہ نہیں ملا</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HazriLayout>
  );
}
