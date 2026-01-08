import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

interface SidebarProps {
  role: "admin" | "teacher" | "staff" | "student" | "mudeer" | "nazim";
}

const roleLinks: Record<string, { href: string; label: string }[]> = {
  admin: [
    { href: "/modules/madrassa", label: "ڈیش بورڈ" },
    { href: "/students", label: "طلبہ" },
    { href: "/teachers", label: "اساتذہ" },
    { href: "/hazri/teacher", label: "اساتذہ کی حاضری" },
    { href: "/hostel", label: "ہاسٹل" },
    { href: "/fees", label: "فیس اور مالیات" },
    { href: "/modules/madrassa/settings/notifications", label: "اعلانات" },
    {
      href: "/modules/madrassa/settings/activity-logs",
      label: "Activity Logs",
    },
  ],
  mudeer: [
    { href: "/mudeer", label: "مدیر ڈیش بورڈ" },
    { href: "/students", label: "طلبہ" },
    { href: "/teachers", label: "اساتذہ" },
    { href: "/fees", label: "فیس اور مالیات" },
    { href: "/talba", label: "طلبہ ماڈیول" },
    { href: "/modules/madrassa/settings/notifications", label: "اعلانات" },
  ],
  nazim: [
    { href: "/talba", label: "طلبہ ڈیش بورڈ" },
    { href: "/talba/students", label: "طالب علم سرچ" },
    { href: "/talba/attendance", label: "حاضری" },
    { href: "/talba/reports", label: "رپورٹس" },
    { href: "/modules/madrassa", label: "مین پورٹل" },
  ],
  teacher: [
    { href: "/teacher", label: "ڈیش بورڈ" },
    { href: "/attendance", label: "حاضری" },
    { href: "/teacher/exams", label: "امتحانات" },
    { href: "/teacher/assignments", label: "اسائنمنٹس" },
    { href: "/teacher/timetable", label: "ٹائم ٹیبل" },
    { href: "/teacher/study-material", label: "تعلیمی مواد" },
    { href: "/teacher/discipline", label: "ڈسپلن نوٹس" },
  ],
  staff: [
    { href: "/dashboard/staff", label: "ڈیش بورڈ" },
    { href: "/hostel", label: "ہاسٹل ڈیوٹیز" },
    { href: "/mess", label: "میس اور کچن" },
  ],
  student: [
    { href: "/dashboard/student", label: "میرا ڈیش بورڈ" },
    { href: "/results", label: "نتائج" },
    { href: "/certificates", label: "سرٹیفیکیٹس" },
    { href: "/student/assignments", label: "اسائنمنٹس" },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const rawLinks = roleLinks[role] || [];

  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("allowed_modules");
    if (stored) {
      try {
        setAllowedModules(JSON.parse(stored));
      } catch (e) { }
    }
  }, []);

  const links = rawLinks.filter(link => {
    if (allowedModules.includes("all")) return true;

    // Unified Mapping rules supporting both base names and portal suffixes
    const hasModule = (name: string) => {
      return allowedModules.some(m =>
        m === name ||
        m === name + " پورٹل" ||
        m.includes(name) ||
        (name === "طلباء" && m.includes("طلبہ"))
      );
    };

    if (link.href.includes("student") || link.href.includes("talba")) return hasModule("طلباء");
    if (link.href.includes("teacher") || link.href.includes("teachers") || link.href.includes("hazri")) return hasModule("اساتذہ");
    if (link.href.includes("fee") || link.href.includes("finance") || link.href.includes("invoice")) return hasModule("فنانس");
    if (link.href.includes("hostel")) return hasModule("ہاسٹل");
    if (link.href.includes("library") || link.href.includes("book")) return hasModule("لائبریری");
    if (link.href.includes("nisab") || link.href.includes("syllabus") || link.href.includes("curriculum")) return hasModule("نصاب");
    if (link.href.includes("exam")) return hasModule("امتحانات");
    if (link.href.includes("attendance") || link.href.includes("hazri")) return hasModule("حاضری") || hasModule("اساتذہ");
    if (link.href.includes("mess")) return hasModule("میس");
    if (link.href.includes("ticket")) return hasModule("شکایات");
    if (link.href.includes("notification")) return hasModule("اعلانات") || hasModule("نوٹیفیکیشنز");
    if (link.href.includes("activity-log")) return hasModule("آڈٹ لاگز") || hasModule("لاگز");
    if (link.href.includes("user")) return hasModule("یوزر مینجمنٹ") || hasModule("یوزر");
    if (link.href.includes("madrassa") || link.href.includes("jamia")) return hasModule("مدارس");

    // Allow core links like Dashboard
    if (link.href === "/modules/madrassa" || link.href === "/mudeer" || link.href === "/teacher") return true;

    return false;
  });
  const isAdminTickets =
    role === "admin" && router.pathname.startsWith("/admin/tickets");
  const filteredLinks = isAdminTickets
    ? [{ href: "/admin/tickets", label: "شکایات / ٹکٹس" }]
    : links;

  return (
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar relative z-30 w-64 bg-darkBg text-white px-4 py-6 border-l border-slate-800/80 shadow-inner flex flex-col">
      <div className="mb-6 text-xl font-semibold text-secondary text-right">
        مدرسہ مینجمنٹ
      </div>
      <nav className="space-y-1 text-right text-sm">
        {filteredLinks.map((link) => {
          const active = router.pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 text-xs md:text-sm ${active
                ? "bg-secondary text-white shadow-md font-medium"
                : "hover:bg-white/10 text-slate-200"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
