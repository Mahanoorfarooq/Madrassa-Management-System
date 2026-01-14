import Link from "next/link";
import { useEffect, useState } from "react";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import api from "@/utils/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  UserPlus,
  PlusCircle,
  Calendar,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function TajweedDashboard() {
  const [totals, setTotals] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const deptRes = await api.get("/api/departments", {
          params: { code: "TAJWEED", ensure: "true" },
        });
        const dept = deptRes.data?.department;
        const params: any = dept?._id
          ? { departmentId: dept._id }
          : { code: "TAJWEED" };
        const res = await api.get("/api/departments/stats", { params });
        setTotals(res.data || {});
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          "براہ کرم لاگ اِن کریں یا بعد میں دوبارہ کوشش کریں";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    {
      title: "کل طلبہ",
      value: totals.totalStudents,
      icon: Users,
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "کل اساتذہ",
      value: totals.totalTeachers,
      icon: GraduationCap,
      color: "teal",
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      title: "کل کلاسز",
      value: totals.totalClasses,
      icon: BookOpen,
      color: "sky",
      gradient: "from-sky-500 to-cyan-500",
    },
    {
      title: "اوسط حاضری",
      value: `${totals.attendanceRate}%`,
      icon: TrendingUp,
      color: "blue",
      gradient: "from-blue-500 to-indigo-500",
    },
  ];

  const quickLinks = [
    {
      href: "/talba/students?dept=TAJWEED",
      label: "نیا طالب علم شامل کریں",
      icon: UserPlus,
      color: "bg-cyan-500",
    },
    {
      href: "/talba/teachers?dept=TAJWEED",
      label: "نیا استاد شامل کریں",
      icon: GraduationCap,
      color: "bg-teal-500",
    },
    {
      href: "/talba/classes?dept=TAJWEED",
      label: "نئی کلاس بنائیں",
      icon: PlusCircle,
      color: "bg-sky-500",
    },
    {
      href: "/talba/attendance?dept=TAJWEED",
      label: "آج کی حاضری لگائیں",
      icon: Calendar,
      color: "bg-blue-500",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: any = {
      cyan: {
        bg: "bg-cyan-100",
        text: "text-cyan-600",
        border: "border-cyan-200",
      },
      teal: {
        bg: "bg-teal-100",
        text: "text-teal-600",
        border: "border-teal-200",
      },
      sky: { bg: "bg-sky-100", text: "text-sky-600", border: "border-sky-200" },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
      },
    };
    return colors[color] || colors.cyan;
  };

  return (
    <TalbaLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header Banner */}
        <div className="bg-secondary rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <BookOpen className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">شعبہ تجوید</h1>
              <p className="text-white/80 text-sm">
                خوش آمدید! یہاں آپ کی تمام معلومات موجود ہیں
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 border-r-4 border-red-500 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`bg-primary/10 rounded-full p-3`}>
                    <Icon className={`w-6 h-6 text-primary`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{s.title}</p>
                <div className={`text-3xl font-bold text-primary`}>
                  {loading ? (
                    <div className="w-16 h-8 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    s.value
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <ArrowLeft className="w-5 h-5 text-primary" />
                </div>
                فوری روابط
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-secondary transition-all duration-300 shadow-sm hover:shadow-md p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`bg-primary rounded-lg p-3 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
                            {link.label}
                          </p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-secondary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 rounded-full p-2">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">شعبہ کا خلاصہ</h2>
            </div>
            <SimpleBarChart
              title=""
              labels={["طلبہ", "اساتذہ", "کلاسز"]}
              values={[
                totals.totalStudents || 0,
                totals.totalTeachers || 0,
                totals.totalClasses || 0,
              ]}
            />
          </div>
        </div>
      </div>
    </TalbaLayout>
  );
}
