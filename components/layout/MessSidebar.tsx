import Link from "next/link";
import { useRouter } from "next/router";

export function MessSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar scrollbar-none w-64 bg-saPrimary text-white px-4 py-6 hidden md:block text-right border-l border-white/5">
      <div className="mb-6 text-xl font-semibold text-secondary">میس</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/mess"
          className={`${
            router.pathname === "/mess"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/mess/kitchens"
          className={`${
            router.pathname === "/mess/kitchens"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          کچن
        </Link>
        <Link
          href="/mess/registrations"
          className={`${
            router.pathname === "/mess/registrations"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          رجسٹریشن
        </Link>
        <Link
          href="/mess/schedules"
          className={`${
            router.pathname === "/mess/schedules"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ہفتہ وار شیڈول
        </Link>
        <Link
          href="/mess/records"
          className={`${
            router.pathname === "/mess/records"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ریکارڈ/اخراجات
        </Link>
      </nav>
    </aside>
  );
}
