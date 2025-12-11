interface TopbarProps {
  userName?: string;
  roleLabel?: string;
  onMenuClick?: () => void;
  onLogout?: () => void;
}

export function Topbar({
  userName = "مہمان صارف",
  roleLabel = "کردار",
  onMenuClick,
  onLogout,
}: TopbarProps) {
  return (
    <header className="flex items-center justify-between bg-gradient-to-r from-white to-emerald-50/30 border-b border-emerald-100/50 px-4 py-3 md:px-6 shadow-lg backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-[11px] font-medium text-emerald-700 shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all duration-200"
        >
          مينيو
        </button>
        <div className="hidden md:flex items-center gap-3 text-primary">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <span className="text-xl">🕌</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-gray-900 tracking-wide">
              جامعہ مینجمنٹ سسٹم
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              منظم اور خوبصورت ڈیش بورڈ
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs md:text-sm">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden sm:inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200"
          >
            لاگ آؤٹ
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-md">
            {userName?.charAt(0) || "م"}
          </div>
          <div className="flex flex-col text-right">
            <span className="font-semibold text-gray-800 text-xs md:text-sm">
              {userName}
            </span>
            <span className="text-gray-500 text-[11px]">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
