import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";
import {
  Users,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  RefreshCw,
} from "lucide-react";

export default function StudentsHazriPage() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10),
  );
  const [departments, setDepartments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [classId, setClassId] = useState("");
  const [attendance, setAttendance] = useState<
    Record<string, "Present" | "Absent" | "Leave" | "">
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [d, c] = await Promise.all([
        api.get("/api/departments"),
        api.get("/api/classes"),
      ]);
      setDepartments(d.data?.departments || []);
      setClasses(c.data?.classes || []);
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const s = await api.get("/api/students", {
        params: {
          departmentId: departmentId || undefined,
          classId: classId || undefined,
        },
      });
      setStudents(s.data?.students || []);
      // Load existing attendance for the date
      const a = await api.get("/api/attendance", {
        params: {
          departmentId: departmentId || undefined,
          classId: classId || undefined,
          from: date,
          to: date,
        },
      });
      const map: Record<string, any> = {};
      (a.data?.attendance || []).forEach((r: any) => {
        map[String(r.student?._id || r.student)] = r.status;
      });
      setAttendance(map as any);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (
    studentId: string,
    status: "Present" | "Absent" | "Leave",
  ) => setAttendance((m) => ({ ...m, [studentId]: status }));

  const markAllPresent = () => {
    const map: Record<string, any> = {};
    students.forEach((s: any) => {
      map[s._id] = "Present";
    });
    setAttendance(map as any);
  };

  const saveAll = async () => {
    for (const s of students) {
      const st = (attendance as any)[s._id];
      if (!st) continue;
      await api.post("/api/attendance", {
        studentId: s._id,
        date,
        status: st,
        departmentId: departmentId || undefined,
        classId: classId || undefined,
      });
    }
    await load();
  };

  const doneCount = useMemo(
    () => Object.values(attendance).filter(Boolean).length,
    [attendance],
  );

  const presentCount = useMemo(
    () => Object.values(attendance).filter((s) => s === "Present").length,
    [attendance],
  );

  const absentCount = useMemo(
    () => Object.values(attendance).filter((s) => s === "Absent").length,
    [attendance],
  );

  const leaveCount = useMemo(
    () => Object.values(attendance).filter((s) => s === "Leave").length,
    [attendance],
  );

  return (
    <HazriLayout title="طلبہ حاضری">
      <div className="p-6 space-y-5" dir="rtl">
        {/* Header Card */}
        <div className="bg-secondary rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">طلبہ کی حاضری</h2>
              <p className="text-white/80 text-sm">
                تاریخ منتخب کریں اور طلبہ کی حاضری نشان زد کریں
              </p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              فلٹر اور ترتیبات
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                تاریخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                شعبہ
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white"
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                کلاس
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white"
              >
                <option value="">تمام کلاسیں</option>
                {classes.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={load}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                لوڈ
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={markAllPresent}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              <CheckCircle className="w-4 h-4" />
              سب حاضر کریں
            </button>
            <button
              onClick={saveAll}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              حاضری محفوظ کریں
            </button>
          </div>
        </div>

        {/* Stats */}
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

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-800">
                  {doneCount} / {students.length}
                </div>
                <div className="text-xs text-blue-700">نشان زد</div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    طالب علم
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    رجسٹریشن نمبر
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
                {students.map((s: any) => (
                  <tr
                    key={s._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {s.fullName || s.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.rollNumber || s.regNo}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {attendance[s._id] ? (
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            attendance[s._id] === "Present"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : attendance[s._id] === "Absent"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {attendance[s._id]}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setStatus(s._id, "Present")}
                          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                        >
                          حاضر
                        </button>
                        <button
                          onClick={() => setStatus(s._id, "Absent")}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                        >
                          غائب
                        </button>
                        <button
                          onClick={() => setStatus(s._id, "Leave")}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-all shadow-sm hover:shadow-md"
                        >
                          رخصت
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && students.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-gray-400"
                      colSpan={4}
                    >
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <div className="text-sm">کوئی طالب علم نہیں ملا</div>
                      <div className="text-xs mt-1">
                        براہ کرم فلٹر استعمال کر کے لوڈ کریں
                      </div>
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
