import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";

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
      <div className="flex items-center justify-end mb-4">
        <input
          type="date"
          value={today}
          onChange={(e) => setToday(e.target.value)}
          className="rounded border px-3 py-2 text-sm bg-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">طلبہ (آج نشان زد)</div>
          <div className="text-2xl font-bold">{studentCount}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">اساتذہ (آج نشان زد)</div>
          <div className="text-2xl font-bold">{teacherCount}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">عملہ (آج نشان زد)</div>
          <div className="text-2xl font-bold">{staffCount}</div>
        </div>
      </div>
    </HazriLayout>
  );
}
