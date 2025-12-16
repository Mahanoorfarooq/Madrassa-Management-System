import { useEffect, useState } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";

export default function StudentIdCard() {
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/api/students/me");
      setStudent(res.data?.student || null);
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-md mx-auto p-6 print:p-0" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">طالب علم کارڈ</h1>
          <button
            onClick={() => window.print()}
            className="hidden print:hidden md:inline-flex px-3 py-1.5 rounded bg-emerald-600 text-white text-xs"
          >
            پرنٹ
          </button>
        </div>
        {!student ? (
          <div className="text-sm text-gray-500">لوڈ ہو رہا ہے…</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow text-right">
            <div className="text-center mb-3">
              <div className="text-lg font-bold">مدرسہ</div>
              <div className="text-xs text-gray-500">Student ID Card</div>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-semibold">نام: </span>
                {student.fullName}
              </div>
              <div>
                <span className="font-semibold">رول نمبر: </span>
                {student.rollNumber || "—"}
              </div>
              <div>
                <span className="font-semibold">شعبہ/کلاس/سیکشن: </span>
                {student.departmentId?.name ||
                  student.departmentId?.code ||
                  "—"}{" "}
                / {student.classId?.className || student.className || "—"} /{" "}
                {student.sectionId?.sectionName || student.section || "—"}
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
