import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { Users, GraduationCap, ClipboardCheck, BookOpen } from "lucide-react";

export default function HazriDashboard() {
  const [today, setToday] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [s, t, st] = await Promise.all([
        api.get("/api/attendance", { params: { from: today, to: today } }),
        api.get("/api/hazri/teacher", { params: { from: today, to: today } }),
        api.get("/api/hazri/staff", { params: { from: today, to: today } }),
      ]);
      setStudentCount((s.data?.attendance || []).length);
      setTeacherCount((t.data?.attendance || []).length);
      setStaffCount((st.data?.attendance || []).length);
    };
    load();
  }, [today]);

  return (
    <HazriLayout title="حاضری ڈیش بورڈ">
      <div className="space-y-4" dir="rtl">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-gray-600 text-right">
            <div>
              آج یا کسی بھی منتخب تاریخ کے لیے طلبہ، اساتذہ اور عملہ کی حاضری کا
              خلاصہ۔
            </div>
          </div>
          <input
            type="date"
            value={today}
            onChange={(e) => setToday(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-primary/60 focus:border-primary/50 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="طلبہ (آج نشان زد)"
            value={studentCount}
            icon={<Users className="w-4 h-4" />}
          />
          <StatCard
            title="اساتذہ (آج نشان زد)"
            value={teacherCount}
            icon={<GraduationCap className="w-4 h-4" />}
          />
          <StatCard
            title="عملہ (آج نشان زد)"
            value={staffCount}
            icon={<ClipboardCheck className="w-4 h-4" />}
          />
          <StatCard
            title="کل ریکارڈ (آج)"
            value={studentCount + teacherCount + staffCount}
            icon={<BookOpen className="w-4 h-4" />}
          />
        </div>

        <SimpleBarChart
          title="گروپ وار حاضری کا خلاصہ (آج)"
          labels={["طلبہ", "اساتذہ", "عملہ"]}
          values={[studentCount, teacherCount, staffCount]}
        />
      </div>
    </HazriLayout>
  );
}
