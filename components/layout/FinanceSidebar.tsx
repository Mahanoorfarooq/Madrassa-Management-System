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
    <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-6 hidden md:block">
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
              className={`block rounded-xl px-3 py-2.5 transition-colors duration-200 text-xs md:text-sm ${
                active
                  ? "bg-primary/90 text-white shadow-md"
                  : "hover:bg-slate-800/80 text-slate-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
