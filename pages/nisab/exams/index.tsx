import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [className, setClassName] = useState("");
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
              <div>
                <label className="block text-xs text-gray-600 mb-1 text-right">
                  درجہ (Class)
                </label>
                <input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm text-right"
                  placeholder="مثال: درجہ اول، درجہ دوم"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 text-right">
                  ٹرم / امتحان کی نوعیت
                </label>
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm text-right"
                  placeholder="مثال: سالانہ، نصف سالانہ"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 text-right">
                  تلاش (امتحان کا نام)
                </label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm text-right"
                  placeholder="امتحان کا نام لکھیں"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700"
            >
              فلٹر لگائیں
            </button>
          </div>
          {error && (
            <p className="mt-2 text-[11px] text-red-600 text-right bg-red-50 rounded px-3 py-1">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="کل امتحانات" value={totalExams} />
          <StatCard title="مختلف درجات" value={distinctClasses} />
          <StatCard title="مختلف ٹرمز" value={distinctTerms} />
        </div>

        {classSummary.labels.length > 0 && (
          <SimpleBarChart
            title="کلاس وار امتحانات"
            labels={classSummary.labels}
            values={classSummary.values}
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 text-right">
              امتحانات کی فہرست
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
                    امتحان کا نام
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    درجہ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">ٹرم</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    تاریخ امتحان
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    مضامین
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams.map((ex) => (
                  <tr key={ex._id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">{ex.title}</td>
                    <td className="px-3 py-2">{ex.className}</td>
                    <td className="px-3 py-2">{ex.term}</td>
                    <td className="px-3 py-2">
                      {String(ex.examDate).substring(0, 10)}
                    </td>
                    <td className="px-3 py-2">
                      {ex.subjects && ex.subjects.length > 0
                        ? ex.subjects.join("، ")
                        : "-"}
                    </td>
                  </tr>
                ))}
                {!loading && exams.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-gray-400"
                    >
                      کوئی امتحان نہیں ملا۔
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
