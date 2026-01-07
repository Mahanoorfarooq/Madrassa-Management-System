import Link from "next/link";
import { useRouter } from "next/router";

export function HostelSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none w-64 bg-gradient-to-b from-brandForest via-brandTeal to-brandForest text-touchWhite px-4 py-6 hidden md:block text-right">
      <div className="mb-6 text-xl font-semibold text-touchWhite">ہاسٹل</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/hostel/hostels"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/hostels"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          ہاسٹل
        </Link>
        <Link
          href="/hostel"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/hostel/rooms"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/rooms"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          کمرے
        </Link>
        <Link
          href="/hostel/residents"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/residents"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          ریذیڈنٹس
        </Link>
        <Link
          href="/hostel/allocations"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/allocations"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          بیڈ الوکیشن
        </Link>
        <Link
          href="/hostel/fees"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/fees"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          فیس
        </Link>
        <Link
          href="/hostel/expenses"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/expenses"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          اخراجات
        </Link>
        <Link
          href="/hostel/uniforms"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hostel/uniforms"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          یونیفارم انوینٹری
        </Link>
      </nav>
    </aside>
  );
}
