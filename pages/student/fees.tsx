import { useEffect, useState } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";

interface FeeItem {
  _id: string;
  month?: string;
  periodLabel?: string;
  amount?: number;
  paidAmount?: number;
  dueAmount?: number;
  createdAt?: string;
}

export default function StudentFees() {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.get("/api/students/me");
        const id = me.data?.student?._id;
        if (!id) {
          setError("طالب علم کا ریکارڈ نہیں ملا۔");
          setLoading(false);
          return;
        }
        const res = await api.get("/api/fees", { params: { studentId: id } });
        setFees(res.data?.fees || []);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "فیس کا ریکارڈ لوڈ نہیں ہو سکا۔"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalAmount = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const totalDue = fees.reduce((s, f) => s + (f.dueAmount || 0), 0);

  return (
    <StudentLayout>
      <div className="space-y-4" dir="rtl">
        {loading && (
          <p className="text-xs text-gray-500 text-right">لوڈ ہو رہا ہے...</p>
        )}
        {error && <p className="text-xs text-red-600 text-right">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-4 text-right">
              <div className="text-[11px] text-gray-600 mb-1">کل فیس</div>
              <div className="text-xl font-bold text-emerald-600">
                {totalAmount.toLocaleString("ur-PK")} روپے
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4 text-right">
              <div className="text-[11px] text-gray-600 mb-1">ادا شدہ</div>
              <div className="text-xl font-bold text-blue-600">
                {totalPaid.toLocaleString("ur-PK")} روپے
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 text-right">
              <div className="text-[11px] text-gray-600 mb-1">بقیہ</div>
              <div className="text-xl font-bold text-red-600">
                {totalDue.toLocaleString("ur-PK")} روپے
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right text-xs">
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            فیس انوائس کی تاریخچہ
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700">مدت</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    کل فیس
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    ادا شدہ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    بقیہ
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-700">
                    کارروائی
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading && fees.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-gray-400 text-xs"
                      colSpan={5}
                    >
                      اس وقت کوئی فیس ریکارڈ موجود نہیں۔
                    </td>
                  </tr>
                )}
                {fees.map((f) => {
                  const label = f.periodLabel || f.month || "مدت";
                  const amount = f.amount || 0;
                  const paid = f.paidAmount || 0;
                  const due = f.dueAmount || 0;
                  const isPaid = due <= 0;
                  return (
                    <tr key={f._id} className="border-t">
                      <td className="px-3 py-2 text-gray-700">{label}</td>
                      <td className="px-3 py-2 text-gray-700">
                        {amount.toLocaleString("ur-PK")}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {paid.toLocaleString("ur-PK")}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {due.toLocaleString("ur-PK")}
                      </td>
                      <td className="px-3 py-2 flex gap-2 justify-end">
                        <button
                          className="text-[11px] text-primary disabled:opacity-50"
                          disabled={isPaid}
                        >
                          آن لائن ادائیگی
                        </button>
                        <button className="text-[11px] text-gray-700" disabled>
                          رسید ڈاؤن لوڈ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
