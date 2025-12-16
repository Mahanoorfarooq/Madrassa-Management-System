import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

export default function TeacherDisciplineNotesPage() {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<string, any[]>>(
    {}
  );
  const [students, setStudents] = useState<any[]>([]);

  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState("Low");

  const sections = useMemo(
    () => (classId ? sectionsByClass[classId] || [] : []),
    [classId, sectionsByClass]
  );

  const loadClasses = async () => {
    const res = await api.get("/api/teacher/classes");
    const cls = res.data?.classes || [];
    setClasses(cls);
    const map: Record<string, any[]> = {};
    for (const c of cls) map[c.classId] = c.sections || [];
    setSectionsByClass(map);
  };

  const loadStudents = async () => {
    if (!classId || !sectionId) {
      setStudents([]);
      return;
    }
    const res = await api.get("/api/teacher/students", {
      params: { classId, sectionId },
    });
    setStudents(res.data?.students || []);
  };

  const loadNotes = async () => {
    const res = await api.get("/api/teacher/discipline-notes");
    setNotes(res.data?.notes || []);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadClasses(), loadNotes()]).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    loadStudents();
  }, [classId, sectionId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !note) return;
    setLoading(true);
    try {
      await api.post("/api/teacher/discipline-notes", {
        studentId,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        subject: subject || undefined,
        note,
        severity,
      });
      setSubject("");
      setNote("");
      setSeverity("Low");
      await loadNotes();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (v: any) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TeacherLayout>
      <div className="space-y-6" dir="rtl">
        <div className="bg-gradient-to-r from-rose-600 to-red-600 rounded-xl p-5 text-white shadow-md">
          <h1 className="text-xl font-bold">ڈسپلن نوٹس</h1>
          <p className="text-rose-100 text-xs">انتظامیہ کو نوٹس جمع کرائیں</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-3">نیا نوٹ</h2>
          <form
            onSubmit={submit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs text-gray-700 mb-1">کلاس</label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId("");
                  setStudentId("");
                }}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-600"
              >
                <option value="">(اختیاری)</option>
                {classes.map((c: any) => (
                  <option key={c.classId} value={c.classId}>
                    {c.className || "کلاس"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">سیکشن</label>
              <select
                value={sectionId}
                onChange={(e) => {
                  setSectionId(e.target.value);
                  setStudentId("");
                }}
                disabled={!classId}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-600 disabled:bg-gray-100"
              >
                <option value="">(اختیاری)</option>
                {sections.map((s: any) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName || "سیکشن"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                طالب علم
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-600"
              >
                <option value="">منتخب کریں</option>
                {students.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    {s.fullName}
                    {s.rollNumber ? ` (${s.rollNumber})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-700 mb-1">مضمون</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-700 mb-1">نوٹ</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">شدت</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-600"
              >
                <option value="Low">کم</option>
                <option value="Medium">درمیانہ</option>
                <option value="High">زیادہ</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={loading || !studentId || !note}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                محفوظ کریں
              </button>
            </div>
          </form>
        </div>

        {/* Notes List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {notes.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              ابھی کوئی ڈسپلن نوٹ موجود نہیں
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      تاریخ
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      طالب علم
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      مضمون
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      شدت
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      اسٹیٹس
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      نوٹ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notes.map((n: any) => (
                    <tr key={n._id} className="bg-white">
                      <td className="px-5 py-3 text-gray-700">
                        {formatDate(n.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-gray-800">
                        {n.studentId?.fullName || n.studentName || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {n.subject || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {n.severity || "Low"}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {n.status || "Submitted"}
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-xl text-right break-words">
                        {n.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
