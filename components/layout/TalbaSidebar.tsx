import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/talba", label: "ڈیش بورڈ" },
  { href: "/talba/students", label: "طالب علم سرچ" },
  { href: "/talba/hifz", label: "شعبہ حفظ القرآن" },
  { href: "/talba/nizami", label: "شعبہ درس نظامی" },
  { href: "/talba/tajweed", label: "شعبہ تجوید" },
  { href: "/talba/wafaq", label: "شعبہ وفاق المدارس" },
  { href: "/talba/departments", label: "شعبہ جات" },
  { href: "/talba/classes", label: "کلاس و سیکشن مینجمنٹ" },
  { href: "/talba/sections", label: "سیکشنز" },
  { href: "/talba/halaqah", label: "حلقہ (Halaqah)" },
  { href: "/talba/transport", label: "ٹرانسپورٹ روٹس" },
  { href: "/talba/teachers", label: "اساتذہ" },
  { href: "/talba/attendance", label: "حاضری" },
  { href: "/talba/syllabus", label: "نصاب" },
  { href: "/talba/reports", label: "رپورٹس" },
];

export function TalbaSidebar() {
  const router = useRouter();

  return (
    <aside className="hidden md:block fixed inset-y-0 right-0 w-64 z-30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-6 overflow-y-auto scrollbar-none">
      <div className="mb-6 text-xl font-semibold text-secondary text-right">
        طلبہ ماڈیول
      </div>
      <nav className="space-y-1 text-right text-sm">
        {links.map((link) => {
          const active = router.pathname === link.href;
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
