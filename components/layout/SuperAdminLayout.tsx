import SASidebar from "@/components/super-admin/SASidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen bg-slate-50 font-urdu"
    >
      <SASidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
