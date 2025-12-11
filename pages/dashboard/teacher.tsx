import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/Table";

const mockClasses = [
  { id: 1, name: "درجہ اول", students: 35, todayAttendance: "94%" },
  { id: 2, name: "درجہ دوم", students: 32, todayAttendance: "91%" },
];

export default function TeacherDashboard() {
  return (
    <div className="flex min-h-screen bg-lightBg">
      <Sidebar role="teacher" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="استاد" roleLabel="استاد" />
        <main className="p-4 space-y-4">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            میری کلاسز اور حاضری
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="کل کلاسز" value={4} />
            <StatCard title="اوسط حاضری" value="92%" />
            <StatCard title="آنے والے امتحانات" value={3} />
          </div>
          <DataTable
            columns={[
              { key: "name", header: "کلاس / درجہ" },
              { key: "students", header: "طلبہ کی تعداد" },
              { key: "todayAttendance", header: "آج کی حاضری" },
            ]}
            data={mockClasses}
          />
        </main>
      </div>
    </div>
  );
}
