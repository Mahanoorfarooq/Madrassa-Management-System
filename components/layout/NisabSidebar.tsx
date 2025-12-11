import Link from "next/link";
import { useRouter } from "next/router";

export function NisabSidebar() {
  const router = useRouter();
  return (
    <aside className="w-64 bg-darkBg text-white min-h-screen p-4 hidden md:block text-right">
      <div className="mb-6 text-xl font-semibold text-secondary">نصاب</div>
      <nav className="space-y-2 text-sm">
        <Link
          href="/nisab"
          className={`block rounded px-3 py-2 transition ${
            router.pathname === "/nisab" ? "bg-primary" : "hover:bg-gray-700"
          }`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/nisab/syllabus"
          className={`block rounded px-3 py-2 transition ${
            router.pathname === "/nisab/syllabus"
              ? "bg-primary"
              : "hover:bg-gray-700"
          }`}
        >
          سلیبس
        </Link>
        <Link
          href="/nisab/exams"
          className={`block rounded px-3 py-2 transition ${
            router.pathname === "/nisab/exams"
              ? "bg-primary"
              : "hover:bg-gray-700"
          }`}
        >
          امتحانات
        </Link>
        <Link
          href="/nisab/results"
          className={`block rounded px-3 py-2 transition ${
            router.pathname === "/nisab/results"
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
