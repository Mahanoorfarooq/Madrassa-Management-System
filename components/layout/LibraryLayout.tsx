import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { LibrarySidebar } from "./LibrarySidebar";
import { Topbar } from "./Topbar";

interface LibraryLayoutProps {
  children: ReactNode;
  title?: string;
}

export function LibraryLayout({ children, title }: LibraryLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("madrassa_token");
    if (!token) {
      router.replace("/login/library");
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
      {/* Fixed sidebar on the right */}
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-30">
        <LibrarySidebar />
      </div>
      {/* Content shifted to the left of the fixed sidebar */}
      <div className="md:pr-64">
        <Topbar userName="اسٹاف" roleLabel="لائبریری" onLogout={handleLogout} />
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
