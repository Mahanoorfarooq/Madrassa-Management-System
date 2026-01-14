import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { CalendarDays, Users, BarChart2 } from "lucide-react";

interface ReportStudentRow {
  studentId: string;
  fullName: string;
  rollNumber: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
}

interface ReportResponse {
  from: string;
  to: string;
  totalDays: number;
  students: ReportStudentRow[];
}

export default function TeacherAttendanceReport() {
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/teacher/classes");
        setClasses(res.data?.classes || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
      }
    })();
  }, []);

  const sections =
    classes.find((c: any) => String(c.classId) === String(classId))?.sections ||
    [];

  const loadReport = async () => {
    if (!classId || !sectionId || !from || !to) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await api.get("/api/teacher/attendance-report", {
        params: { classId, sectionId, from, to },
      });
      const data = res.data as ReportResponse;
      setReport(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "رپورٹ لوڈ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: any) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalStudents = report?.students?.length || 0;

  return (
    <TeacherLayout>
      <div className="p-6 max-w-5xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-5 text-white shadow-md mb-6 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">کلاس کی حاضری رپورٹ</h2>
            <p className="text-white/80 text-sm">
              کلاس، سیکشن اور تاریخ کا دورانیہ منتخب کریں اور رپورٹ دیکھیں
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 shadow-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                کلاس منتخب کریں
              </label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId("");
                }}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">انتخاب کریں</option>
                {classes.map((c: any) => (
                  <option key={c.classId || ""} value={c.classId || ""}>
                    {c.className || c.classId}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                سیکشن منتخب کریں
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!classId}
              >
                <option value="">انتخاب کریں</option>
                {sections.map((s: any) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName || s.sectionId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* From */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                از تاریخ
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تک تاریخ
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            {/* Button */}
            <div className="flex items-end justify-end">
              <button
                onClick={loadReport}
                disabled={!classId || !sectionId || !from || !to || loading}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary text-white px-6 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:opacity-90 transition-all"
              >
                <CalendarDays className="w-4 h-4" />
                <span>{loading ? "لوڈ ہو رہا ہے..." : "رپورٹ دیکھیں"}</span>
              </button>
            </div>
          </div>

          {report && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <CalendarDays className="w-3 h-3" />
                مدت: {formatDate(report.from)} تا {formatDate(report.to)}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary">
                دنوں کی تعداد: {report.totalDays}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                طلبہ: {totalStudents}
              </span>
            </div>
          )}
        </div>

        {/* Report Table */}
        {report && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <span className="text-sm font-semibold text-gray-800">
                  طلبہ کی حاضری خلاصہ
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-right">
                    <th className="px-4 py-2 font-semibold text-gray-700">
                      طالب علم
                    </th>
                    <th className="px-4 py-2 font-semibold text-gray-700">
                      رول نمبر
                    </th>
                    <th className="px-4 py-2 font-semibold text-green-700">
                      حاضر
                    </th>
                    <th className="px-4 py-2 font-semibold text-red-700">
                      غائب
                    </th>
                    <th className="px-4 py-2 font-semibold text-yellow-700">
                      لیٹ
                    </th>
                    <th className="px-4 py-2 font-semibold text-amber-700">
                      رخصت
                    </th>
                    <th className="px-4 py-2 font-semibold text-gray-700">
                      کل دن
                    </th>
                    <th className="px-4 py-2 font-semibold text-primary">
                      حاضری ٪
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.students.map((s) => {
                    const total =
                      s.present + s.absent + s.late + s.leave ||
                      report.totalDays;
                    const effectiveTotal = total || report.totalDays || 0;
                    const percent =
                      effectiveTotal > 0
                        ? Math.round((s.present / effectiveTotal) * 100)
                        : 0;
                    return (
                      <tr
                        key={s.studentId}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-right text-gray-800">
                          {s.fullName}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {s.rollNumber}
                        </td>
                        <td className="px-4 py-2 text-center text-green-700 font-semibold">
                          {s.present}
                        </td>
                        <td className="px-4 py-2 text-center text-red-700 font-semibold">
                          {s.absent}
                        </td>
                        <td className="px-4 py-2 text-center text-yellow-700 font-semibold">
                          {s.late}
                        </td>
                        <td className="px-4 py-2 text-center text-amber-700 font-semibold">
                          {s.leave}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-700">
                          {effectiveTotal}
                        </td>
                        <td className="px-4 py-2 text-center text-primary font-semibold">
                          {percent}%
                        </td>
                      </tr>
                    );
                  })}
                  {!report.students.length && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500 text-sm"
                      >
                        اس دورانیہ میں کوئی حاضری ریکارڈ نہیں ملا۔
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!report && !loading && !error && (
          <div className="mt-4 text-center text-xs text-gray-500">
            اوپر سے فلٹر منتخب کریں اور &quot;رپورٹ دیکھیں&quot; پر کلک کریں۔
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
