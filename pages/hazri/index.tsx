import { useEffect, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  Calendar,
} from "lucide-react";

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

  const cards = [
    {
      title: "طلبہ",
      subtitle: "آج حاضر شدہ طلبہ کی کل تعداد",
      value: studentCount,
      icon: <Users className="w-7 h-7" />,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "اساتذہ",
      subtitle: "آج حاضر شدہ اساتذہ کی کل تعداد",
      value: teacherCount,
      icon: <GraduationCap className="w-7 h-7" />,
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "عملہ",
      subtitle: "آج حاضر شدہ عملہ کی کل تعداد",
      value: staffCount,
      icon: <ClipboardCheck className="w-7 h-7" />,
      gradient: "from-teal-500 to-teal-600",
      bg: "bg-teal-50",
      iconBg: "bg-gradient-to-br from-teal-500 to-teal-600",
    },
    {
      title: "کل ریکارڈ",
      subtitle: "آج کی مجموعی حاضری کا ریکارڈ",
      value: studentCount + teacherCount + staffCount,
      icon: <BookOpen className="w-7 h-7" />,
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
  ];

  return (
    <HazriLayout title="حاضری ڈیش بورڈ">
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-8"
        dir="rtl"
      >
        <div className="mb-6">
          <div className="flex justify-end">
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-medium text-gray-700">تاریخ:</span>
              <input
                type="date"
                value={today}
                onChange={(e) => setToday(e.target.value)}
                className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-sky-200 focus:border-sky-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-right">
                  <h3 className="text-lg font-bold text-gray-800">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>

                <div className="bg-sky-100 text-sky-600 rounded-lg p-3">
                  {card.icon}
                </div>
              </div>

              <div className="text-3xl font-bold text-gray-900 text-right">
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <SimpleBarChart
            title="گروپ وار حاضری کا خلاصہ (آج)"
            labels={["طلبہ", "اساتذہ", "عملہ"]}
            values={[studentCount, teacherCount, staffCount]}
          />
        </div>
      </div>
    </HazriLayout>
  );
}
