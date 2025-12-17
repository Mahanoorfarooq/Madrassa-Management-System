import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Topbar } from "@/components/layout/Topbar";

export function MadrassaSettingsLayout({
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
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
    router.push("/modules/madrassa");
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active =
      router.pathname === href || router.pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`block rounded-xl px-3 py-2.5 text-sm text-right transition-colors duration-200 text-slate-200 ${
          active
            ? "bg-primary/90 text-white shadow-md"
            : "hover:bg-slate-800/80"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-lightBg">
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-6">
        <div className="mb-6 text-xl font-semibold text-secondary text-right">
          ایڈمن سیٹنگز
        </div>
        <nav className="space-y-1 text-right text-sm">
          <NavLink
            href="/modules/madrassa/settings/notifications"
            label="اعلانات"
          />
          <NavLink
            href="/modules/madrassa/settings/activity-logs"
            label="آڈٹ لاگز"
          />
          <NavLink
            href="/modules/madrassa/settings/users"
            label="یوزر مینجمنٹ"
          />
          <button
            onClick={handleLogout}
            className="w-full text-right mt-3 rounded px-3 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            لاگ آؤٹ
          </button>
        </nav>
      </div>
      <div className="md:pr-64">
        <Topbar roleLabel="ایڈمن سیٹنگز" onLogout={handleLogout} />
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
