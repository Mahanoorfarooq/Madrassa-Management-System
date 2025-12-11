import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { UsatazaLayout } from "@/components/layout/UsatazaLayout";
import { StatCard } from "@/components/ui/Card";

export default function UsatazaDashboard() {
  const [counts, setCounts] = useState({ teachers: 0, assignments: 0 });

  useEffect(() => {
    const load = async () => {
      // Count teachers
      const tRes = await api.get("/api/teachers");
      const teachers = tRes.data?.teachers || [];
      // Count assignments (all)
      const aRes = await api.get("/api/teaching-assignments");
      const assignments = aRes.data?.assignments || [];
      setCounts({ teachers: teachers.length, assignments: assignments.length });
    };
    load();
  }, []);

  const links = [
    { href: "/usataza/teachers", label: "اساتذہ کی فہرست" },
    { href: "/usataza/teachers/new", label: "نیا استاد شامل کریں" },
    { href: "/usataza/assignments", label: "تفویضِ تدریس" },
  ];

  return (
    <UsatazaLayout title="اساتذہ ڈیش بورڈ">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatCard title="کل اساتذہ" value={counts.teachers} />
        <StatCard title="کل تفویضات" value={counts.assignments} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/40 transition shadow-sm px-4 py-3 text-sm text-right flex items-center justify-between"
          >
            <span className="text-gray-800">{l.label}</span>
            <span className="text-primary text-xs">کھولیں</span>
          </Link>
        ))}
      </div>
    </UsatazaLayout>
  );
}
