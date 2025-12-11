import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { User, BookOpen, ClipboardCheck, LogOut, Home } from "lucide-react";

const teacherCards = [
  {
    key: "profile",
    title: "میرا پروفائل",
    description: "ذاتی معلومات دیکھیں",
    href: "/teacher/profile",
    icon: User,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    key: "classes",
    title: "کلاسز و سیکشنز",
    description: "تفویض شدہ کلاسز دیکھیں",
    href: "/teacher/classes",
    icon: BookOpen,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    key: "attendance",
    title: "حاضری",
    description: "لیکچر/تاریخ کے حساب سے حاضری",
    href: "/teacher/attendance",
    icon: ClipboardCheck,
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function TeacherModules() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/auth/me");
        const r = res.data?.user?.role as string | undefined;
        setRole(r || null);
        if (r && r !== "teacher") {
          window.location.href = "/modules/madrassa";
        }
      } catch {
        window.location.href = "/login";
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <header className="relative w-full border-b bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-md font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                استاد ماڈیول
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>ہوم</span>
            </Link>
            <button
              onClick={() => {
                // Add logout logic here
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>لاگ آؤٹ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl mx-auto mb-4 animate-pulse">
                <span className="text-3xl">📚</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-3xl font-bold text-gray-800 mb-3">
              استاد ماڈیول
            </h1>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {teacherCards.map((m, index) => {
              const IconComponent = m.icon;
              return (
                <Link
                  key={m.key}
                  href={m.href}
                  className="group relative h-full rounded-2xl bg-white border border-gray-200 p-6 flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                    opacity: 0,
                  }}
                >
                  {/* Gradient Background Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  ></div>

                  {/* Decorative Corner */}
                  <div
                    className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-br ${m.gradient} opacity-10 rounded-br-full`}
                  ></div>

                  {/* Icon */}
                  <div className="relative mb-4 flex justify-end">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative mb-6 text-right flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                      {m.title}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  {/* Button */}
                  <div className="relative flex justify-end">
                    <span
                      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${m.gradient} px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all group-hover:shadow-xl group-hover:scale-105 active:scale-95`}
                    >
                      کھولیں
                      <svg
                        className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
