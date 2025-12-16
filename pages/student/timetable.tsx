import { useMemo } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { Calendar, Clock, User, BookOpen } from "lucide-react";

interface SubjectRow {
  subject: string;
  teacherName: string;
}

const urDays = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];

export default function StudentTimetable() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"weekly" | "daily">("weekly");
  const [dayIndex, setDayIndex] = useState<number>(new Date().getDay());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/student/classes");
        const rows = (res.data?.subjects || []) as any[];
        setSubjects(
          rows.map((r: any) => ({
            subject: r.subject || "",
            teacherName: r.teacherName || "",
          }))
        );
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "ٹائم ٹیبل لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const weeklyGrid = useMemo(() => {
    // Simple distribution of subjects across days in order
    const days = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      periods: [] as SubjectRow[],
    }));
    subjects.forEach((s, idx) => {
      const d = idx % 5; // Mon-Fri by default
      days[(d + 1) % 7].periods.push(s); // shift so 1=Mon
    });
    return days;
  }, [subjects]);

  return (
    <StudentLayout >
      <div className="p-6 max-w-7xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">ٹائم ٹیبل</h2>
                <p className="text-teal-100 text-sm">
                  {view === "weekly"
                    ? "ہفتہ وار شیڈول"
                    : `یومیہ شیڈول: ${urDays[dayIndex]}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">منظر:</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={view}
                onChange={(e) => setView(e.target.value as any)}
                className="rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              >
                <option value="weekly">ہفتہ وار</option>
                <option value="daily">یومیہ</option>
              </select>
              {view === "daily" && (
                <select
                  value={dayIndex}
                  onChange={(e) => setDayIndex(Number(e.target.value))}
                  className="rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                >
                  {urDays.map((d, i) => (
                    <option key={i} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {view === "weekly" ? (
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {weeklyGrid.slice(1, 6).map((day) => (
                    <div
                      key={day.day}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:bg-teal-50/30 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="text-sm font-bold text-gray-800">
                          {urDays[day.day]}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {day.periods.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-4">
                            کوئی پیریڈ نہیں
                          </div>
                        ) : (
                          day.periods.map((p, i) => (
                            <div
                              key={i}
                              className="bg-gray-50 rounded-lg p-2 border border-gray-200 hover:bg-teal-50 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="w-3 h-3 text-teal-600" />
                                <div className="text-xs font-semibold text-gray-800">
                                  {p.subject || "—"}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <User className="w-3 h-3" />
                                <span>{p.teacherName || "—"}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="text-base font-bold text-gray-800">
                    {urDays[dayIndex]}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                          مضمون
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                          استاد
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyGrid[dayIndex]?.periods?.length ? (
                        weeklyGrid[dayIndex].periods.map((p, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-100 hover:bg-cyan-50"
                          >
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-cyan-600" />
                                <span className="font-medium text-gray-800">
                                  {p.subject || "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" />
                                <span>{p.teacherName || "—"}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            className="px-4 py-12 text-center text-gray-400 text-sm"
                            colSpan={2}
                          >
                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <div>کوئی پیریڈ نہیں</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
