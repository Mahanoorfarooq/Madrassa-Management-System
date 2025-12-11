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
    <header className="flex items-center justify-between bg-surface/95 border-b border-borderSoft/70 px-4 py-3 md:px-6 shadow-sm backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden inline-flex items-center justify-center rounded-full border border-borderSoft/80 bg-surface px-3 py-1 text-[11px] text-gray-600 shadow-sm hover:bg-surfaceMuted transition"
        >
          مينيو
        </button>
        <div className="hidden md:flex items-center gap-2 text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-primary shadow-sm">
            <span className="text-lg">🕌</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-900">
              جامعہ مینجمنٹ سسٹم
            </span>
            <span className="text-[11px] text-gray-500">
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
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-borderSoft/80 bg-surface px-3 py-1 text-[11px] text-gray-600 hover:bg-red-50 hover:text-danger transition"
          >
            لاگ آؤٹ
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-gray-500">موصولہ اطلاعات</span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/40 shadow-sm">
            3
          </span>
        </div>
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
