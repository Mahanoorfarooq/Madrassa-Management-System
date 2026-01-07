import Link from "next/link";
import { useRouter } from "next/router";

export function MessSidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none w-64 bg-gradient-to-b from-brandForest via-brandTeal to-brandForest text-touchWhite px-4 py-6 hidden md:block text-right">
      <div className="mb-6 text-xl font-semibold text-touchWhite">میس</div>
      <nav className="space-y-1 text-sm">
        <Link
          href="/mess"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/mess"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          ڈیش بورڈ
        </Link>
        <Link
          href="/mess/kitchens"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/mess/kitchens"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          کچن
        </Link>
        <Link
          href="/mess/registrations"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/mess/registrations"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          رجسٹریشن
        </Link>
        <Link
          href="/mess/schedules"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/mess/schedules"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          ہفتہ وار شیڈول
        </Link>
        <Link
          href="/mess/records"
          className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
            router.pathname === "/mess/records"
              ? "bg-primary text-touchWhite shadow-md"
              : "hover:bg-brandForest/70 text-touchWhite/90"
          }`}
        >
          ریکارڈ/اخراجات
        </Link>
      </nav>
    </aside>
  );
}
