import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

export default function TeacherAssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<string, any[]>>(
    {}
  );

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [attachments, setAttachments] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  const sections = useMemo(() => {
    if (!classId) return [] as any[];
    return sectionsByClass[classId] || [];
  }, [classId, sectionsByClass]);

  const loadAssignments = async () => {
    const res = await api.get("/api/teacher/assignments");
    setAssignments(res.data?.assignments || []);
  };

  const loadClasses = async () => {
    const res = await api.get("/api/teacher/classes");
    const cls = res.data?.classes || [];
    setClasses(cls);
    const map: Record<string, any[]> = {};
    for (const c of cls) {
      map[c.classId] = c.sections || [];
    }
    setSectionsByClass(map);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadAssignments(), loadClasses()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      const atts = attachments
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post("/api/teacher/assignments", {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        subject: subject || undefined,
        attachments: atts,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setAttachments("");
      setClassId("");
      setSectionId("");
      setSubject("");
      await loadAssignments();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (v: any) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TeacherLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl p-5 text-white shadow-md">
          <h1 className="text-xl font-bold">اسائنمنٹس</h1>
          <p className="text-white/80 text-xs">
            ہوم ورک / اسائنمنٹس بنائیں اور سبمشن دیکھیں
          </p>
        </div>

        {/* Add Assignment Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-3">نئی اسائنمنٹ</h2>
          <form
            onSubmit={submit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-xs text-gray-700 mb-1">عنوان</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                آخری تاریخ
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-700 mb-1">تفصیل</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">کلاس</label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId("");
                }}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
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
              <label className="block text-xs text-gray-700 mb-1">مضمون</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثلاً: عربی"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                اٹیچمنٹس (URLs، کوما سے جدا)
              </label>
              <input
                value={attachments}
                onChange={(e) => setAttachments(e.target.value)}
                placeholder="https://a.pdf, https://b.mp4"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary hover:opacity-90 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                محفوظ کریں
              </button>
            </div>
          </form>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">میری اسائنمنٹس</h3>
          </div>
          {assignments.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              ابھی کوئی اسائنمنٹ موجود نہیں
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      عنوان
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      مضمون
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      آخری تاریخ
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map((a: any) => (
                    <tr key={a._id} className="bg-white">
                      <td className="px-5 py-3 text-gray-800">{a.title}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {a.subject || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {formatDate(a.dueDate)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/teacher/assignments/${a._id}`}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20"
                          >
                            سبمشنز
                          </Link>
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
    </TeacherLayout>
  );
}
