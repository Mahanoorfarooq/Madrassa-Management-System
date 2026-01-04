import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { UsatazaSidebar } from "./UsatazaSidebar";
import { Topbar } from "./Topbar";

interface UsatazaLayoutProps {
  children: ReactNode;
  title?: string;
}

export function UsatazaLayout({ children, title }: UsatazaLayoutProps) {
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
      <UsatazaSidebar />
      <div className="flex-1 flex flex-col">
        <Topbar
          userName="ایڈمن"
          roleLabel="اساتذہ ماڈیول"
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
