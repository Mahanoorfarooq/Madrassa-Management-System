import Link from "next/link";
import { useRouter } from "next/router";

export function HostelSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-6 hidden md:block text-right">
      <div className="mb-6 text-xl font-semibold text-secondary">ہاسٹل</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/hostel/hostels"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/hostels"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          ہاسٹل
        </Link>
        <Link
          href="/hostel"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel" ? "bg-primary" : "hover:bg-gray-700"
          }`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/hostel/rooms"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/rooms"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          کمرے
        </Link>
        <Link
          href="/hostel/residents"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/residents"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          ریذیڈنٹس
        </Link>
        <Link
          href="/hostel/allocations"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/allocations"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          بیڈ الوکیشن
        </Link>
        <Link
          href="/hostel/fees"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/fees"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          فیس
        </Link>
        <Link
          href="/hostel/expenses"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/expenses"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          اخراجات
        </Link>
        <Link
          href="/hostel/uniforms"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/uniforms"
              ? "bg-primary/90 text-white shadow-md"
              : "hover:bg-slate-800/80 text-slate-200"
          }`}
        >
          یونیفارم انوینٹری
        </Link>
      </nav>
    </aside>
  );
}
