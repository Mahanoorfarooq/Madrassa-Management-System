import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/finance", label: "ڈیش بورڈ" },
  { href: "/finance/transactions", label: "معاملات" },
  { href: "/finance/fee-structures", label: "فیس ڈھانچہ" },
  { href: "/finance/invoices", label: "انوائسز" },
  { href: "/finance/invoices/bulk", label: "بلک انوائس" },
  { href: "/finance/receipts", label: "رسیدیں" },
  { href: "/finance/dues", label: "بقایا" },
  { href: "/finance/adjustments", label: "ریفنڈ / Adjustment" },
  { href: "/finance/reminders", label: "ری مائنڈرز" },
  { href: "/finance/reports", label: "رپورٹس" },
  { href: "/finance/ledgers", label: "لیجر" },
];

export function FinanceSidebar() {
  const router = useRouter();

  return (
    <aside className="sticky top-0 h-screen overflow-hidden w-64 bg-saPrimary text-white px-4 py-6 hidden md:block border-l border-white/5">
      <div className="h-full overflow-y-auto scrollbar-none">
        <div className="mb-6 text-xl font-semibold text-secondary text-right">
          فنانس
        </div>
        <nav className="space-y-1 text-right text-sm">
          {links.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  active
                    ? "bg-white/10 text-secondary border-r-4 border-secondary shadow-lg"
                    : "text-slate-300 hover:bg-white/5 border-r-4 border-transparent"
                } flex items-center gap-3 px-4 py-2.5 transition-all duration-300 text-sm md:text-base selection:bg-secondary/30`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
