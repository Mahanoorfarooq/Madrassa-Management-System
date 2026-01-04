import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  Users,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Sparkles,
  BarChart3,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

interface DepartmentItem {
  _id: string;
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface DeptSummary {
  id: string;
  name: string;
  code?: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
}

export default function TalbaDashboard() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [deptStats, setDeptStats] = useState<DeptSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/api/departments");
        const list = (res.data?.departments || []) as any[];
        setDepartments(list);

        if (!list.length) {
          setDeptStats([]);
          return;
        }

        const statsRes = await Promise.all(
          list.map((d) =>
            api
              .get("/api/departments/stats", {
                params: { departmentId: d._id },
              })
              .then((r) => r.data)
              .catch(() => null)
          )
        );

        const merged: DeptSummary[] = list.map((d, idx) => {
          const s = (statsRes[idx] || {}) as any;
          return {
            id: String(d._id),
            name: d.name || d.code || "شعبہ",
            code: d.code,
            totalStudents: s.totalStudents || 0,
            totalTeachers: s.totalTeachers || 0,
            totalClasses: s.totalClasses || 0,
          };
        });
        setDeptStats(merged);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "ڈیپارٹمنٹ ڈیٹا لوڈ نہیں ہو سکا"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(() => {
    if (!deptStats.length) return { students: 0, teachers: 0, classes: 0 };
    const students = deptStats.reduce((s, d) => s + d.totalStudents, 0);
    const teachers = deptStats.reduce((s, d) => s + d.totalTeachers, 0);
    const classes = deptStats.reduce((s, d) => s + d.totalClasses, 0);
    return { students, teachers, classes };
  }, [deptStats]);

  const studentChart = useMemo(() => {
    if (!deptStats.length)
      return { labels: [] as string[], values: [] as number[] };
    return {
      labels: deptStats.map((d) => d.name),
      values: deptStats.map((d) => d.totalStudents || 0),
    };
  }, [deptStats]);

  const teacherChart = useMemo(() => {
    if (!deptStats.length)
      return { labels: [] as string[], values: [] as number[] };
    return {
      labels: deptStats.map((d) => d.name),
      values: deptStats.map((d) => d.totalTeachers || 0),
    };
  }, [deptStats]);

  const linkForDepartment = (d: DepartmentItem) => {
    const code = (d.code || "").toUpperCase();
    if (code === "HIFZ") return "/talba/hifz";
    if (code === "NIZAMI") return "/talba/nizami";
    if (code === "TAJWEED") return "/talba/tajweed";
    if (code === "WAFAQ") return "/talba/wafaq";
    return {
      pathname: "/talba/students",
      query: { dept: code || undefined },
    } as any;
  };

  const getDeptColor = (code?: string) => {
    const c = (code || "").toUpperCase();
    if (c === "HIFZ")
      return {
        bg: "from-emerald-50 to-teal-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        hover: "group-hover:from-emerald-100 group-hover:to-teal-100",
      };
    if (c === "NIZAMI")
      return {
        bg: "from-indigo-50 to-purple-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
        hover: "group-hover:from-indigo-100 group-hover:to-purple-100",
      };
    if (c === "TAJWEED")
      return {
        bg: "from-cyan-50 to-blue-50",
        border: "border-cyan-200",
        text: "text-cyan-700",
        badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
        hover: "group-hover:from-cyan-100 group-hover:to-blue-100",
      };
    if (c === "WAFAQ")
      return {
        bg: "from-amber-50 to-orange-50",
        border: "border-amber-200",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        hover: "group-hover:from-amber-100 group-hover:to-orange-100",
      };
    return {
      bg: "from-gray-50 to-slate-50",
      border: "border-gray-200",
      text: "text-gray-700",
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      hover: "group-hover:from-gray-100 group-hover:to-slate-100",
    };
  };

  return (
    <TalbaLayout>
      <div className="space-y-6" dir="rtl">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">تمام شعبہ جات</h1>
              <p className="text-purple-100 text-sm max-w-2xl">
                یہاں سے آپ تمام شعبہ جات کے طلبہ، کلاسز، سیکشنز، حاضری اور
                رپورٹس کو منظم کر سکتے ہیں۔
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

        {/* Department Cards */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-purple-600" />
            <span>شعبہ جات کی فہرست</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => {
              const colors = getDeptColor(dept.code);
              const stats = deptStats.find((s) => s.id === String(dept._id));
              return (
                <Link
                  key={dept._id}
                  href={linkForDepartment(dept)}
                  className={`group rounded-2xl bg-gradient-to-br ${colors.bg} border-2 ${colors.border} p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden`}
                >
                  {/* Hover Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.hover} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="relative space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {dept.name}
                        </h3>
                        {dept.code && (
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${colors.badge}`}
                          >
                            {dept.code}
                          </span>
                        )}
                      </div>
                      <ArrowLeft
                        className={`w-5 h-5 ${colors.text} group-hover:translate-x-1 transition-transform duration-300`}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 leading-relaxed min-h-[2.5rem]">
                      {dept.description || "طلبہ اور کلاسز کی مکمل مینجمنٹ"}
                    </p>

                    {/* Stats */}
                    {stats && (
                      <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {stats.totalStudents}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {stats.totalTeachers}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {stats.totalClasses}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    {dept.isActive === false && (
                      <span className="inline-block text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-600">
                        غیر فعال
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Empty State */}
            {departments.length === 0 && !loading && (
              <div className="col-span-full text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <FolderOpen className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-2">
                  ابھی تک کوئی شعبہ شامل نہیں کیا گیا
                </p>
                <p className="text-sm text-gray-400">
                  پہلے شعبہ جات کے سیکشن سے شعبے شامل کریں
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-gray-100 border-2 border-gray-200 p-6 animate-pulse"
                  >
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-16 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Overall Stats */}
        {deptStats.length > 0 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <span>مجموعی اعداد و شمار</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-green-100 rounded-full p-3">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">کل طلبہ</p>
                  <p className="text-3xl font-bold text-green-600">
                    {totals.students}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-blue-100 rounded-full p-3">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">کل اساتذہ</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totals.teachers}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-purple-100 rounded-full p-3">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">کل کلاسز</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {totals.classes}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {studentChart.labels.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 rounded-full p-2">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      شعبہ وار طلبہ کی تعداد
                    </h3>
                  </div>
                  <SimpleBarChart
                    title=""
                    labels={studentChart.labels}
                    values={studentChart.values}
                  />
                </div>
              )}
              {teacherChart.labels.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 rounded-full p-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      شعبہ وار اساتذہ کی تعداد
                    </h3>
                  </div>
                  <SimpleBarChart
                    title=""
                    labels={teacherChart.labels}
                    values={teacherChart.values}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </TalbaLayout>
  );
}
