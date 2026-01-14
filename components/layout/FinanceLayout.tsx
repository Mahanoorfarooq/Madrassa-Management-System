import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { FinanceSidebar } from "./FinanceSidebar";
import { Topbar } from "@/components/layout/Topbar";

interface FinanceLayoutProps {
  children: ReactNode;
  title?: string;
}

export function FinanceLayout({ children, title }: FinanceLayoutProps) {
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
    <div className="min-h-screen bg-lightBg">
      {/* Fixed sidebar on the right */}
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30">
        <FinanceSidebar />
      </div>
      {/* Content shifted to the left of the fixed sidebar */}
      <div className="md:pr-64">
        <Topbar userName="اسٹاف" roleLabel="فنانس" onLogout={handleLogout} />
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
