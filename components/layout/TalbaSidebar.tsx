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
  { href: "/talba/document-requests", label: "دستاویزات درخواستیں" },
  { href: "/talba/reports", label: "رپورٹس" },
];

export function TalbaSidebar() {
  const router = useRouter();

  return (
    <aside className="hidden md:block fixed inset-y-0 right-0 w-64 z-30 bg-saPrimary text-white px-4 py-6 overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-none">
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
                className={`${
                  active
                    ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
                    : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
                } flex items-center gap-3 px-4 py-2.5 transition-all duration-300 text-sm md:text-base selection:bg-secondary/30`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
