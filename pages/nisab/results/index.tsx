import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  GraduationCap,
  Filter,
  User,
  ClipboardCheck,
  TrendingUp,
  Award,
  RefreshCw,
  BookOpen,
} from "lucide-react";

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
    }
  };

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="space-y-4" dir="rtl">
       
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{totalResults}</div>
            <div className="text-violet-100 text-sm font-medium">کل نتائج</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{averagePercentage}%</div>
            <div className="text-emerald-100 text-sm font-medium">
              اوسط فیصد
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{distinctGrades}</div>
            <div className="text-amber-100 text-sm font-medium">
              مختلف گریڈز
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-gray-500" />
                امتحان
              </label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">تمام امتحانات</option>
                {examOptions.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.title} - {ex.className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-500" />
                طالب علم
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-gray-500" />
                گریڈ
              </label>
              <input
                value={gradeQuery}
                onChange={(e) => setGradeQuery(e.target.value)}
                placeholder="مثال: A+"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={loadResults}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 text-sm font-medium shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                فلٹر لگائیں
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border-2 border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Chart */}
        {gradeChart.labels.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-violet-100 rounded-lg p-2">
                <Award className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  گریڈز کی تقسیم
                </h2>
                <p className="text-xs text-gray-500">
                  ہر گریڈ میں طلبہ کی تعداد
                </p>
              </div>
            </div>
            <SimpleBarChart
              title=""
              labels={gradeChart.labels}
              values={gradeChart.values}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی نتیجہ نہیں ملا
              </h3>
              <p className="text-sm text-gray-500">
                فلٹرز تبدیل کر کے دوبارہ کوشش کریں
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <User className="w-4 h-4" />
                        طالب علم
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      رول نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <ClipboardCheck className="w-4 h-4" />
                        امتحان
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <BookOpen className="w-4 h-4" />
                        درجہ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      کل نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <TrendingUp className="w-4 h-4" />
                        فیصد
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Award className="w-4 h-4" />
                        گریڈ
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r, index) => {
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
                      <tr
                        key={r._id}
                        className={`hover:bg-violet-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-5 py-4 font-medium text-gray-800">
                          {studentName}
                        </td>
                        <td className="px-5 py-4 text-gray-600">{roll}</td>
                        <td className="px-5 py-4 text-gray-700">
                          {r.exam?.title} ({r.exam?.term})
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                            <BookOpen className="w-3.5 h-3.5" />
                            {r.exam?.className}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {r.totalObtained}/{r.totalMarks}
                        </td>
                        <td className="px-5 py-4 font-semibold text-emerald-600">
                          {perc}%
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold">
                            <Award className="w-3.5 h-3.5" />
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </NisabLayout>
  );
}
