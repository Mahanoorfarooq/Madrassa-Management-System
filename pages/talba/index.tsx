import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { Users, GraduationCap, BookOpen } from "lucide-react";

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

  return (
    <TalbaLayout title="طلبہ کے شعبہ جات">
      <div className="space-y-4" dir="rtl">
        <p className="text-sm text-gray-600 max-w-2xl ml-auto text-right">
          یہاں سے آپ تمام شعبہ جات کے طلبہ، کلاسز، سیکشنز، حاضری اور رپورٹس کو
          منظم کر سکتے ہیں۔ جو بھی نیا شعبہ آپ شامل کریں گے، وہ خود بخود نیچے
          فہرست میں ظاہر ہو جائے گا۔
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <Link
              key={dept._id}
              href={linkForDepartment(dept)}
              className="group rounded-2xl bg-gradient-to-b from-emerald-50/80 to-white border border-emerald-100/70 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col text-right relative overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-l from-emerald-100/50 via-transparent to-emerald-50/80 transition-opacity" />
              <div className="relative space-y-2">
                <h2 className="text-base font-semibold text-gray-800 flex items-center justify-between gap-2">
                  <span>{dept.name}</span>
                  {dept.code && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 border border-emerald-100 text-emerald-700">
                      {dept.code}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed min-h-[2.5rem]">
                  {dept.description || "طلبہ اور کلاسز کی مکمل مینجمنٹ"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center justify-start text-[11px] font-semibold text-primary">
                    پورا ماڈیول کھولیں
                  </span>
                  {dept.isActive === false && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      غیر فعال
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {departments.length === 0 && !loading && (
            <div className="text-xs text-gray-400 text-right col-span-full">
              ابھی تک کوئی شعبہ شامل نہیں کیا گیا۔ پہلے شعبہ جات کے سیکشن سے
              شعبے شامل کریں۔
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-600 text-right max-w-2xl ml-auto">
            {error}
          </div>
        )}

        {deptStats.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="کل طلبہ"
                value={totals.students}
                icon={<Users className="w-4 h-4" />}
              />
              <StatCard
                title="کل اساتذہ"
                value={totals.teachers}
                icon={<GraduationCap className="w-4 h-4" />}
              />
              <StatCard
                title="کل کلاسز"
                value={totals.classes}
                icon={<BookOpen className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {studentChart.labels.length > 0 && (
                <SimpleBarChart
                  title="شعبہ وار طلبہ کی تعداد"
                  labels={studentChart.labels}
                  values={studentChart.values}
                />
              )}
              {teacherChart.labels.length > 0 && (
                <SimpleBarChart
                  title="شعبہ وار اساتذہ کی تعداد"
                  labels={teacherChart.labels}
                  values={teacherChart.values}
                />
              )}
            </div>
          </>
        )}
      </div>
    </TalbaLayout>
  );
}
