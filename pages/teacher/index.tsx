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

  useEffect(() => {
    const load = async () => {
      try {
        const [m, c] = await Promise.all([
          api.get("/api/teacher/me"),
          api.get("/api/teacher/classes"),
        ]);
        setMe(m.data || null);
        setClasses(c.data?.classes || []);
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

  return (
    <TeacherLayout title="استاد ڈیش بورڈ">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
