import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Award,
  BookOpen,
  Users,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function StudentHome() {
  const [student, setStudent] = useState<any>(null);
  const [dash, setDash] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/students/me");
        setStudent(res.data?.student || null);
        const d = await api.get("/api/student/dashboard");
        setDash(d.data || null);
      } catch {
      } 
    };
    load();
  }, []);


  if (!student) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">طالب علم کا ریکارڈ نہیں ملا۔</div>
        </div>
      </StudentLayout>
    );
  }

  const attendanceDays = dash?.attendanceSummary?.last7Days || [];
  const monthlyPercent = dash?.attendanceSummary?.monthlyPercent ?? 0;
  const todaySchedule = dash?.todaySchedule || [];
  const notices = dash?.notices || [];

  return (
    <StudentLayout>
      <div className="p-6 max-w-7xl mx-auto" dir="rtl">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg mb-6">
          <h1 className="text-2xl font-bold mb-2">
            خوش آمدید، {student.fullName}
          </h1>
          <p className="text-blue-100 text-sm">
            یہاں سے آپ اپنی حاضری، کلاسز، امتحانات، فیس اور ہاسٹل سے متعلق تمام
            معلومات دیکھ سکتے ہیں
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Attendance */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {monthlyPercent}%
            </div>
            <div className="text-sm text-gray-600">اوسط حاضری</div>
            <div className="text-xs text-gray-500 mt-1">اس ماہ</div>
          </div>

          {/* Today Classes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {todaySchedule.length}
            </div>
            <div className="text-sm text-gray-600">آج کی کلاسز</div>
            <div className="text-xs text-gray-500 mt-1">کلاسز/حلقات</div>
          </div>

          {/* Fee Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800 mb-1">
              {dash?.feeStatus?.status || "—"}
            </div>
            <div className="text-sm text-gray-600">فیس کی صورتحال</div>
            {dash?.feeStatus?.dueDate && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(dash.feeStatus.dueDate).toLocaleDateString("ur-PK")}
              </div>
            )}
          </div>

          {/* Latest Grade */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {dash?.resultHighlight?.grade || "—"}
            </div>
            <div className="text-sm text-gray-600">تازہ ترین گریڈ</div>
            {dash?.resultHighlight?.exam && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                {dash.resultHighlight.exam.title}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Today Schedule */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">آج کا شیڈول</h3>
            </div>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                آج کے لیے کوئی کلاس/حلَْقہ نہیں۔
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((s: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {s.subject || "مضمون"}
                        </div>
                        <div className="text-xs text-gray-600">
                          {s.teacher || "استاد"}
                        </div>
                      </div>
                    </div>
                    {s.time && (
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.time}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-800">حاضری خلاصہ</h3>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              ماہانہ فیصد:{" "}
              <span className="font-bold text-gray-800">{monthlyPercent}%</span>
            </div>
            <div className="flex justify-between gap-1">
              {attendanceDays.length === 0 ? (
                <div className="text-xs text-gray-500 text-center w-full py-4">
                  کوئی ڈیٹا نہیں
                </div>
              ) : (
                attendanceDays.map((d: any, i: number) => {
                  const status = d.status === "—" ? "—" : d.status;
                  let bgColor = "bg-gray-200";
                  let icon = null;

                  if (status === "Present") {
                    bgColor = "bg-emerald-500";
                    icon = <CheckCircle className="w-3 h-3 text-white" />;
                  } else if (status === "Absent") {
                    bgColor = "bg-red-500";
                    icon = <XCircle className="w-3 h-3 text-white" />;
                  } else if (status === "Leave") {
                    bgColor = "bg-amber-500";
                    icon = <AlertCircle className="w-3 h-3 text-white" />;
                  }

                  return (
                    <div
                      key={i}
                      className={`flex-1 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
                      title={status}
                    >
                      {icon}
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span className="text-gray-600">حاضر</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">غائب</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span className="text-gray-600">رخصت</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notices and Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notices */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Bell className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-800">نوٹس</h3>
            </div>
            {notices.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                ابھی کوئی نوٹس دستیاب نہیں۔
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notices.slice(0, 5).map((n: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-semibold text-gray-800 text-sm">
                        {n.title}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString("ur-PK")}
                      </div>
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      {n.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-800">فوری رسائی</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/student/profile"
                className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-blue-600">
                  پروفائل
                </div>
                <div className="text-xs text-gray-600">تفصیلات دیکھیں</div>
              </Link>
              <Link
                href="/student/attendance"
                className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-emerald-600">
                  حاضری
                </div>
                <div className="text-xs text-gray-600">ریکارڈ دیکھیں</div>
              </Link>
              <Link
                href="/student/exams"
                className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-all group"
              >
                <div className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-purple-600">
                  امتحانات
                </div>
                <div className="text-xs text-gray-600">نتائج دیکھیں</div>
              </Link>
              <Link
                href="/student/fee"
                className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-all group"
              >
                <div className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-orange-600">
                  فیس
                </div>
                <div className="text-xs text-gray-600">ادائیگی دیکھیں</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
