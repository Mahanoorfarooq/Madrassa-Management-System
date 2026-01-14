import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { Topbar } from "@/components/layout/Topbar";
import { NisabSidebar } from "@/components/layout/NisabSidebar";

export function NisabLayout({
  title,
  children,
}: {
  title: string;
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
    <div className="min-h-screen bg-gray-50">
      {/* Fixed sidebar on the right */}
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30">
        <NisabSidebar />
      </div>
      {/* Content shifted to the left of the fixed sidebar */}
      <div className="md:pr-64">
        <Topbar roleLabel="نصاب" onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-3 py-4">{children}</main>
      </div>
    </div>
  );
}
