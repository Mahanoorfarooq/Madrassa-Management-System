import { useEffect, useState } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";
import {
  FileText,
  Printer,
  User,
  GraduationCap,
  Calendar,
  Hash,
} from "lucide-react";

export default function AdmissionFormDoc() {
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/students/me");
        setStudent(res.data?.student || null);
      } catch (error) {
        console.error("Failed to load student admission data", error);
      }
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <div className="p-6 max-w-5xl mx-auto print:p-0" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-saAccent to-primary rounded-xl p-5 text-white shadow-lg mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">داخلہ فارم</h2>
                <p className="text-white/80 text-sm">
                  طالب علم کی داخلہ کی تفصیلات
                </p>
              </div>
            </div>
            <button
              disabled={!student?._id}
              onClick={() => {
                if (!student?._id) return;
                // Open the new vector-based print page (no background image)
                window.open(`/admission-form/${student._id}`, "_blank");
              }}
              className="flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-all border border-white/30 disabled:opacity-60"
            >
              <Printer className="w-4 h-4" />
              فارم پرنٹ
            </button>
          </div>
        </div>

        {!student ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-sm">لوڈ ہو رہا ہے…</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-5 print:bg-white">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  داخلہ فارم
                </h3>
                <p className="text-xs text-gray-600">
                  تعلیمی ادارہ - مدرسہ منیجمنٹ سسٹم
                </p>
              </div>
            </div>

            {/* Student Photo and Basic Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.fullName}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-secondary/10 border-2 border-gray-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-secondary" />
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {student.fullName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    رول نمبر: {student.rollNumber || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Admission Details */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <GraduationCap className="w-5 h-5 text-secondary" />
                <h5 className="text-base font-bold text-gray-800">
                  داخلہ کی تفصیلات
                </h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">داخلہ نمبر</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {student.admissionNumber || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">
                      داخلہ کی تاریخ
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {student.admissionDate
                        ? new Date(student.admissionDate).toLocaleDateString(
                            "ur-PK"
                          )
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">شعبہ</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {student.departmentId?.name ||
                        student.departmentId?.code ||
                        "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">کلاس</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {student.classId?.className || student.className || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">سیکشن</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {student.sectionId?.sectionName || student.section || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">حیثیت</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {student.status || "فعال"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            {(student.fatherName || student.guardianName) && (
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <User className="w-5 h-5 text-teal-600" />
                  <h5 className="text-base font-bold text-gray-800">
                    سرپرست کی معلومات
                  </h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {student.fatherName && (
                    <div>
                      <span className="text-gray-600">والد کا نام: </span>
                      <span className="font-semibold text-gray-800">
                        {student.fatherName}
                      </span>
                    </div>
                  )}
                  {student.guardianName && (
                    <div>
                      <span className="text-gray-600">سرپرست کا نام: </span>
                      <span className="font-semibold text-gray-800">
                        {student.guardianName}
                      </span>
                    </div>
                  )}
                  {student.guardianPhone && (
                    <div>
                      <span className="text-gray-600">رابطہ نمبر: </span>
                      <span className="font-semibold text-gray-800">
                        {student.guardianPhone}
                      </span>
                    </div>
                  )}
                  {student.guardianRelation && (
                    <div>
                      <span className="text-gray-600">رشتہ: </span>
                      <span className="font-semibold text-gray-800">
                        {student.guardianRelation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Print Footer */}
            <div className="hidden print:block p-6 border-t border-gray-300 text-center text-xs text-gray-600">
              <p>یہ دستاویز الیکٹرانک طور پر تیار کی گئی ہے۔</p>
              <p className="mt-1">
                تاریخِ پرنٹ: {new Date().toLocaleDateString("ur-PK")}
              </p>
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
            .print\\:block {
              display: block !important;
            }
            .print\\:p-0 {
              padding: 0 !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:border {
              border: 1px solid #e5e7eb !important;
            }
            .print\\:bg-white {
              background: #fff !important;
            }
          }
        `}</style>
      </div>
    </StudentLayout>
  );
}
