import Link from "next/link";
import { useRouter } from "next/router";

export function HazriSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none w-64 bg-gradient-to-b from-brandForest via-brandTeal to-brandForest text-touchWhite px-4 py-6 hidden md:block text-right">
      <div className="mb-6 text-xl font-semibold text-touchWhite">حاضری</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/hazri"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/hazri/students"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri/students"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          طلبہ
        </Link>
        <Link
          href="/hazri/teacher"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri/teacher"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          اساتذہ
        </Link>
        <Link
          href="/hazri/staff"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri/staff"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          عملہ
        </Link>
        <Link
          href="/hazri/oversight"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/hazri/oversight"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          نگرانی
        </Link>
      </nav>
    </aside>
  );
}
