import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Topbar } from "@/components/layout/Topbar";
import api from "@/utils/api";

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
    const hasLocal = !!localStorage.getItem("madrassa_token");
    const hasCookie = document.cookie
      .split("; ")
      .some((c) => c.startsWith("auth_token="));
    if (!hasLocal && !hasCookie) {
      const next = encodeURIComponent(router.asPath || "/");
      router.replace(`/login?next=${next}`);
      return;
    }
    // Optionally verify session, but don't loop/redirect here; middleware will enforce.
    // api.get("/api/auth/me").catch(() => {});
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("madrassa_token");
      document.cookie =
        "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
    router.push("/login");
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active =
      router.pathname === href || router.pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`block rounded-xl px-3 py-2.5 text-sm text-right transition-colors duration-200 text-slate-200 ${
          active
            ? "bg-secondary text-white shadow-md font-medium"
            : "hover:bg-white/10"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-lightBg">
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30 bg-darkBg text-white px-4 py-6 overflow-y-auto custom-scrollbar">
        <div className="mb-6 text-xl font-semibold text-secondary text-right">
          ایڈمن سیٹنگز
        </div>
        <nav className="space-y-1 text-right text-sm">
          {(() => {
            const links = [
              {
                href: "/modules/madrassa/settings/notifications",
                label: "اعلانات",
              },
              {
                href: "/modules/madrassa/settings/activity-logs",
                label: "آڈٹ لاگز",
              },
              {
                href: "/modules/madrassa/settings/users",
                label: "یوزر مینجمنٹ",
              },
            ];
            const current = links.find(
              (l) =>
                router.pathname === l.href ||
                router.pathname.startsWith(l.href + "/")
            );
            return current ? (
              <NavLink href={current.href} label={current.label} />
            ) : null;
          })()}
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
