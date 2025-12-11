import Link from "next/link";
import { useEffect, useState } from "react";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { StatCard } from "@/components/ui/Card";
import api from "@/utils/api";

export default function WafaqDashboard() {
  const [totals, setTotals] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    const load = async () => {
      const deptRes = await api.get("/api/departments", {
        params: { code: "WAFAQ", ensure: "true" },
      });
      const dept = deptRes.data?.department;
      const params: any = dept?._id
        ? { departmentId: dept._id }
        : { code: "WAFAQ" };
      const res = await api.get("/api/departments/stats", { params });
      setTotals(res.data || {});
    };
    load();
  }, []);

  const stats = [
    { title: "کل طلبہ", value: totals.totalStudents },
    { title: "کل اساتذہ", value: totals.totalTeachers },
    { title: "کل کلاسز", value: totals.totalClasses },
    { title: "اوسط حاضری", value: `${totals.attendanceRate}%` },
  ];

  const quickLinks = [
    { href: "/talba/students?dept=WAFAQ", label: "نیا طالب علم شامل کریں" },
    { href: "/talba/teachers?dept=WAFAQ", label: "نیا استاد شامل کریں" },
    { href: "/talba/classes?dept=WAFAQ", label: "نئی کلاس بنائیں" },
    { href: "/talba/attendance?dept=WAFAQ", label: "آج کی حاضری لگائیں" },
  ];

  return (
    <TalbaLayout title="شعبہ وفاق المدارس ڈیش بورڈ">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col">
          <h2 className="text-base font-semibold text-gray-800 mb-3 text-right">
            فوری روابط
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-primary/5 hover:border-primary/40 transition shadow-sm px-4 py-3 text-sm text-right flex items-center justify-between"
              >
                <span className="text-gray-800">{link.label}</span>
                <span className="text-primary text-xs">کھولیں</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3 text-right">
            حاضری کا خلاصہ
          </h2>
          <p className="text-xs text-gray-500 text-right">
            حاضری کے گراف اور خلاصے یہاں بعد میں API کے ساتھ منسلک کیے جائیں گے۔
          </p>
        </div>
      </div>
    </TalbaLayout>
  );
}
