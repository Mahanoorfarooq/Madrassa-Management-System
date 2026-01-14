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
    const hasLocal = !!localStorage.getItem("madrassa_token");
    const hasCookie = document.cookie
      .split("; ")
      .some((c) => c.startsWith("auth_token="));
    if (!hasLocal && !hasCookie) {
      const next = encodeURIComponent(router.asPath || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("madrassa_token");
      document.cookie =
        "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      // Best-effort server-side logout to clear httpOnly cookie if set
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
    router.push("/login");
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active =
      href === "/teacher"
        ? router.pathname === href
        : router.pathname === href || router.pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`${
          active
            ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
            : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
        } flex items-center gap-3 px-4 py-2.5 text-sm text-right transition-all duration-300`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-lightBg">
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30 bg-saPrimary text-white px-4 py-6 overflow-hidden border-l border-white/5">
        <div className="h-full overflow-y-auto scrollbar-none">
          <div className="mb-6 text-xl font-semibold text-secondary text-right">
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
              className="w-full text-right mt-2 rounded px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              لاگ آؤٹ
            </button>
          </nav>
        </div>
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
