import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import {
  Users,
  GraduationCap,
  DollarSign,
  Home,
  UtensilsCrossed,
  BookOpen,
  ClipboardCheck,
  Library,
  LogOut,
  ArrowLeft,
  MessageSquare,
  FileText,
} from "lucide-react";

const adminModules = [
  {
    key: "talba",
    title: "طلبہ",
    description: "داخلہ، پروفائل، حاضری اور مکمل طلبہ مینجمنٹ",
    href: "/talba",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    key: "usataza",
    title: "اساتذہ",
    description: "اساتذہ کی معلومات، کلاسز اور تفویضِ تدریس",
    href: "/usataza",
    icon: GraduationCap,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    key: "finance",
    title: "فنانس",
    description: "فیس، ادائیگیاں، وصولیاں اور مالی رپورٹس",
    href: "/finance",
    icon: DollarSign,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    key: "hostel",
    title: "ہاسٹل",
    description: "ہاسٹل رجسٹریشن، کمرے اور رہائش کا نظم",
    href: "/hostel",
    icon: Home,
    gradient: "from-orange-500 to-red-500",
  },
  {
    key: "mess",
    title: "میس",
    description: "کھانے کا شیڈول، رجسٹریشن اور اخراجات",
    href: "/mess",
    icon: UtensilsCrossed,
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    key: "nisab",
    title: "نصاب",
    description: "نصاب، درجات، کتابیں اور درسی شیڈول",
    href: "/nisab",
    icon: BookOpen,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    key: "hazri",
    title: "حاضری",
    description: "طلبہ و اساتذہ حاضری کے لئے مرکزی ڈیش بورڈ",
    href: "/hazri",
    icon: ClipboardCheck,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    key: "exams",
    title: "امتحانات",
    description: "امتحانات، نتائج اور رول نمبر سلپس",
    href: "/exams",
    icon: FileText,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    key: "library",
    title: "لائبریری",
    description: "کتب، اجراء، واپسی اور جرمانہ مینجمنٹ",
    href: "/library",
    icon: Library,
    gradient: "from-rose-500 to-pink-500",
  },
  {
    key: "tickets",
    title: "شکایات / ٹکٹس",
    description: "طلبہ کی شکایات، ٹکٹس اور سٹیٹس ٹریکنگ",
    href: "/admin/tickets",
    icon: MessageSquare,
    gradient: "from-slate-500 to-slate-700",
  },
  {
    key: "notifications",
    title: "اعلانات / نوٹیفیکیشنز",
    description: "اعلانات اور سسٹم نوٹیفیکیشنز کا مرکزی پینل",
    href: "/modules/madrassa/settings/notifications",
    icon: MessageSquare,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    key: "auditLogs",
    title: "آڈٹ لاگز",
    description: "سسٹم میں ہونے والی سرگرمی اور approvals کی ہسٹری",
    href: "/modules/madrassa/settings/activity-logs",
    icon: ClipboardCheck,
    gradient: "from-emerald-500 to-cyan-600",
  },
  {
    key: "userManagement",
    title: "یوزر مینجمنٹ",
    description: "سسٹم یوزرز اور رولز، مزید admin اکاؤنٹس بنائیں",
    href: "/modules/madrassa/settings/users",
    icon: Users,
    gradient: "from-fuchsia-500 to-pink-600",
  },
];

export default function MadrassaModules() {
  const [role, setRole] = useState<string | null>(null);
  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // First check localStorage for fast initial load
        const stored = localStorage.getItem("allowed_modules");
        if (stored) {
          try {
            setAllowedModules(JSON.parse(stored));
          } catch (e) { }
        }

        const res = await api.get("/api/auth/me");
        const r = res.data?.user?.role as string | undefined;
        const serverModules = res.data?.allowedModules;

        setRole(r || null);

        // Update from server and sync to localStorage
        if (serverModules) {
          setAllowedModules(serverModules);
          localStorage.setItem("allowed_modules", JSON.stringify(serverModules));
        }

        if (r && r !== "admin") {
          window.location.href = "/teacher";
        }
      } catch (e: any) {
        console.error("Auth failed:", e);
        if (e.response?.status === 402) {
          localStorage.removeItem("allowed_modules");
          window.location.href = "/activate";
        } else {
          window.location.href = "/login";
        }
      }
    })();
  }, []);

  const hasModule = (name: string) => {
    return allowedModules.some(m =>
      m === name ||
      m === name + " پورٹل" ||
      m.includes(name) ||
      (name === "طلباء" && m.includes("طلبہ"))
    );
  };

  const filteredModules = adminModules.filter(m => {
    if (allowedModules.includes("all")) return true;

    if (m.key === "talba") return hasModule("طلباء") || hasModule("طلبہ");
    if (m.key === "usataza") return hasModule("اساتذہ");
    if (m.key === "finance") return hasModule("فنانس");
    if (m.key === "hostel") return hasModule("ہاسٹل");
    if (m.key === "mess") return hasModule("میس");
    if (m.key === "nisab") return hasModule("نصاب");
    if (m.key === "hazri") return hasModule("حاضری") || hasModule("اساتذہ") || hasModule("طلباء");
    if (m.key === "library") return hasModule("لائبریری");
    if (m.key === "exams") return hasModule("امتحانات");
    if (m.key === "tickets") return hasModule("شکایات");
    if (m.key === "notifications") return hasModule("اعلانات") || hasModule("نوٹیفیکیشنز");
    if (m.key === "auditLogs") return hasModule("آڈٹ لاگز") || hasModule("لاگز");
    if (m.key === "userManagement") return hasModule("یوزر مینجمنٹ") || hasModule("یوزر");

    return false;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 font-urdu">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <header className="relative w-full border-b bg-white/90 backdrop-blur-xl shadow-sm font-urdu">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <span className="text-2xl">🕌</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                جامعہ مینجمنٹ سسٹم
              </span>
              <span className="text-xs text-gray-500">
                تمام انتظامی ماڈیولز ایک ہی جگہ
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ہوم</span>
            </Link>
            <button
              onClick={() => {
                window.location.href = "/login/admin";
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
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-3xl font-bold text-gray-800 mb-3">
              سسٹم کے اہم ماڈیولز
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              طلبہ، اساتذہ، مالیات، ہاسٹل، میس، نصاب، حاضری اور لائبریری کے لئے
              الگ الگ ڈیش بورڈز
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredModules.map((m, index) => {
              const IconComponent = m.icon;
              const isTickets = m.key === "tickets";
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
                    {isTickets && (
                      <div className="mt-3 text-xs text-gray-500">
                        تفصیل دیکھنے کے لیے کھولیں
                      </div>
                    )}
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
