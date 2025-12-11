import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/Table";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import api from "@/utils/api";

const mockStudents = [
  { id: 1, name: "احمد علی", class: "درجہ اول", attendance: "95%" },
  { id: 2, name: "محمد حسن", class: "درجہ دوم", attendance: "92%" },
];

interface DeptSummary {
  id: string;
  name: string;
  code?: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
}

export default function AdminDashboard() {
  const [departments, setDepartments] = useState<DeptSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const deptRes = await api.get("/api/departments");
        const list = (deptRes.data?.departments || []) as any[];
        const statsRes = await Promise.all(
          list.map((d) =>
            api
              .get("/api/departments/stats", {
                params: { departmentId: d._id },
              })
              .then((r) => r.data)
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
            attendanceRate: s.attendanceRate || 0,
          };
        });
        setDepartments(merged);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            "جامعہ کے اعداد و شمار لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(() => {
    if (!departments.length)
      return { students: 0, teachers: 0, classes: 0, attendance: 0 };
    const students = departments.reduce((s, d) => s + d.totalStudents, 0);
    const teachers = departments.reduce((s, d) => s + d.totalTeachers, 0);
    const classes = departments.reduce((s, d) => s + d.totalClasses, 0);
    const attendance = Math.round(
      departments.reduce((s, d) => s + d.attendanceRate, 0) / departments.length
    );
    return { students, teachers, classes, attendance };
  }, [departments]);

  const deptChart = useMemo(() => {
    if (!departments.length)
      return { labels: [] as string[], values: [] as number[] };
    const labels = departments.map((d) => d.name);
    const values = departments.map((d) => d.totalStudents || 0);
    return { labels, values };
  }, [departments]);

  return (
    <div className="flex min-h-screen bg-lightBg">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="ایڈمن" roleLabel="پرنسپل" />
        <main className="p-4 space-y-4">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            جامعہ کا مجموعی جائزہ
          </h1>

          {error && (
            <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="کل طلبہ"
              value={totals.students}
              description="رجسٹرڈ"
            />
            <StatCard title="کل اساتذہ" value={totals.teachers} />
            <StatCard
              title="کل کلاسز"
              value={totals.classes}
              description="تمام شعبہ جات"
            />
            <StatCard title="اوسط حاضری" value={`${totals.attendance}%`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <AttendanceChart
                labels={[
                  "محرم",
                  "صفر",
                  "ربیع الاول",
                  "ربیع الثانی",
                  "جمادی الاول",
                  "جمادی الثانی",
                ]}
                values={[92, 93, 94, 91, 95, 93]}
              />
              {deptChart.labels.length > 0 && (
                <SimpleBarChart
                  title="شعبہ وار طلبہ"
                  labels={deptChart.labels}
                  values={deptChart.values}
                />
              )}
            </div>
            <div>
              <DataTable
                columns={[
                  { key: "name", header: "نام طالب علم" },
                  { key: "class", header: "درجہ" },
                  { key: "attendance", header: "حاضری" },
                ]}
                data={mockStudents}
              />
            </div>
          </div>
          {loading && (
            <p className="text-xs text-gray-500 text-right">
              اعداد و شمار لوڈ ہو رہے ہیں…
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/modules/madrassa",
      permanent: false,
    },
  };
};
