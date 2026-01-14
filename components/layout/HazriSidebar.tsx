import Link from "next/link";
import { useRouter } from "next/router";

export function HazriSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar scrollbar-none w-64 bg-saPrimary text-white px-4 py-6 hidden md:block text-right border-l border-white/5">
      <div className="mb-6 text-xl font-semibold text-secondary">حاضری</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/hazri"
          className={`${
            router.pathname === "/hazri"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/hazri/students"
          className={`${
            router.pathname === "/hazri/students"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          طلبہ
        </Link>
        <Link
          href="/hazri/teacher"
          className={`${
            router.pathname === "/hazri/teacher"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          اساتذہ
        </Link>
        <Link
          href="/hazri/staff"
          className={`${
            router.pathname === "/hazri/staff"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          عملہ
        </Link>
        <Link
          href="/hazri/oversight"
          className={`${
            router.pathname === "/hazri/oversight"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          نگرانی
        </Link>
      </nav>
    </aside>
  );
}
