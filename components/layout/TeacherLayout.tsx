import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Topbar } from "@/components/layout/Topbar";

export function TeacherLayout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("madrassa_token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("madrassa_token");
    }
    router.push("/");
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active =
      href === "/teacher"
        ? router.pathname === href
        : router.pathname === href || router.pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`block rounded-xl px-3 py-2.5 text-sm text-right transition-colors duration-200 text-touchWhite/90 ${
          active
            ? "bg-primary text-touchWhite shadow-md"
            : "hover:bg-brandForest/70"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-lightBg">
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30 bg-gradient-to-b from-brandForest via-brandTeal to-brandForest text-touchWhite px-4 py-6 overflow-y-auto scrollbar-none">
        <div className="mb-6 text-xl font-semibold text-touchWhite text-right">
          استاد پورٹل
        </div>
        <nav className="space-y-1 text-right text-sm">
          <NavLink href="/teacher" label="ڈیش بورڈ" />
          <NavLink href="/teacher/profile" label="میرا پروفائل" />
          <NavLink href="/teacher/classes" label="میری کلاسز اور سیکشنز" />
          <NavLink href="/teacher/attendance" label="حاضری" />
          <NavLink href="/teacher/my-attendance" label="میری حاضری" />
          <NavLink
            href="/teacher/attendance-edit-requests"
            label="حاضری ایڈٹ ریکویسٹ"
          />
          <NavLink href="/teacher/attendance-report" label="حاضری رپورٹ" />
          <NavLink href="/teacher/requests" label="طالب علم کی درخواستیں" />
          <NavLink href="/teacher/exams" label="امتحانات" />
          <NavLink href="/teacher/assignments" label="اسائنمنٹس" />
          <NavLink href="/teacher/timetable" label="ٹائم ٹیبل" />
          <NavLink href="/teacher/study-material" label="تعلیمی مواد" />
          <NavLink href="/teacher/discipline" label="ڈسپلن نوٹس" />
          <button
            onClick={handleLogout}
            className="w-full text-right mt-2 rounded px-3 py-2 text-sm text-red-400 hover:bg-red-950/40"
          >
            لاگ آؤٹ
          </button>
        </nav>
      </div>
      <div className="md:pr-64">
        <Topbar
          roleLabel="استاد"
          onLogout={handleLogout}
          showHomeLink={false}
        />
        <main className="max-w-7xl mx-auto px-3 py-4">
          {title && (
            <h1 className="text-xl font-semibold text-gray-800 text-right mb-3">
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
