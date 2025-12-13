import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { CalendarDays, Users, RefreshCw, CheckCircle2 } from "lucide-react";

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
    <TeacherLayout title="سیکشن کے طلبہ">
      <div className="max-w-5xl mx-auto" dir="rtl">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                سیکشن کے طلبہ کی حاضری
              </div>
              <div className="text-[11px] text-gray-500">
                تاریخ اور (اختیاری) لیکچر منتخب کریں، پھر طلبہ کی حاضری نشان زد
                کر کے آخر میں محفوظ کریں۔
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">
                تاریخ
              </label>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-primary/60 focus:border-primary/50 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">
                لیکچر (اختیاری)
              </label>
              <input
                placeholder="مثال: صرفِ میر، سبق 3"
                value={lecture}
                onChange={(e) => setLecture(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-primary/60 focus:border-primary/50 outline-none"
              />
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={load}
                className="inline-flex items-center gap-1 rounded-xl bg-primary text-white px-4 py-1.5 text-xs font-semibold shadow-sm hover:shadow-md hover:bg-emerald-700 transition-all w-full sm:w-auto justify-center"
              >
                <RefreshCw className="w-3 h-3" />
                <span>تازہ کریں</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 text-right shadow-sm">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 text-right shadow-sm flex items-center justify-between gap-2">
            <span>{ok}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-700 justify-end">
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 border border-emerald-100">
                حاضر: {presentCount}
              </span>
              <span className="rounded-full bg-red-50 text-red-700 px-2 py-1 border border-red-100">
                غائب: {absentCount}
              </span>
              <span className="rounded-full bg-yellow-50 text-yellow-700 px-2 py-1 border border-yellow-100">
                رخصت: {leaveCount}
              </span>
              <span className="rounded-full bg-gray-50 text-gray-700 px-2 py-1 border border-gray-200">
                کل طلبہ: {students.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next: Record<string, any> = {};
                  students.forEach((s: any) => (next[s._id] = "Present"));
                  setAttendance(next);
                }}
                className="rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-[11px] hover:bg-emerald-700 shadow-sm"
              >
                سب کو حاضر کریں
              </button>
              <button
                onClick={() => {
                  const next: Record<string, any> = {};
                  students.forEach((s: any) => (next[s._id] = "Absent"));
                  setAttendance(next);
                }}
                className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-[11px] hover:bg-red-700 shadow-sm"
              >
                سب کو غائب کریں
              </button>
              <button
                onClick={() => {
                  const next: Record<string, any> = {};
                  students.forEach((s: any) => (next[s._id] = ""));
                  setAttendance(next);
                }}
                className="rounded-xl bg-gray-600 text-white px-3 py-1.5 text-[11px] hover:bg-gray-700 shadow-sm"
              >
                صفحہ صاف کریں
              </button>
            </div>
          </div>
          <table className="w-full text-right text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b bg-white">
                <th className="px-3 py-2 text-xs font-semibold text-gray-700">نام</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700">
                  رول نمبر
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-700">
                  حاضری
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => (
                <tr key={s._id} className="border-b hover:bg-gray-50/80">
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      {s.photoUrl ? (
                        <img
                          src={s.photoUrl}
                          alt={s.fullName}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border" />
                      )}
                      <span className="text-sm text-gray-800">{s.fullName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">{s.rollNumber}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setMark(s._id, "Present")}
                        className={`px-3 py-1 rounded-full text-[11px] border transition-colors ${
                          attendance[s._id] === "Present"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}
                      >
                        حاضر
                      </button>
                      <button
                        onClick={() => setMark(s._id, "Absent")}
                        className={`px-3 py-1 rounded-full text-[11px] border transition-colors ${
                          attendance[s._id] === "Absent"
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white hover:bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        غائب
                      </button>
                      <button
                        onClick={() => setMark(s._id, "Leave")}
                        className={`px-3 py-1 rounded-full text-[11px] border transition-colors ${
                          attendance[s._id] === "Leave"
                            ? "bg-yellow-400 text-white border-yellow-400"
                            : "bg-white hover:bg-yellow-50 border-yellow-200 text-yellow-700"
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
                    className="px-3 py-6 text-center text-gray-500 text-xs"
                    colSpan={3}
                  >
                    اس سیکشن میں کوئی طالب علم نہیں
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-[11px] text-gray-600">
            کل حاضر: {presentCount} / {students.length} — غائب: {absentCount} —
            رخصت: {leaveCount}
          </div>
          <button
            onClick={submit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? "محفوظ ہو رہا ہے" : "حاضری محفوظ کریں"}</span>
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
}
