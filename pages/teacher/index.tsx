import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { StatCard } from "@/components/ui/Card";

export default function TeacherDashboard() {
  const [me, setMe] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [m, c] = await Promise.all([
        api.get("/api/teacher/me"),
        api.get("/api/teacher/classes"),
      ]);
      setMe(m.data || null);
      setClasses(c.data?.classes || []);
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const classCount = classes.length;
    const sectionCount = classes.reduce(
      (s, x: any) => s + (x.sections?.length || 0),
      0
    );
    return { classCount, sectionCount };
  }, [classes]);

  const quick = [
    { href: "/teacher/attendance", label: "حاضری لگائیں" },
    { href: "/teacher/classes", label: "میری کلاسز دیکھیں" },
  ];

  return (
    <TeacherLayout title="استاد ڈیش بورڈ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard title="کلاسز" value={metrics.classCount} />
        <StatCard title="سیکشنز" value={metrics.sectionCount} />
        <StatCard title="طلبہ" value="—" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quick.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="rounded-xl border border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/40 transition shadow-sm px-4 py-3 text-sm text-right flex items-center justify-between"
          >
            <span className="text-gray-800">{q.label}</span>
            <span className="text-primary text-xs">کھولیں</span>
          </Link>
        ))}
      </div>
    </TeacherLayout>
  );
}
