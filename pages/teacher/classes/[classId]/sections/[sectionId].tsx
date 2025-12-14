import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import {
  CalendarDays,
  Users,
  RefreshCw,
  CheckCircle2,
  X,
  UserCheck,
} from "lucide-react";

export default function TeacherSectionStudents() {
  const router = useRouter();
  const { classId, sectionId } = router.query as {
    classId?: string;
    sectionId?: string;
  };
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [lecture, setLecture] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, "Present" | "Absent" | "Leave" | "">
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const load = async () => {
    if (!classId || !sectionId) return;
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      const sres = await api.get("/api/teacher/students", {
        params: { classId, sectionId },
      });
      setStudents(sres.data?.students || []);
      const ares = await api.get("/api/teacher/attendance", {
        params: { classId, sectionId, date, lecture: lecture || undefined },
      });
      const map: Record<string, any> = {};
      (ares.data?.attendance || []).forEach((r: any) => {
        map[String(r.student)] = r.status as any;
      });
      const init: Record<string, any> = {};
      (sres.data?.students || []).forEach((st: any) => {
        init[String(st._id)] = map[String(st._id)] || "";
      });
      setAttendance(init);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, sectionId, date, lecture]);

  const presentCount = useMemo(
    () => Object.values(attendance).filter((x) => x === "Present").length,
    [attendance]
  );
  const absentCount = useMemo(
    () => Object.values(attendance).filter((x) => x === "Absent").length,
    [attendance]
  );
  const leaveCount = useMemo(
    () => Object.values(attendance).filter((x) => x === "Leave").length,
    [attendance]
  );

  const setMark = (id: string, status: "Present" | "Absent" | "Leave" | "") => {
    setAttendance((m) => ({ ...m, [id]: status }));
  };

  const submit = async () => {
    if (!classId || !sectionId) return;
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      const marks = Object.entries(attendance)
        .filter(([, v]) => v)
        .map(([studentId, status]) => ({ studentId, status }));
      await api.post("/api/teacher/attendance", {
        classId,
        sectionId,
        date,
        lecture: lecture || undefined,
        marks,
      });
      setOk("حاضری محفوظ ہو گئی");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="p-6 max-w-6xl mx-auto" dir="rtl">
        {/* Header with Controls */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-5 text-white shadow-md mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">سیکشن کے طلبہ کی حاضری</h2>
              <p className="text-teal-100 text-sm">
                تاریخ اور لیکچر منتخب کریں، پھر حاضری محفوظ کریں
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-teal-100 mb-1.5">
                تاریخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border-0 px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-white/50 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-teal-100 mb-1.5">
                لیکچر (اختیاری)
              </label>
              <input
                placeholder="مثال: صرفِ میر، سبق 3"
                value={lecture}
                onChange={(e) => setLecture(e.target.value)}
                className="w-full rounded-lg border-0 px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-white/50 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={load}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-all border border-white/30"
              >
                <RefreshCw className="w-4 h-4" />
                تازہ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 shadow-sm flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 shadow-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {ok}
          </div>
        )}

        {/* Stats and Bulk Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                حاضر: {presentCount}
              </span>
              <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                غائب: {absentCount}
              </span>
              <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200">
                رخصت: {leaveCount}
              </span>
              <span className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                کل: {students.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next: Record<string, any> = {};
                  students.forEach((s: any) => (next[s._id] = "Present"));
                  setAttendance(next);
                }}
                className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all"
              >
                سب حاضر
              </button>
              <button
                onClick={() => {
                  const next: Record<string, any> = {};
                  students.forEach((s: any) => (next[s._id] = "Absent"));
                  setAttendance(next);
                }}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold hover:bg-red-700 shadow-sm transition-all"
              >
                سب غائب
              </button>
              <button
                onClick={() => {
                  const next: Record<string, any> = {};
                  students.forEach((s: any) => (next[s._id] = ""));
                  setAttendance(next);
                }}
                className="rounded-lg bg-gray-600 text-white px-4 py-2 text-xs font-semibold hover:bg-gray-700 shadow-sm transition-all"
              >
                صاف کریں
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                    طالب علم
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                    رول نمبر
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">
                    حاضری
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((s: any) => (
                  <tr
                    key={s._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2.5">
                        {s.photoUrl ? (
                          <img
                            src={s.photoUrl}
                            alt={s.fullName}
                            className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-200 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-800">
                          {s.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {s.rollNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setMark(s._id, "Present")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                            attendance[s._id] === "Present"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                              : "bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-700"
                          }`}
                        >
                          حاضر
                        </button>
                        <button
                          onClick={() => setMark(s._id, "Absent")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                            attendance[s._id] === "Absent"
                              ? "bg-red-600 text-white border-red-600 shadow-md"
                              : "bg-white hover:bg-red-50 border-red-300 text-red-700"
                          }`}
                        >
                          غائب
                        </button>
                        <button
                          onClick={() => setMark(s._id, "Leave")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                            attendance[s._id] === "Leave"
                              ? "bg-amber-500 text-white border-amber-500 shadow-md"
                              : "bg-white hover:bg-amber-50 border-amber-300 text-amber-700"
                          }`}
                        >
                          رخصت
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!students.length && (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-gray-500"
                      colSpan={3}
                    >
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <div className="text-sm">
                        اس سیکشن میں کوئی طالب علم نہیں
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end mt-5">
          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:from-teal-700 hover:to-cyan-700 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{loading ? "محفوظ ہو رہا ہے..." : "حاضری محفوظ کریں"}</span>
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
}
