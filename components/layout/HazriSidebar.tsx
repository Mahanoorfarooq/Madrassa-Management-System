import Link from "next/link";
import { useRouter } from "next/router";

export function HazriSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-6 hidden md:block text-right">
      <div className="mb-6 text-xl font-semibold text-secondary">حاضری</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/hazri"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/hazri/students"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri/students"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          طلبہ
        </Link>
        <Link
          href="/hazri/teacher"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri/teacher"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          اساتذہ
        </Link>
        <Link
          href="/hazri/staff"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri/staff"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          عملہ
        </Link>
        <Link
          href="/hazri/oversight"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri/oversight"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          نگرانی
        </Link>
      </nav>
    </aside>
  );
}
