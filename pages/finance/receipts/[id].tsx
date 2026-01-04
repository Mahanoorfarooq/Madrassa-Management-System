import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function ReceiptPrintPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/finance/receipts/${id}`);
        setDoc(res.data?.receipt || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || "لوڈ نہیں ہو سکا");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <FinanceLayout title="رسید">
      <div className="max-w-3xl mx-auto" dir="rtl">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h1 className="text-lg font-bold text-gray-800">رسید</h1>
          <button
            onClick={() => window.print()}
            className="rounded bg-primary text-white px-4 py-2 text-sm font-semibold"
          >
            پرنٹ
          </button>
        </div>

        {loading && <div className="text-sm text-gray-500">لوڈ ہو رہا ہے…</div>}
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        {!loading && doc && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow print:shadow-none">
            <div className="text-center mb-4">
              <div className="text-lg font-bold">مدرسہ</div>
              <div className="text-xs text-gray-500">Receipt / رسید</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">رسید نمبر: </span>
                <span className="font-semibold">{doc.receiptNo}</span>
              </div>
              <div>
                <span className="text-gray-500">تاریخ: </span>
                <span className="font-semibold">
                  {doc.date
                    ? new Date(doc.date).toLocaleDateString("ur-PK")
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">طالب علم: </span>
                <span className="font-semibold">
                  {doc.studentId?.fullName || doc.studentId?.name || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">رول نمبر: </span>
                <span className="font-semibold">
                  {doc.studentId?.rollNumber || doc.studentId?.regNo || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">انوائس: </span>
                <span className="font-semibold">
                  {doc.invoiceId?.invoiceNo || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">ادائیگی طریقہ: </span>
                <span className="font-semibold">{doc.method || "—"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">ریفرنس: </span>
                <span className="font-semibold">{doc.referenceNo || "—"}</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-right">
              <div className="text-xs text-gray-500 mb-1">وصول شدہ رقم</div>
              <div className="text-2xl font-bold text-gray-900">
                {Number(doc.amountPaid || 0).toLocaleString("en-US")}
              </div>
            </div>

            <div className="mt-6 flex justify-between text-xs text-gray-500">
              <div>دستخط: __________________</div>
              <div>اسٹیمپ: __________________</div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @media print {
            body {
              background: #fff;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </FinanceLayout>
  );
}
