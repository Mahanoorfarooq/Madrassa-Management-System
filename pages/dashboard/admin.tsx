import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/Table";
import { AttendanceChart } from "@/components/charts/AttendanceChart";

const mockStudents = [
  { id: 1, name: "احمد علی", class: "درجہ اول", attendance: "95%" },
  { id: 2, name: "محمد حسن", class: "درجہ دوم", attendance: "92%" },
];

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-lightBg">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="ایڈمن" roleLabel="پرنسپل" />
        <main className="p-4 space-y-4">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            جامعہ کا مجموعی جائزہ
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="کل طلبہ" value={1200} description="رجسٹرڈ" />
            <StatCard title="کل اساتذہ" value={45} />
            <StatCard title="اوسط حاضری" value="93%" />
            <StatCard title="بقیہ فیس" value="230,000" description="روپے" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
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
        </main>
      </div>
    </div>
  );
}
