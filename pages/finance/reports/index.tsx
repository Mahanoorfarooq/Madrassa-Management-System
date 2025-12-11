import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function FinanceReportsPage() {
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: new Date().toISOString().substring(0, 10),
    to: new Date().toISOString().substring(0, 10),
  });
  const [receipts, setReceipts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const load = async () => {
    const [r, i] = await Promise.all([
      api.get("/api/finance/receipts", {
        params: { from: range.from, to: range.to },
      }),
      api.get("/api/finance/invoices", {
        params: { from: range.from, to: range.to },
      }),
    ]);
    setReceipts(r.data?.receipts || []);
    setInvoices(i.data?.invoices || []);
  };

  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const received = useMemo(
    () => receipts.reduce((s, x) => s + (x.amountPaid || 0), 0),
    [receipts]
  );
  const billed = useMemo(
    () => invoices.reduce((s, x) => s + (x.total || 0), 0),
    [invoices]
  );

  return (
    <FinanceLayout title="مالیاتی رپورٹس">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right space-y-3 max-w-4xl ml-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">از</label>
            <input
              type="date"
              value={range.from}
              onChange={(e) =>
                setRange((r) => ({ ...r, from: e.target.value }))
              }
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">تک</label>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={load}
              className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700"
            >
              تازہ کریں
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded border bg-gray-50">
            <div className="text-xs text-gray-500">کل انوائس شدہ</div>
            <div className="text-2xl font-bold">
              ₨ {billed.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded border bg-gray-50">
            <div className="text-xs text-gray-500">کل موصول شدہ</div>
            <div className="text-2xl font-bold">
              ₨ {received.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
