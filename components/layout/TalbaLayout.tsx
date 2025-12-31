import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { TalbaSidebar } from "./TalbaSidebar";
import { Topbar } from "./Topbar";

interface TalbaLayoutProps {
  children: ReactNode;
  title?: string;
}

export function TalbaLayout({ children, title }: TalbaLayoutProps) {
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
    <div className="min-h-screen bg-lightBg">
      <TalbaSidebar />
      <div className="md:pr-64">
        <Topbar
          userName="ایڈمن"
          roleLabel="طلبہ ماڈیول"
          onLogout={handleLogout}
        />
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
