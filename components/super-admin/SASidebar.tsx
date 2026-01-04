"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  FileClock,
  LogOut,
} from "lucide-react";

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: any;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-600 hover:bg-slate-50"
      } flex items-center gap-3 px-3 py-2 rounded-lg transition-colors`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default function SASidebar() {
  const router = useRouter();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  const doLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("madrassa_token");
      }
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      router.push("/login");
    }
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200 p-4 flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Super Admin</div>
          <span className="text-2xl">🕌</span>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        <NavItem
          href="/super-admin"
          label="ڈیش بورڈ"
          icon={LayoutDashboard}
          active={pathname === "/super-admin"}
        />
        <NavItem
          href="/super-admin/jamias"
          label="مدارس / جامعات"
          icon={Building2}
          active={pathname.startsWith("/super-admin/jamias")}
        />
        <NavItem
          href="/super-admin/admins"
          label="ایڈمن اکاؤنٹس"
          icon={Users}
          active={pathname.startsWith("/super-admin/admins")}
        />
        <NavItem
          href="/super-admin/settings"
          label="سسٹم سیٹنگز"
          icon={Settings}
          active={pathname.startsWith("/super-admin/settings")}
        />
        <NavItem
          href="/super-admin/audit-logs"
          label="آڈٹ لاگز"
          icon={FileClock}
          active={pathname.startsWith("/super-admin/audit-logs")}
        />
      </nav>

      <button
        onClick={doLogout}
        className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        <span className="text-sm">لاگ آؤٹ</span>
      </button>
    </aside>
  );
}
