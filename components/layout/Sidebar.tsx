import Link from "next/link";
import { useRouter } from "next/router";

interface SidebarProps {
  role: "admin" | "teacher" | "staff" | "student";
}

const roleLinks: Record<string, { href: string; label: string }[]> = {
  admin: [
    { href: "/dashboard/admin", label: "ڈیش بورڈ" },
    { href: "/students", label: "طلبہ" },
    { href: "/teachers", label: "اساتذہ" },
    { href: "/hostel", label: "ہاسٹل" },
    { href: "/fees", label: "فیس اور مالیات" },
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "ڈیش بورڈ" },
    { href: "/attendance", label: "حاضری" },
    { href: "/exams", label: "امتحانات" },
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
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const links = roleLinks[role] || [];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-6 border-l border-slate-800/80 shadow-inner flex flex-col">
      <div className="mb-6 text-xl font-semibold text-secondary text-right">
        مدرسہ مینجمنٹ
      </div>
      <nav className="space-y-1 text-right text-sm">
        {links.map((link) => {
          const active = router.pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 text-xs md:text-sm ${
                active
                  ? "bg-primary/90 text-white shadow-md"
                  : "hover:bg-slate-800/80 text-slate-200"
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
