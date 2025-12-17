import { useEffect, useState } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";

export default function StudentSanad() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/students/me");
        setStudent(res.data?.student || null);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "سند لوڈ کرنے میں مسئلہ پیش آیا۔"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto p-6 print:p-0" dir="rtl">
        <div className="flex items-center justify-between mb-4 print:mb-2">
          <h1 className="text-xl font-bold">سند فراغت</h1>
          <button
            onClick={() => window.print()}
            className="hidden print:hidden md:inline-flex px-3 py-1.5 rounded bg-emerald-600 text-white text-xs"
          >
            پرنٹ
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">لوڈ ہو رہا ہے…</div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        ) : !student ? (
          <div className="text-sm text-gray-500">
            طالب علم کا ڈیٹا دستیاب نہیں۔
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow text-right print:shadow-none print:border-0">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold mb-1">مدرسہ</div>
              <div className="text-sm text-gray-500 mb-1">
                Certificate of Completion
              </div>
            </div>

            <div className="text-sm leading-7 mb-8">
              <p className="mb-3">
                <span className="font-semibold">یہ سند گواہی دیتی ہے کہ </span>
                <span className="font-bold">{student.fullName}</span> (رول نمبر:{" "}
                {student.rollNumber || "—"}) نے مدرسہ میں اپنی تعلیم مکمل کی ہے۔
              </p>
              <p className="mb-3">
                طالب علم نے درج ذیل شعبہ / درجہ میں فراغت حاصل کی:
              </p>
              <p className="mb-3">
                شعبہ / کلاس:{" "}
                {student.classId?.className || student.className || "—"} |
                سیکشن:{" "}
                {student.sectionId?.sectionName || student.section || "—"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm mt-8">
              <div className="text-center">
                <div className="h-10 border-b border-gray-300 mb-1" />
                <div className="text-gray-700 text-xs">مہتمم / پرنسپل</div>
              </div>
              <div className="text-center">
                <div className="h-10 border-b border-gray-300 mb-1" />
                <div className="text-gray-700 text-xs">مہر مدرسہ</div>
              </div>
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
    </StudentLayout>
  );
}
