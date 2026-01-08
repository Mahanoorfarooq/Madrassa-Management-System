"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Key,
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
      className={`${active
        ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
        : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
        } flex items-center gap-3 px-4 py-2.5 transition-all duration-300 text-sm md:text-base selection:bg-secondary/30`}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-secondary' : 'text-slate-500'}`} />
      <span className="font-urdu text-right leading-relaxed">{label}</span>
    </Link>
  );
}

export default function SASidebar() {
  const router = useRouter();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-saPrimary text-white p-4 flex flex-col border-l border-white/5">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 shrink-0">
            <Image
              src="/logo-new.png"
              alt="Logo"
              fill
              className="object-contain invert brightness-0"
            />
          </div>
          <div className="text-right">
            <h1 className="text-base font-bold text-secondary font-urdu leading-tight">سپر ایڈمن</h1>
            <p className="text-[10px] text-slate-400 font-urdu leading-tight">انتظامی پورٹل</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 flex-1 font-urdu">
        <NavItem
          href="/super-admin"
          label="ڈیش بورڈ"
          icon={LayoutDashboard}
          active={pathname === "/super-admin"}
        />
        <NavItem
          href="/super-admin/licenses"
          label="لائسنس مینجمنٹ"
          icon={Key}
          active={pathname.startsWith("/super-admin/licenses")}
        />
      </nav>

      {/* Logout Link */}
      <div className="mt-auto border-t border-white/10 pt-4 font-urdu">
        <Link
          href="/activate"
          className="text-slate-400 hover:text-white flex items-center gap-3 px-4 py-2 transition-all text-xs"
        >
          <div className="w-4 h-4">↩️</div>
          <span>واپس جائیں</span>
        </Link>
      </div>
    </aside>
  );
}
