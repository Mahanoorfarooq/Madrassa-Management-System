import type { ReactNode } from "react";
import SASidebar from "@/components/super-admin/SASidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      <SASidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Super Admin</div>
            <div className="text-xs text-slate-500">SaaS Console</div>
          </div>
        </header>
        <main className="p-4 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
