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
    const token = localStorage.getItem("madrassa_token");
    if (!token) {
      router.replace("/login/nisab");
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
