import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { UsatazaLayout } from "@/components/layout/UsatazaLayout";
import {
  Users,
  UserPlus,
  BookOpen,
  ClipboardList,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

export default function UsatazaDashboard() {
  const [counts, setCounts] = useState({ teachers: 0, assignments: 0 });
  // loader removed per request

  useEffect(() => {
    const load = async () => {
      const tRes = await api.get("/api/teachers");
      const teachers = tRes.data?.teachers || [];
      const aRes = await api.get("/api/teaching-assignments");
      const assignments = aRes.data?.assignments || [];
      setCounts({
        teachers: teachers.length,
        assignments: assignments.length,
      });
    };
    load();
  }, []);

  const quickLinks = [
    {
      href: "/usataza/teachers",
      label: "اساتذہ کی فہرست",
      icon: Users,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      href: "/usataza/teachers/new",
      label: "نیا استاد شامل کریں",
      icon: UserPlus,
      color: "bg-emerald-500",
      hoverColor: "hover:bg-emerald-600",
    },
    {
      href: "/usataza/assignments",
      label: "تفویضِ تدریس",
      icon: ClipboardList,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
    },
  ];

  return (
    <UsatazaLayout>
      <div className="space-y-5" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">اساتذہ ڈیش بورڈ</h1>
              <p className="text-blue-100 text-xs">
                اساتذہ کی معلومات اور تفویضات کا خلاصہ
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">کل اساتذہ</p>
                <p className="text-3xl font-bold text-gray-800">
                  {counts.teachers}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">کل تفویضات</p>
                <p className="text-3xl font-bold text-gray-800">
                  {counts.assignments}
                </p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <ClipboardList className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            فوری رسائی
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${link.color} ${link.hoverColor} rounded-lg p-2.5 transition-colors`}
                    >
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {link.label}
                    </span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </UsatazaLayout>
  );
}
