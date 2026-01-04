import { useEffect, useState } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";

interface SubjectMark {
  subject: string;
  marksObtained: number;
  totalMarks: number;
}

interface ExamInfo {
  title?: string;
  term?: string;
  className?: string;
  examDate?: string;
}

export default function StudentReportCard() {
  const [student, setStudent] = useState<any>(null);
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [subjects, setSubjects] = useState<SubjectMark[]>([]);
  const [totals, setTotals] = useState<{
    obtained: number;
    total: number;
  } | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [meRes, examsRes] = await Promise.all([
          api.get("/api/students/me"),
          api.get("/api/student/exams"),
        ]);

        const me = meRes.data?.student;
        setStudent(me || null);

        const results = (examsRes.data?.results || []) as any[];
        if (!results.length) {
          setError("کوئی شائع شدہ نتیجہ دستیاب نہیں ہے۔");
          return;
        }

        // Take the most recent published result (API already sorted by createdAt desc)
        const latest = results[0] as any;
        const ex = latest.exam || {};
        setExam({
          title: ex.title,
          term: ex.term,
          className: ex.className,
          examDate: ex.examDate,
        });

        const subs: SubjectMark[] = (latest.subjectMarks || []).map(
          (sm: any) => ({
            subject: sm.subject,
            marksObtained: Number(sm.marksObtained || 0),
            totalMarks: Number(sm.totalMarks || 0),
          })
        );
        setSubjects(subs);

        const totalObtained = subs.reduce((s, x) => s + x.marksObtained, 0);
        const totalMarks = subs.reduce((s, x) => s + x.totalMarks, 0);
        setTotals({ obtained: totalObtained, total: totalMarks });
        setGrade(latest.grade || "");
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "رزلٹ کارڈ لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const percentage =
    totals && totals.total
      ? Math.round((totals.obtained / totals.total) * 100)
      : 0;

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto p-6 print:p-0" dir="rtl">
        <div className="flex items-center justify-between mb-4 print:mb-2">
          <h1 className="text-xl font-bold">رزلٹ کارڈ</h1>
          <button
            onClick={() => window.print()}
            className="hidden print:hidden md:inline-flex px-3 py-1.5 rounded bg-emerald-600 text-white text-xs"
          >
            پرنٹ
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">لوڈ ہو رہا ہے…</div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        ) : !student || !exam ? (
          <div className="text-sm text-gray-500">ڈیٹا دستیاب نہیں۔</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow text-right print:shadow-none print:border-0">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-lg font-bold">مدرسہ</div>
              <div className="text-xs text-gray-500">Student Report Card</div>
            </div>

            {/* Student & Exam Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold">نام: </span>
                  {student.fullName}
                </div>
                <div>
                  <span className="font-semibold">رول نمبر: </span>
                  {student.rollNumber || "—"}
                </div>
                <div>
                  <span className="font-semibold">کلاس / سیکشن: </span>
                  {student.classId?.className || student.className || "—"}
                  {" / "}
                  {student.sectionId?.sectionName || student.section || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="font-semibold">امتحان: </span>
                  {exam.title || exam.term || "امتحان"}
                </div>
                <div>
                  <span className="font-semibold">ٹرم: </span>
                  {exam.term || "—"}
                </div>
                <div>
                  <span className="font-semibold">تاریخ: </span>
                  {exam.examDate
                    ? new Date(exam.examDate).toLocaleDateString("ur-PK")
                    : "—"}
                </div>
              </div>
            </div>

            {/* Marks Table */}
            <div className="mb-4">
              <table className="w-full text-xs border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 border-b border-gray-200 text-right font-semibold">
                      مضمون
                    </th>
                    <th className="px-3 py-2 border-b border-gray-200 text-right font-semibold">
                      حاصل نمبر
                    </th>
                    <th className="px-3 py-2 border-b border-gray-200 text-right font-semibold">
                      کل نمبر
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, idx) => (
                    <tr
                      key={`${s.subject}-${idx}`}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="px-3 py-1.5 border-t border-gray-100">
                        {s.subject}
                      </td>
                      <td className="px-3 py-1.5 border-t border-gray-100 text-right">
                        {s.marksObtained}
                      </td>
                      <td className="px-3 py-1.5 border-t border-gray-100 text-right">
                        {s.totalMarks}
                      </td>
                    </tr>
                  ))}
                  {totals && (
                    <tr className="bg-emerald-50 font-semibold">
                      <td className="px-3 py-1.5 border-t border-emerald-100 text-right">
                        مجموعی نمبر
                      </td>
                      <td className="px-3 py-1.5 border-t border-emerald-100 text-right">
                        {totals.obtained}
                      </td>
                      <td className="px-3 py-1.5 border-t border-emerald-100 text-right">
                        {totals.total}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <div className="text-xs text-emerald-800">فی صد</div>
                <div className="text-lg font-bold text-emerald-900">
                  {percentage}%
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <div className="text-xs text-blue-800">گریڈ</div>
                <div className="text-lg font-bold text-blue-900">
                  {grade || "—"}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <div className="text-xs text-gray-800">دستخط / مہر</div>
                <div className="h-10" />
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @media print {
            body {
              background: #fff;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </StudentLayout>
  );
}
