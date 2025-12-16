import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import api from "@/utils/api";

interface AllocationInfo {
  hostelName: string;
  roomNumber: string;
  bedNumber: string;
}

interface MessItem {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface HostelFeeItem {
  label: string;
  amount: number;
  paid: number;
}

interface DisciplineNotice {
  id: number;
  date: string;
  title: string;
  body: string;
}

export default function StudentHostel() {
  const [allocation, setAllocation] = useState<AllocationInfo | null>(null);
  const [messSchedule, setMessSchedule] = useState<MessItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fees: HostelFeeItem[] = [
    { label: "ماہانہ ہاسٹل فیس", amount: 5000, paid: 4000 },
    { label: "میس چارجز", amount: 3000, paid: 3000 },
  ];

  const notices: DisciplineNotice[] = [
    {
      id: 1,
      date: "2025-12-01",
      title: "ہاسٹل اوقات کی پابندی",
      body: "براہ کرم رات 10 بجے کے بعد کمرے سے باہر نہ رہیں۔",
    },
  ];

  const totalAmount = fees.reduce((s, f) => s + f.amount, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paid, 0);
  const totalDue = totalAmount - totalPaid;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/api/student/hostel");
        const a = res.data?.allocation as {
          hostelName: string;
          roomNumber: string;
          bedNumber: string;
        } | null;
        const schedule = (res.data?.messSchedule || []) as Array<{
          dayOfWeek: number;
          breakfast?: string;
          lunch?: string;
          dinner?: string;
        }>;

        if (a) {
          setAllocation({
            hostelName: a.hostelName,
            roomNumber: a.roomNumber,
            bedNumber: a.bedNumber,
          });
        }

        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const mapped: MessItem[] = schedule.map((s) => ({
          day: dayNames[s.dayOfWeek] || "",
          breakfast: s.breakfast || "",
          lunch: s.lunch || "",
          dinner: s.dinner || "",
        }));
        setMessSchedule(mapped);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            "ہاسٹل کے ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <StudentLayout>
      <div className="space-y-4" dir="rtl">
        {loading && (
          <p className="text-xs text-gray-500 text-right">لوڈ ہو رہا ہے...</p>
        )}
        {error && (
          <p className="text-xs text-red-600 text-right mb-2">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right">
            <div className="text-[11px] text-gray-600 mb-1">ہاسٹل</div>
            <div className="text-lg font-bold text-gray-800">
              {allocation?.hostelName || "—"}
            </div>
            <div className="text-[11px] text-gray-600 mt-1">
              {allocation
                ? `کمرہ نمبر: ${allocation.roomNumber}، بیڈ: ${allocation.bedNumber}`
                : "اس وقت کوئی ہاسٹل الاٹمنٹ موجود نہیں۔"}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-4 text-right">
            <div className="text-[11px] text-gray-600 mb-1">کل ہاسٹل فیس</div>
            <div className="text-lg font-bold text-emerald-600">
              {totalAmount.toLocaleString("ur-PK")} روپے
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 text-right">
            <div className="text-[11px] text-gray-600 mb-1">بقیہ</div>
            <div className="text-lg font-bold text-red-600">
              {totalDue.toLocaleString("ur-PK")} روپے
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right text-xs">
            <h2 className="text-base font-semibold text-gray-800 mb-2">
              میس شیڈول
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-gray-700 font-semibold">
                      دن
                    </th>
                    <th className="px-3 py-2 text-gray-700 font-semibold">
                      ناشتہ
                    </th>
                    <th className="px-3 py-2 text-gray-700 font-semibold">
                      دوپہر
                    </th>
                    <th className="px-3 py-2 text-gray-700 font-semibold">
                      رات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messSchedule.map((m) => (
                    <tr key={m.day} className="border-t">
                      <td className="px-3 py-2 text-gray-700">{m.day}</td>
                      <td className="px-3 py-2 text-gray-700">{m.breakfast}</td>
                      <td className="px-3 py-2 text-gray-700">{m.lunch}</td>
                      <td className="px-3 py-2 text-gray-700">{m.dinner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right text-xs space-y-3">
            <h2 className="text-base font-semibold text-gray-800 mb-2">
              ہاسٹل فیس کی تفصیل
            </h2>
            <div className="space-y-2">
              {fees.map((f, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2 flex items-center justify-between"
                >
                  <div className="text-right">
                    <div className="text-[11px] font-semibold text-gray-800">
                      {f.label}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      کل: {f.amount.toLocaleString("ur-PK")} | ادا شدہ:{" "}
                      {f.paid.toLocaleString("ur-PK")}
                    </div>
                  </div>
                  <div className="text-[11px] text-red-600">
                    {(f.amount - f.paid).toLocaleString("ur-PK")} روپے
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-base font-semibold text-gray-800 mt-4 mb-2">
              ڈسپلن نوٹسز
            </h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-gray-800">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(n.date).toLocaleDateString("ur-PK")}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700">{n.body}</p>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-[11px] text-gray-500">
                  اس وقت کوئی نوٹس موجود نہیں۔
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
