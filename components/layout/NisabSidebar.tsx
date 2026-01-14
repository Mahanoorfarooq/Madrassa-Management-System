import Link from "next/link";
import { useRouter } from "next/router";

export function NisabSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar w-64 bg-saPrimary text-white p-4 hidden md:block text-right border-l border-white/5">
      <div className="mb-6 text-xl font-semibold text-secondary">نصاب</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/nisab"
          className={`${
            router.pathname === "/nisab"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/nisab/syllabus"
          className={`${
            router.pathname === "/nisab/syllabus"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          سلیبس
        </Link>
        <Link
          href="/nisab/dars"
          className={`${
            router.pathname === "/nisab/dars"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          مضامین / دروس
        </Link>
        <Link
          href="/nisab/timetable"
          className={`${
            router.pathname === "/nisab/timetable"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ٹائم ٹیبل
        </Link>
        <Link
          href="/nisab/calendar"
          className={`${
            router.pathname === "/nisab/calendar"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          اکیڈمک کیلنڈر
        </Link>
        <Link
          href="/nisab/exams"
          className={`${
            router.pathname === "/nisab/exams"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          امتحانات
        </Link>
        <Link
          href="/nisab/results"
          className={`${
            router.pathname === "/nisab/results"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          نتائج
        </Link>
      </nav>
    </aside>
  );
}
