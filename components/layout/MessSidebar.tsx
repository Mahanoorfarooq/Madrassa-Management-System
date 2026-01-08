import Link from "next/link";
import { useRouter } from "next/router";

export function MessSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar w-64 bg-darkBg text-white px-4 py-6 hidden md:block text-right">
      <div className="mb-6 text-xl font-semibold text-secondary">میس</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/mess"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${router.pathname === "/mess"
            ? "bg-primary/90 text-white shadow-md"
            : "hover:bg-slate-800/80 text-slate-200"
            }`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/mess/kitchens"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${router.pathname === "/mess/kitchens"
            ? "bg-primary/90 text-white shadow-md"
            : "hover:bg-slate-800/80 text-slate-200"
            }`}
        >
          کچن
        </Link>
        <Link
          href="/mess/registrations"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${router.pathname === "/mess/registrations"
            ? "bg-primary/90 text-white shadow-md"
            : "hover:bg-slate-800/80 text-slate-200"
            }`}
        >
          رجسٹریشن
        </Link>
        <Link
          href="/mess/schedules"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${router.pathname === "/mess/schedules"
            ? "bg-primary/90 text-white shadow-md"
            : "hover:bg-slate-800/80 text-slate-200"
            }`}
        >
          ہفتہ وار شیڈول
        </Link>
        <Link
          href="/mess/records"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${router.pathname === "/mess/records"
            ? "bg-primary/90 text-white shadow-md"
            : "hover:bg-slate-800/80 text-slate-200"
            }`}
        >
          ریکارڈ/اخراجات
        </Link>
      </nav>
    </aside>
  );
}
