import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  ClipboardCheck,
  Filter,
  Calendar,
  BookOpen,
  Tag,
  RefreshCw,
} from "lucide-react";

interface ExamItem {
  _id: string;
  title: string;
  term: string;
  className: string;
  examDate: string;
  subjects: string[];
}

export default function NisabExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [className, setClassName] = useState("");
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/api/nisab/exams", {
        params: {
          className: className || undefined,
          term: term || undefined,
          q: query || undefined,
        },
      });
      setExams(res.data?.exams || []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "امتحانات لوڈ کرنے میں مسئلہ پیش آیا"
      );
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalExams = exams.length;

  const classSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ex of exams) {
      const key = ex.className || "نامعلوم";
      counts[key] = (counts[key] || 0) + 1;
    }
    const labels = Object.keys(counts);
    const values = labels.map((l) => counts[l]);
    return { labels, values };
  }, [exams]);

  const distinctClasses = useMemo(
    () => new Set(exams.map((e) => e.className || "نامعلوم")).size,
    [exams]
  );

  const distinctTerms = useMemo(
    () => new Set(exams.map((e) => e.term || "نامعلوم")).size,
    [exams]
  );

  return (
    <NisabLayout title="امتحانات">
      <div className="space-y-4" dir="rtl">
       

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{totalExams}</div>
            <div className="text-emerald-100 text-sm font-medium">
              کل امتحانات
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{distinctClasses}</div>
            <div className="text-blue-100 text-sm font-medium">مختلف درجات</div>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Tag className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{distinctTerms}</div>
            <div className="text-violet-100 text-sm font-medium">
              مختلف ٹرمز
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
                <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                درجہ (Class)
              </label>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="مثال: درجہ اول"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                ٹرم
              </label>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="مثال: سالانہ"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                تلاش
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="امتحان کا نام"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={load}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-sm font-medium shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                فلٹر لگائیں
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border-2 border-red-200 p-3 flex items-start gap-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Chart */}
        {classSummary.labels.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 rounded-lg p-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  کلاس وار امتحانات
                </h2>
                <p className="text-xs text-gray-500">
                  ہر درجے میں امتحانات کی تعداد
                </p>
              </div>
            </div>
            <SimpleBarChart
              title=""
              labels={classSummary.labels}
              values={classSummary.values}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <ClipboardCheck className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                کوئی امتحان نہیں ملا
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
                        <ClipboardCheck className="w-4 h-4" />
                        امتحان کا نام
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <BookOpen className="w-4 h-4" />
                        درجہ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Tag className="w-4 h-4" />
                        ٹرم
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      <div className="flex items-center gap-2 justify-end">
                        <Calendar className="w-4 h-4" />
                        تاریخ
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      مضامین
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exams.map((ex, index) => (
                    <tr
                      key={ex._id}
                      className={`hover:bg-emerald-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {ex.title}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                          <BookOpen className="w-3.5 h-3.5" />
                          {ex.className}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                          <Tag className="w-3.5 h-3.5" />
                          {ex.term}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {String(ex.examDate).substring(0, 10)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">
                        {ex.subjects && ex.subjects.length > 0
                          ? ex.subjects.join("، ")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </NisabLayout>
  );
}
