import Link from "next/link";
import { useRouter } from "next/router";

export function HostelSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto custom-scrollbar scrollbar-none w-64 bg-saPrimary text-white px-4 py-6 hidden md:block text-right border-l border-white/5">
      <div className="mb-6 text-xl font-semibold text-secondary">ہاسٹل</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/hostel/hostels"
          className={`${
            router.pathname === "/hostel/hostels"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ہاسٹل
        </Link>
        <Link
          href="/hostel"
          className={`${
            router.pathname === "/hostel"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/hostel/rooms"
          className={`${
            router.pathname === "/hostel/rooms"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          کمرے
        </Link>
        <Link
          href="/hostel/residents"
          className={`${
            router.pathname === "/hostel/residents"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          ریذیڈنٹس
        </Link>
        <Link
          href="/hostel/allocations"
          className={`${
            router.pathname === "/hostel/allocations"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          بیڈ الوکیشن
        </Link>
        <Link
          href="/hostel/fees"
          className={`${
            router.pathname === "/hostel/fees"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          فیس
        </Link>
        <Link
          href="/hostel/expenses"
          className={`${
            router.pathname === "/hostel/expenses"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          اخراجات
        </Link>
        <Link
          href="/hostel/uniforms"
          className={`${
            router.pathname === "/hostel/uniforms"
              ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
              : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
          } flex items-center gap-3 px-4 py-2.5 transition-all duration-300`}
        >
          یونیفارم انوینٹری
        </Link>
      </nav>
    </aside>
  );
}
