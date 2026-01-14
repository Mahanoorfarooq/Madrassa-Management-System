import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AdminLayout({
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
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-lightBg">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="ایڈمن" roleLabel="انتظامیہ" onLogout={handleLogout} />
        <main className="p-4 space-y-4">
          {title && (
            <h1 className="text-xl font-semibold text-gray-800 text-right">
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
