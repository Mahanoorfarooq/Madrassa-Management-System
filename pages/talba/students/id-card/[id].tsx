import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

export default function AdminStudentIdCard() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/admin/student-id-card/${id}`);
        setStudent(res.data?.student || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || "لوڈ نہیں ہو سکا۔");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const deptLabel =
    student?.departmentId?.name || student?.departmentId?.code || "—";
  const classLabel = student?.classId?.className || student?.className || "—";
  const sectionLabel =
    student?.sectionId?.sectionName || student?.section || "—";

  return (
    <TalbaLayout title="طالب علم ID کارڈ">
      <div className="max-w-3xl mx-auto" dir="rtl">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h1 className="text-lg font-bold text-gray-800">طالب علم ID کارڈ</h1>
          <button
            onClick={() => window.print()}
            className="rounded bg-primary text-white px-4 py-2 text-sm font-semibold"
          >
            پرنٹ
          </button>
        </div>

        {loading && (
          <div className="text-sm text-gray-500 text-right">لوڈ ہو رہا ہے…</div>
        )}
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-sm px-3 py-2 text-right">
            {error}
          </div>
        )}

        {!loading && student && (
          <div className="print:p-0">
            <div className="mx-auto w-[340px]">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow print:shadow-none">
                <div className="bg-gradient-to-l from-emerald-700 to-emerald-500 text-white px-4 py-3 text-right">
                  <div className="text-sm font-bold">مدرسہ</div>
                  <div className="text-[11px] opacity-90">Student ID Card</div>
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-24 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                      {student.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={student.photoUrl}
                          alt={student.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[10px] text-gray-400">تصویر</div>
                      )}
                    </div>

                    <div className="flex-1 text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {student.fullName}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">رول نمبر:</span>{" "}
                        {student.rollNumber || "—"}
                      </div>
                      {student.admissionNumber && (
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-semibold">داخلہ نمبر:</span>{" "}
                          {student.admissionNumber}
                        </div>
                      )}
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">شعبہ:</span> {deptLabel}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">کلاس/سیکشن:</span>{" "}
                        {classLabel} / {sectionLabel}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-right">
                    <div className="text-[11px] text-gray-700">
                      <span className="font-semibold">سرپرست:</span>{" "}
                      {student.guardianName || student.fatherName || "—"}
                    </div>
                    <div className="text-[11px] text-gray-700 mt-1">
                      <span className="font-semibold">فون:</span>{" "}
                      {student.guardianPhone || student.contactNumber || "—"}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2">
                      * یہ کارڈ مدرسہ کی ملکیت ہے۔ گم ہونے کی صورت میں انتظامیہ
                      سے رابطہ کریں۔
                    </div>
                  </div>
                </div>
              </div>

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
          </div>
        )}
      </div>
    </TalbaLayout>
  );
}
