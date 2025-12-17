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
