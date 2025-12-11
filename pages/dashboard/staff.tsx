import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/Table";

const mockTasks = [
  { id: 1, duty: "ہاسٹل صفائی", status: "جاری", shift: "صبح" },
  { id: 2, duty: "میس میں ناشتے کی تیاری", status: "مکمل", shift: "صبح" },
];

export default function StaffDashboard() {
  return (
    <div className="flex min-h-screen bg-lightBg">
      <Sidebar role="staff" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="اسٹاف" roleLabel="سپورٹ اسٹاف" />
        <main className="p-4 space-y-4">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            ڈیوٹیز اور حاضری
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="آج کی ڈیوٹیز" value={6} />
            <StatCard title="مکمل شدہ ڈیوٹیز" value={4} />
            <StatCard title="باقی ڈیوٹیز" value={2} />
          </div>
          <DataTable
            columns={[
              { key: "duty", header: "ڈیوٹی" },
              { key: "status", header: "حالت" },
              { key: "shift", header: "شفٹ" },
            ]}
            data={mockTasks}
          />
        </main>
      </div>
    </div>
  );
}
