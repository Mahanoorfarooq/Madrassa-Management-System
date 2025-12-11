import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

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
      <div className="flex items-center justify-end gap-2 mb-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border px-3 py-2 text-sm bg-white"
        />
        <input
          placeholder="لیکچر (اختیاری)"
          value={lecture}
          onChange={(e) => setLecture(e.target.value)}
          className="rounded border px-3 py-2 text-sm bg-white"
        />
        <button
          onClick={load}
          className="rounded border px-3 py-2 text-sm bg-white"
        >
          تازہ کریں
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded bg-red-100 text-red-700 text-sm px-3 py-2 text-right">
          {error}
        </div>
      )}
      {ok && (
        <div className="mb-3 rounded bg-emerald-100 text-emerald-700 text-sm px-3 py-2 text-right">
          {ok}
        </div>
      )}

      <div className="bg-white border rounded">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2">نام</th>
              <th className="px-3 py-2">رول نمبر</th>
              <th className="px-3 py-2">حاضری</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => (
              <tr key={s._id} className="border-b">
                <td className="px-3 py-2">{s.fullName}</td>
                <td className="px-3 py-2">{s.rollNumber}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setMark(s._id, "Present")}
                      className={`px-3 py-1 rounded text-xs border ${
                        attendance[s._id] === "Present"
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white"
                      }`}
                    >
                      حاضر
                    </button>
                    <button
                      onClick={() => setMark(s._id, "Absent")}
                      className={`px-3 py-1 rounded text-xs border ${
                        attendance[s._id] === "Absent"
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-white"
                      }`}
                    >
                      غائب
                    </button>
                    <button
                      onClick={() => setMark(s._id, "Leave")}
                      className={`px-3 py-1 rounded text-xs border ${
                        attendance[s._id] === "Leave"
                          ? "bg-yellow-400 text-white border-yellow-400"
                          : "bg-white"
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
                <td className="px-3 py-6 text-center text-gray-500" colSpan={3}>
                  اس سیکشن میں کوئی طالب علم نہیں
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-600">
          کل حاضر: {presentCount} / {students.length}
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="rounded bg-primary text-white px-5 py-2 text-sm disabled:opacity-60"
        >
          {loading ? "محفوظ ہو رہا ہے" : "حاضری محفوظ کریں"}
        </button>
      </div>
    </TeacherLayout>
  );
}
