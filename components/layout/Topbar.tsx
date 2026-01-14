import Link from "next/link";

interface TopbarProps {
  userName?: string;
  roleLabel?: string;
  onMenuClick?: () => void;
  onLogout?: () => void;
  showHomeLink?: boolean;
}

export function Topbar({
  userName = "مہمان صارف",
  roleLabel = "کردار",
  onMenuClick,
  onLogout,
  showHomeLink = true,
}: TopbarProps) {
  return (
    <header className="flex items-center justify-between bg-primary text-white border-b border-emerald-900/20 px-4 py-3 md:px-6 shadow-sm sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-medium text-white shadow-sm hover:bg-white/15 hover:shadow-md transition-all duration-200"
        >
          مينيو
        </button>
        <div className="hidden md:flex items-center gap-3 text-white">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-white tracking-wide">
              جامعہ مینجمنٹ سسٹم
            </span>
            <span className="text-[11px] text-white/80 font-medium">
              منظم اور خوبصورت ڈیش بورڈ
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs md:text-sm">
        {showHomeLink && (
          <Link
            href="/modules/madrassa"
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-medium text-white hover:bg-secondary/90 transition-all duration-200"
          >
            <span>ہوم</span>
          </Link>
        )}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden sm:inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-medium text-white hover:bg-white/15 hover:shadow-md transition-all duration-200"
          >
            لاگ آؤٹ
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white text-xs font-semibold shadow-md">
            {userName?.charAt(0) || "م"}
          </div>
          <div className="flex flex-col text-right">
            <span className="font-semibold text-white text-xs md:text-sm">
              {userName}
            </span>
            <span className="text-white/80 text-[11px]">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
