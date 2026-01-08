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
    <header className="flex items-center justify-between bg-white/90 border-b border-borderSoft px-4 py-3 md:px-6 shadow-sm backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
        >
          مينيو
        </button>
        <div className="hidden md:flex items-center gap-3 text-primary">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-900 text-white shadow-lg">
            <span className="text-xl">🕌</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-gray-900 tracking-wide">
              جامعہ مینجمنٹ سسٹم
            </span>
            <span className="text-[11px] text-brandTeal font-medium">
              منظم اور خوبصورت ڈیش بورڈ
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs md:text-sm">
        {showHomeLink && (
          <Link
            href="/modules/madrassa"
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-lightBg px-3 py-1.5 text-[11px] font-medium text-primary border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm transition-all duration-200"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px]">
              🏠
            </span>
            <span>ہوم</span>
          </Link>
        )}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden sm:inline-flex items-center justify-center rounded-xl border border-red-300/60 bg-touchWhite px-4 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 hover:border-red-400/70 hover:shadow-md transition-all duration-200"
          >
            لاگ آؤٹ
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold shadow-md">
            {userName?.charAt(0) || "م"}
          </div>
          <div className="flex flex-col text-right">
            <span className="font-semibold text-gray-800 text-xs md:text-sm">
              {userName}
            </span>
            <span className="text-brandTeal/80 text-[11px]">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
