import { FormEvent, useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import api from "@/utils/api";
import { Calendar, Award, FileText, Send, TrendingUp } from "lucide-react";

interface ExamScheduleItem {
  id: string;
  name: string;
  date: string;
  time: string;
  subject: string;
  room: string;
}

interface ResultItem {
  subject: string;
  obtained: number;
  total: number;
}

export default function StudentExams() {
  const [schedule, setSchedule] = useState<ExamScheduleItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestRank, setLatestRank] = useState<{
    position: number;
    total: number;
  } | null>(null);

  const [subject, setSubject] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [recheckSent, setRecheckSent] = useState(false);
  const [recheckError, setRecheckError] = useState<string | null>(null);
  const [recheckLoading, setRecheckLoading] = useState(false);

  const submitRecheck = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !reason.trim()) return;
    try {
      setRecheckLoading(true);
      setRecheckError(null);
      await api.post("/api/student/recheck-requests", {
        subject,
        reason,
      });
      setRecheckSent(true);
      setSubject("");
      setReason("");
    } catch (e: any) {
      setRecheckError(
        e?.response?.data?.message || "درخواست محفوظ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setRecheckLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/api/student/exams");
        const exams = (res.data?.exams || []) as any[];
        const rawResults = (res.data?.results || []) as any[];
        setLatestRank(res.data?.latestRank || null);

        const scheduleItems: ExamScheduleItem[] = [];
        exams.forEach((ex) => {
          const examDate = ex.examDate;
          const title: string = ex.title || ex.term || "امتحان";
          if (Array.isArray(ex.subjects) && ex.subjects.length) {
            ex.subjects.forEach((sub: string, idx: number) => {
              scheduleItems.push({
                id: `${ex._id}-${idx}`,
                name: title,
                date: examDate,
                time: "",
                subject: sub,
                room: "",
              });
            });
          } else {
            scheduleItems.push({
              id: String(ex._id),
              name: title,
              date: examDate,
              time: "",
              subject: "",
              room: "",
            });
          }
        });
        setSchedule(scheduleItems);

        const subjectRows: ResultItem[] = [];
        rawResults.forEach((r) => {
          (r.subjectMarks || []).forEach((sm: any) => {
            subjectRows.push({
              subject: sm.subject,
              obtained: Number(sm.marksObtained || 0),
              total: Number(sm.totalMarks || 0),
            });
          });
        });
        setResults(subjectRows);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            "امتحانات کے ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalObtained = results.reduce((s, r) => s + r.obtained, 0);
  const totalMarks = results.reduce((s, r) => s + r.total, 0);
  const percentage = totalMarks
    ? Math.round((totalObtained / totalMarks) * 100)
    : 0;

  return (
    <StudentLayout>
      <div className="p-6 max-w-7xl mx-auto" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exam Schedule */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">امتحانی شیڈول</h2>
                  <p className="text-blue-100 text-xs">آنے والے امتحانات</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {schedule.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <div>کوئی امتحان شیڈول نہیں</div>
                  </div>
                ) : (
                  schedule.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-800">
                          {e.subject}
                        </div>
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                          {e.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        تاریخ: {new Date(e.date).toLocaleDateString("ur-PK")}
                      </div>
                      {e.time && (
                        <div className="text-xs text-gray-600">
                          وقت: {e.time}
                        </div>
                      )}
                      {e.room && (
                        <div className="text-xs text-gray-600">
                          کمرہ: {e.room}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">نتیجہ</h2>
                      <p className="text-emerald-100 text-xs">کارکردگی</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-700">
                      {percentage}%
                    </div>
                    <div className="text-xs text-gray-600">فیصد</div>
                  </div>
                  {latestRank && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">
                        {latestRank.position}/{latestRank.total}
                      </div>
                      <div className="text-xs text-gray-600">پوزیشن</div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-3 text-center">
                  حاصل کردہ: {totalObtained} / {totalMarks}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-3 py-2 text-xs font-semibold text-gray-700 text-right">
                          مضمون
                        </th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                          نمبر
                        </th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                          کل
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-3 py-2 text-sm text-gray-800">
                            {r.subject}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-700 text-center">
                            {r.obtained}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-700 text-center">
                            {r.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recheck Request */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <FileText className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-semibold text-gray-800">
                  رى چیک کی درخواست
                </h3>
              </div>

              <form onSubmit={submitRecheck} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    مضمون
                  </label>
                  <input
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="مضمون کا نام"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    وجہ
                  </label>
                  <textarea
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    rows={3}
                    placeholder="درخواست کی وجہ"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                {recheckError && (
                  <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200">
                    {recheckError}
                  </div>
                )}

                {recheckSent && (
                  <div className="rounded-lg bg-emerald-50 text-emerald-700 text-sm px-4 py-3 border border-emerald-200">
                    آپ کی درخواست محفوظ ہو گئی ہے۔
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-all"
                  disabled={!subject.trim() || !reason.trim() || recheckLoading}
                >
                  <Send className="w-4 h-4" />
                  درخواست جمع کریں
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
