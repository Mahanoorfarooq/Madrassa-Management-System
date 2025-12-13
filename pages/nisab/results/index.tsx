import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";

interface ExamOption {
  _id: string;
  title: string;
  term: string;
  className: string;
}

interface StudentOption {
  _id: string;
  fullName?: string;
  rollNumber?: string;
}

interface ResultItem {
  _id: string;
  student: {
    _id: string;
    fullName?: string;
    rollNumber?: string;
  };
  exam: {
    _id: string;
    title: string;
    term: string;
    className: string;
    examDate: string;
  };
  subjectMarks: {
    subject: string;
    marksObtained: number;
    totalMarks: number;
  }[];
  totalObtained: number;
  totalMarks: number;
  grade: string;
}

export default function NisabResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [examOptions, setExamOptions] = useState<ExamOption[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);

  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [gradeQuery, setGradeQuery] = useState("");

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [eRes, sRes] = await Promise.all([
          api.get("/api/nisab/exams"),
          api.get("/api/students", { params: { status: "Active" } }),
        ]);
        setExamOptions(eRes.data?.exams || []);
        setStudentOptions(sRes.data?.students || []);
      } catch {}
    };
    loadMeta();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/nisab/results", {
        params: {
          exam: examId || undefined,
          student: studentId || undefined,
          q: gradeQuery || undefined,
        },
      });
      setResults(res.data?.results || []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "نتائج لوڈ کرنے میں مسئلہ پیش آیا"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const totalResults = results.length;

  const averagePercentage = useMemo(() => {
    if (!results.length) return 0;
    let sum = 0;
    let count = 0;
    for (const r of results) {
      if (!r.totalMarks) continue;
      const perc = (r.totalObtained / r.totalMarks) * 100;
      if (!Number.isNaN(perc)) {
        sum += perc;
        count += 1;
      }
    }
    if (!count) return 0;
    return Math.round(sum / count);
  }, [results]);

  const distinctGrades = useMemo(
    () => new Set(results.map((r) => r.grade || "N/A")).size,
    [results]
  );

  const gradeChart = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of results) {
      const key = r.grade || "N/A";
      counts[key] = (counts[key] || 0) + 1;
    }
    const labels = Object.keys(counts);
    const values = labels.map((l) => counts[l]);
    return { labels, values };
  }, [results]);

  return (
    <NisabLayout title="امتحانی نتائج">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1 text-right">
                امتحان منتخب کریں
              </label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full rounded border px-2 py-2 text-sm text-right"
              >
                <option value="">تمام امتحانات</option>
                {examOptions.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.title} - {ex.className} - {ex.term}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 text-right">
                طالب علم منتخب کریں
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded border px-2 py-2 text-sm text-right"
              >
                <option value="">تمام طلبہ</option>
                {studentOptions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {(s.fullName || "") +
                      (s.rollNumber ? " - " + s.rollNumber : "")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 text-right">
                گریڈ تلاش کریں
              </label>
              <input
                value={gradeQuery}
                onChange={(e) => setGradeQuery(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm text-right"
                placeholder="مثال: A+, B، کامیاب"
              />
            </div>
            <div className="flex md:justify-end">
              <button
                type="button"
                onClick={loadResults}
                className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 w-full md:w-auto"
              >
                فلٹر لگائیں
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-[11px] text-red-600 text-right bg-red-50 rounded px-3 py-1">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="کل نتائج" value={totalResults} />
          <StatCard title="اوسط فیصد" value={`${averagePercentage}%`} />
          <StatCard title="مختلف گریڈز" value={distinctGrades} />
        </div>

        {gradeChart.labels.length > 0 && (
          <SimpleBarChart
            title="گریڈز کی تقسیم"
            labels={gradeChart.labels}
            values={gradeChart.values}
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 text-right">
              نتائج کی فہرست
            </h2>
            {loading && (
              <span className="text-[11px] text-gray-500">
                لوڈ ہو رہا ہے...
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    طالب علم
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    رجسٹریشن
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    امتحان
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    درجہ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    کل نمبر
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    فیصد
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    گریڈ
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const perc =
                    r.totalMarks > 0
                      ? ((r.totalObtained / r.totalMarks) * 100).toFixed(1)
                      : "-";
                  const studentName =
                    (r.student && (r.student.fullName || "")) || "";
                  const roll =
                    r.student && r.student.rollNumber
                      ? r.student.rollNumber
                      : "";
                  return (
                    <tr key={r._id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{studentName}</td>
                      <td className="px-3 py-2">{roll}</td>
                      <td className="px-3 py-2">
                        {r.exam?.title} ({r.exam?.term})
                      </td>
                      <td className="px-3 py-2">{r.exam?.className}</td>
                      <td className="px-3 py-2">
                        {r.totalObtained}/{r.totalMarks}
                      </td>
                      <td className="px-3 py-2">{perc}</td>
                      <td className="px-3 py-2">{r.grade}</td>
                    </tr>
                  );
                })}
                {!loading && results.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-4 text-center text-gray-400"
                    >
                      کوئی نتیجہ نہیں ملا۔
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </NisabLayout>
  );
}
