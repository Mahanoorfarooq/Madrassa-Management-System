import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";

const INCOME_TYPES = [
  "student_fee",
  "hostel_fee",
  "mess_fee",
  "other_income",
] as const;
const EXPENSE_TYPES = ["salary", "other_expense"] as const;

export default function FinanceDashboard() {
  const [tx, setTx] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/api/finance/transactions");
      setTx(res.data?.transactions || []);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const income = tx
      .filter((t) => INCOME_TYPES.includes(t.type))
      .reduce((s, x) => s + (x.amount || 0), 0);
    const expense = tx
      .filter((t) => EXPENSE_TYPES.includes(t.type))
      .reduce((s, x) => s + (x.amount || 0), 0);
    return { income, expense, balance: income - expense, total: tx.length };
  }, [tx]);

  const links = [
    { href: "/finance/transactions", label: "معاملات کی فہرست" },
    { href: "/finance/transactions/new", label: "نیا معاملہ شامل کریں" },
  ];

  return (
    <FinanceLayout title="فنانس ڈیش بورڈ">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="کل آمدنی"
          value={`₨ ${stats.income.toLocaleString()}`}
        />
        <StatCard
          title="کل اخراجات"
          value={`₨ ${stats.expense.toLocaleString()}`}
        />
        <StatCard title="بیلنس" value={`₨ ${stats.balance.toLocaleString()}`} />
        <StatCard title="کل معاملات" value={stats.total} />
      </div>

      <div className="mb-4">
        <SimpleBarChart
          title="آمدنی بمقابلہ اخراجات"
          labels={["کل آمدنی", "کل اخراجات"]}
          values={[stats.income, stats.expense]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/40 transition shadow-sm px-4 py-3 text-sm text-right flex items-center justify-between"
          >
            <span className="text-gray-800">{l.label}</span>
            <span className="text-primary text-xs">کھولیں</span>
          </Link>
        ))}
      </div>
    </FinanceLayout>
  );
}
