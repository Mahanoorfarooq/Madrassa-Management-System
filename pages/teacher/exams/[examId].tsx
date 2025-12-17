import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

interface EntryRow {
  studentId: string;
  fullName: string;
  rollNumber?: string;
  marksObtained: number | null;
  totalMarks: number | null;
  grade?: string | null;
  remarks?: string | null;
}

export default function TeacherExamMarksPage() {
  const router = useRouter();
  const { examId } = router.query as { examId?: string };

  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<string, any[]>>(
    {}
  );

  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subject, setSubject] = useState("");

  const [entries, setEntries] = useState<EntryRow[]>([]);

  const subjects = useMemo(
    () => (Array.isArray(exam?.subjects) ? exam.subjects : []),
    [exam]
  );

  const sections = useMemo(() => {
    if (!classId) return [] as any[];
    return sectionsByClass[classId] || [];
  }, [classId, sectionsByClass]);

  const loadExam = async () => {
    if (!examId) return;
    const res = await api.get("/api/teacher/exams", { params: {} });
    const list = res.data?.exams || [];
    const found = list.find((x: any) => x._id === examId);
    setExam(found || null);
  };

  const loadClasses = async () => {
    const res = await api.get("/api/teacher/classes");
    const cls = res.data?.classes || [];
    setClasses(cls);
    const map: Record<string, any[]> = {};
    for (const c of cls) map[c.classId] = c.sections || [];
    setSectionsByClass(map);
  };

  const loadEntries = async () => {
    if (!examId || !classId || !sectionId || !subject) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/teacher/exams/${examId}/marks`, {
        params: { classId, sectionId, subject },
      });
      setEntries(
        (res.data?.entries || []).map((e: any) => ({
          studentId: e.studentId,
          fullName: e.fullName,
          rollNumber: e.rollNumber,
          marksObtained:
            typeof e.marksObtained === "number" ? e.marksObtained : null,
          totalMarks: typeof e.totalMarks === "number" ? e.totalMarks : null,
          grade: e.grade ?? null,
          remarks: e.remarks ?? null,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadExam();
  }, [examId]);

  useEffect(() => {
    loadEntries();
  }, [examId, classId, sectionId, subject]);

  const setField = (idx: number, field: keyof EntryRow, value: any) => {
    setEntries((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const saveAll = async () => {
    if (!examId || !classId || !sectionId || !subject) return;
    setLoading(true);
    try {
      const payload = entries
        .map((e) => ({
          studentId: e.studentId,
          marksObtained: Number(e.marksObtained),
          totalMarks: Number(e.totalMarks),
          remarks: e.remarks || undefined,
        }))
        .filter(
          (x) =>
            Number.isFinite(x.marksObtained) && Number.isFinite(x.totalMarks)
        );
      await api.post(`/api/teacher/exams/${examId}/marks`, {
        classId,
        sectionId,
        subject,
        entries: payload,
      });
      await loadEntries();
      alert("محفوظ ہو گیا");
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const header = [
      "Student",
      "Roll",
      "MarksObtained",
      "TotalMarks",
      "Grade",
      "Remarks",
    ];
    const rows = entries.map((e) => [
      `"${String(e.fullName || "").replaceAll('"', '""')}"`,
      `"${e.rollNumber ?? ""}"`,
      e.marksObtained ?? "",
      e.totalMarks ?? "",
      e.grade ?? "",
      e.remarks ? `"${String(e.remarks).replaceAll('"', '""')}"` : "",
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marks-${examId}-${classId}-${sectionId}-${subject}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TeacherLayout>
      <div className="space-y-6" dir="rtl">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-5 text-white shadow-md">
          <h1 className="text-xl font-bold">مارکس درج کریں</h1>
          <p className="text-indigo-100 text-xs">
            درجہ اور مضمون منتخب کر کے طلبہ کے نمبر درج کریں
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-700 mb-1">کلاس</label>
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSectionId("");
              }}
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
            >
              <option value="">منتخب کریں</option>
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
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 disabled:bg-gray-100"
            >
              <option value="">منتخب کریں</option>
              {sections.map((s: any) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.sectionName || "سیکشن"}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-700 mb-1">مضمون</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
            >
              <option value="">منتخب کریں</option>
              {subjects.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {!classId || !sectionId || !subject ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              پہلے کلاس، سیکشن اور مضمون منتخب کریں
            </div>
          ) : loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              لوڈ ہو رہا ہے…
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              طلبہ نہیں ملے
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      طالب علم
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      رول نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      حاصل نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      کل نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      گریڈ
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-700">
                      ریمارکس
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((e, idx) => (
                    <tr key={e.studentId} className="bg-white">
                      <td className="px-5 py-3 text-gray-800">{e.fullName}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {e.rollNumber || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          value={e.marksObtained ?? ""}
                          onChange={(ev) =>
                            setField(
                              idx,
                              "marksObtained",
                              ev.target.value === ""
                                ? null
                                : Number(ev.target.value)
                            )
                          }
                          className="w-28 rounded-lg border-2 border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:border-indigo-600"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          value={e.totalMarks ?? ""}
                          onChange={(ev) =>
                            setField(
                              idx,
                              "totalMarks",
                              ev.target.value === ""
                                ? null
                                : Number(ev.target.value)
                            )
                          }
                          className="w-28 rounded-lg border-2 border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:border-indigo-600"
                        />
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {e.grade ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <input
                          value={e.remarks ?? ""}
                          onChange={(ev) =>
                            setField(idx, "remarks", ev.target.value)
                          }
                          className="w-64 rounded-lg border-2 border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:border-indigo-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={exportCsv}
            disabled={!entries.length}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm hover:bg-gray-200 disabled:opacity-60"
          >
            CSV ایکسپورٹ
          </button>
          <button
            onClick={saveAll}
            disabled={loading || !entries.length}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            محفوظ کریں
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
}
