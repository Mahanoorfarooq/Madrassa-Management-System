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
      router.replace("/login/usataza"); // reuse teacher login if separate not present
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("madrassa_token");
    }
    router.push("/");
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className="block rounded px-3 py-2 text-sm text-right hover:bg-gray-100"
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-lightBg">
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30 bg-white border-l">
        <div className="p-4 text-right text-primary font-bold">استاد پورٹل</div>
        <nav className="px-2 space-y-1 text-right">
          <NavLink href="/teacher" label="ڈیش بورڈ" />
          <NavLink href="/teacher/profile" label="میرا پروفائل" />
          <NavLink href="/teacher/classes" label="میری کلاسز اور سیکشنز" />
          <NavLink href="/teacher/attendance" label="حاضری" />
          <button
            onClick={handleLogout}
            className="w-full text-right mt-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            لاگ آؤٹ
          </button>
        </nav>
      </div>
      <div className="md:pr-64">
        <Topbar roleLabel="استاد" onLogout={handleLogout} />
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
