import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  BookOpen,
  Users,
  ClipboardCheck,
  ArrowRight,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";

export default function TeacherDashboard() {
  const [me, setMe] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [dash, setDash] = useState<{
    todayClasses: any[];
    pendingLeavesCount: number;
    pendingRechecksCount: number;
    upcomingExams: any[];
    notices: any[];
  } | null>(null);
  const [selfSummary, setSelfSummary] = useState<{
    totalDays: number;
    present: number;
    absent: number;
    leave: number;
    percent: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        const toStr = end.toISOString().slice(0, 10);
        const fromStr = start.toISOString().slice(0, 10);

        const [m, c, d, sa] = await Promise.all([
          api.get("/api/teacher/me"),
          api.get("/api/teacher/classes"),
          api.get("/api/teacher/dashboard"),
          api.get("/api/teacher/self-attendance", {
            params: { from: fromStr, to: toStr },
          }),
        ]);
        setMe(m.data || null);
        setClasses(c.data?.classes || []);
        setDash({
          todayClasses: d.data?.todayClasses || [],
          pendingLeavesCount: d.data?.pendingLeavesCount || 0,
          pendingRechecksCount: d.data?.pendingRechecksCount || 0,
          upcomingExams: d.data?.upcomingExams || [],
          notices: d.data?.notices || [],
        });
        const s = sa.data?.summary || {
          totalDays: 0,
          present: 0,
          absent: 0,
          leave: 0,
        };
        const denom = Math.max(
          1,
          (s.present || 0) + (s.absent || 0) + (s.leave || 0)
        );
        const percent = Math.round(((s.present || 0) / denom) * 100);
        setSelfSummary({ ...s, percent });
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const classCount = classes.length;
    const sectionCount = classes.reduce(
      (s, x: any) => s + (x.sections?.length || 0),
      0
    );
    const studentCount = classes.reduce(
      (s, x: any) =>
        s +
        (x.sections || []).reduce(
          (ss: number, sec: any) => ss + (sec.studentCount || 0),
          0
        ),
      0
    );
    return { classCount, sectionCount, studentCount };
  }, [classes]);

  const classChart = useMemo(() => {
    if (!classes.length)
      return { labels: [] as string[], values: [] as number[] };
    const labels: string[] = [];
    const values: number[] = [];
    for (const c of classes) {
      const label = c.className || "کلاس";
      const totalStudents = (c.sections || []).reduce(
        (s: number, sec: any) => s + (sec.studentCount || 0),
        0
      );
      labels.push(label);
      values.push(totalStudents);
    }
    return { labels, values };
  }, [classes]);

  const quick = [
    {
      href: "/teacher/attendance",
      label: "حاضری لگائیں",
      icon: ClipboardCheck,
      gradient: "from-blue-500 to-cyan-500",
      description: "آج کی حاضری درج کریں",
    },
    {
      href: "/teacher/classes",
      label: "میری کلاسز دیکھیں",
      icon: BookOpen,
      gradient: "from-purple-500 to-pink-500",
      description: "تفویض شدہ کلاسز",
    },
  ];

  const formatDate = (value: any) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div className="text-right flex-1">
              <h1 className="text-2xl font-bold mb-2">
                خوش آمدید، {me?.teacher?.fullName || "استاد"}
              </h1>
              <p className="text-blue-100 text-sm">
                آج کی تاریخ: {new Date().toLocaleDateString("ur-PK")}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Award className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Exams & Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming Exams */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                آنے والے امتحانات
              </h3>
            </div>
            {dash?.upcomingExams?.length ? (
              <div className="space-y-2 max-h-60 overflow-y-auto text-right">
                {dash.upcomingExams.map((e: any) => (
                  <div
                    key={e.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
                  >
                    <div className="text-sm font-semibold text-gray-800">
                      {e.title}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {e.className || "کلاس"} {e.term ? `- ${e.term}` : ""}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      تاریخ: {formatDate(e.examDate)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                اس وقت کوئی امتحان شیڈول نہیں۔
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                انتظامیہ نوٹس
              </h3>
            </div>
            {dash?.notices?.length ? (
              <div className="space-y-2 max-h-60 overflow-y-auto text-right">
                {dash.notices.map((n: any) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
                  >
                    <div className="text-sm font-semibold text-gray-800">
                      {n.title}
                    </div>
                    <div className="text-[11px] text-gray-500 mb-1">
                      {formatDate(n.createdAt)}
                    </div>
                    <div className="text-xs text-gray-700 whitespace-pre-wrap">
                      {n.message}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                ابھی کوئی نوٹس دستیاب نہیں۔
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Classes Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">کلاسز</p>
                <p className="text-3xl font-bold text-gray-800">
                  {metrics.classCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>تفویض شدہ کلاسز</span>
            </div>
          </div>

          {/* Sections Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">سیکشنز</p>
                <p className="text-3xl font-bold text-gray-800">
                  {metrics.sectionCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-600">
              <TrendingUp className="w-4 h-4" />
              <span>کل سیکشنز</span>
            </div>
          </div>

          {/* Students Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">طلبہ</p>
                <p className="text-3xl font-bold text-gray-800">
                  {metrics.studentCount > 0 ? metrics.studentCount : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>کل طلبہ کی تعداد</span>
            </div>
          </div>

          {/* My Attendance (last 30 days) */}
          <Link
            href="/teacher/my-attendance"
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">میری حاضری (30 دن)</p>
                <p className="text-3xl font-bold text-gray-800">
                  {selfSummary ? `${selfSummary.percent}%` : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 text-xs">
              <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                حاضر: {selfSummary?.present ?? 0}
              </span>
              <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                غائب: {selfSummary?.absent ?? 0}
              </span>
              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                رخصت: {selfSummary?.leave ?? 0}
              </span>
            </div>
          </Link>
        </div>

        {/* Pending Requests Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                زیر غور درخواستیں
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs text-amber-700 mb-1">
                  رخصت کی درخواستیں
                </div>
                <div className="text-2xl font-bold text-amber-700">
                  {dash?.pendingLeavesCount ?? 0}
                </div>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="text-xs text-blue-700 mb-1">
                  ری چیک کی درخواستیں
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {dash?.pendingRechecksCount ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Today’s Classes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                آج کی کلاسز
              </h3>
              <Link
                href="/teacher/classes"
                className="text-sm text-primary hover:underline"
              >
                تمام دیکھیں
              </Link>
            </div>
            {dash?.todayClasses?.length ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dash.todayClasses.flatMap((c: any) =>
                  (c.sections || []).map((s: any) => (
                    <Link
                      key={`${c.classId}:${s.sectionId}`}
                      href={`/teacher/classes/${c.classId}/sections/${s.sectionId}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 hover:bg-teal-50 hover:border-teal-300 transition-all"
                    >
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">
                          {c.className || "کلاس"} - {s.sectionName || "سیکشن"}
                        </div>
                        <div className="text-[11px] text-gray-600">
                          طلبہ:{" "}
                          {typeof s.studentCount === "number"
                            ? s.studentCount
                            : "—"}
                        </div>
                      </div>
                      <span className="text-xs text-teal-700">حاضری</span>
                    </Link>
                  ))
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                آج کوئی کلاس نظر نہیں آ رہی۔
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">فوری رسائی</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quick.map((q) => {
              const IconComponent = q.icon;
              return (
                <Link
                  key={q.href}
                  href={q.href}
                  className="group relative rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all p-5 overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${q.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
                  ></div>

                  <div className="relative flex items-center gap-4 text-right">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {q.label}
                      </h3>
                      <p className="text-sm text-gray-600">{q.description}</p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${q.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-gray-400 transform rotate-180" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Chart Section */}
        {classChart.labels.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                کلاسز کے طلبہ کی تعداد
              </h2>
            </div>
            <SimpleBarChart
              title=""
              labels={classChart.labels}
              values={classChart.values}
            />
          </div>
        )}

        {/* No Classes Message */}
        {classes.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ابھی تک کوئی کلاس تفویض نہیں
            </h3>
            <p className="text-sm text-gray-600">
              جب آپ کو کلاسز تفویض کی جائیں گی تو یہاں نظر آئیں گی
            </p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
