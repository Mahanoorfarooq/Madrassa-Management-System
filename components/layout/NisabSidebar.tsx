import Link from "next/link";
import { useRouter } from "next/router";

export function NisabSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar w-64 bg-darkBg text-white p-4 hidden md:block text-right">
      <div className="mb-6 text-xl font-semibold text-secondary">نصاب</div>
      <nav className="space-y-2 text-sm">
        <Link
          href="/nisab"
          className={`block rounded px-3 py-2 transition ${router.pathname === "/nisab" ? "bg-primary" : "hover:bg-gray-700"
            }`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/nisab/syllabus"
          className={`block rounded px-3 py-2 transition ${router.pathname === "/nisab/syllabus"
              ? "bg-primary"
              : "hover:bg-gray-700"
            }`}
        >
          سلیبس
        </Link>
        <Link
          href="/nisab/dars"
          className={`block rounded px-3 py-2 transition ${router.pathname === "/nisab/dars"
              ? "bg-primary"
              : "hover:bg-gray-700"
            }`}
        >
          مضامین / دروس
        </Link>
        <Link
          href="/nisab/timetable"
          className={`block rounded px-3 py-2 transition ${router.pathname === "/nisab/timetable"
              ? "bg-primary"
              : "hover:bg-gray-700"
            }`}
        >
          ٹائم ٹیبل
        </Link>
        <Link
          href="/nisab/calendar"
          className={`block rounded px-3 py-2 transition ${router.pathname === "/nisab/calendar"
              ? "bg-primary"
              : "hover:bg-gray-700"
            }`}
        >
          اکیڈمک کیلنڈر
        </Link>
        <Link
          href="/nisab/exams"
          className={`block rounded px-3 py-2 transition ${router.pathname === "/nisab/exams"
              ? "bg-primary"
              : "hover:bg-gray-700"
            }`}
        >
          امتحانات
        </Link>
        <Link
          href="/nisab/results"
          className={`block rounded px-3 py-2 transition ${router.pathname === "/nisab/results"
              ? "bg-primary"
              : "hover:bg-gray-700"
            }`}
        >
          نتائج
        </Link>
      </nav>
    </aside>
  );
}
