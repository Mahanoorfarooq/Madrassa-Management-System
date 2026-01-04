import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import {
  FileText,
  Printer,
  User,
  GraduationCap,
  Calendar,
  Hash,
  MapPin,
  Bus,
  BadgePercent,
  Home,
  BookOpen,
} from "lucide-react";

export default function TalbaStudentAdmissionFormPrint() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState<boolean>(false);
  const [printError, setPrintError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/admin/student-id-card/${id}`);
        setStudent(res.data?.student || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || "ریکارڈ لوڈ نہیں ہو سکا۔");
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
    <TalbaLayout>
      <div className="p-6 max-w-5xl mx-auto print:p-0" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">داخلہ فارم / دَخلہ فارم</h2>
                <p className="text-blue-100 text-sm">
                  طالب علم کی داخلہ کی مکمل تفصیلات برائے ریکارڈ و پرنٹ
                </p>
              </div>
            </div>
            <button
              disabled={!id || printing}
              onClick={() => {
                if (!id) return;
                const iframe = document.createElement("iframe");
                // Use minimal visible size to force rendering
                iframe.style.position = "fixed";
                iframe.style.bottom = "0";
                iframe.style.right = "0";
                iframe.style.width = "1px";
                iframe.style.height = "1px";
                iframe.style.border = "none";
                iframe.style.opacity = "0.01";
                iframe.style.pointerEvents = "none";
                iframe.src = `/admission-form/${id}`;
                document.body.appendChild(iframe);

                iframe.onload = () => {
                  // Longer delay for Next.js hydration
                  setTimeout(() => {
                    if (iframe.contentWindow) {
                      iframe.contentWindow.focus();
                      iframe.contentWindow.print();
                    }
                    // Clean up
                    setTimeout(() => {
                      document.body.removeChild(iframe);
                    }, 5000); // Give user time to interact with print dialog
                  }, 2000);
                };
              }}
              className="flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-all border border-white/30 disabled:opacity-60"
            >
              <Printer className="w-4 h-4" />
              {printing ? "پرنٹ ہو رہا ہے..." : "داخلہ فارم پرنٹ کریں"}
            </button>
          </div>
        </div>

        {loading && !student && !error && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-sm">لوڈ ہو رہا ہے…</div>
          </div>
        )}

        {(error || printError) && (
          <div className="bg-white rounded-xl shadow-md border border-red-200 p-4 mb-4 text-right">
            <p className="text-sm text-red-700">{error || printError}</p>
          </div>
        )}

        {!loading && !error && !student && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-sm">ریکارڈ نہیں ملا۔</div>
          </div>
        )}

        {student && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-5 print:bg-white">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  داخلہ فارم / Admission Form
                </h3>
                <p className="text-xs text-gray-600">
                  تعلیمی ادارہ - مدرسہ منیجمنٹ سسٹم (داخلی ریکارڈ کا پرنٹ)
                </p>
              </div>
            </div>

            {/* Student Photo and Basic Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                {student.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.photoUrl}
                    alt={student.fullName}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-gray-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800">
                    {student.fullName}
                  </h4>
                  <div className="mt-1 text-sm text-gray-700 space-y-1">
                    <div>
                      <span className="text-gray-600">رول نمبر: </span>
                      <span className="font-semibold">
                        {student.rollNumber || "—"}
                      </span>
                    </div>
                    {student.admissionNumber && (
                      <div>
                        <span className="text-gray-600">داخلہ نمبر: </span>
                        <span className="font-semibold">
                          {student.admissionNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admission Details */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h5 className="text-base font-bold text-gray-800">
                  داخلہ / تعلیمی معلومات
                </h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">داخلہ نمبر</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {student.admissionNumber || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
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
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">شعبہ</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {deptLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">
                      کلاس / سیکشن
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {classLabel} / {sectionLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">حیثیت</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {student.status || "Active"}
                    </div>
                  </div>
                </div>

                {student.previousSchool && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        سابقہ ادارہ
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        {student.previousSchool}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal & Contact Details */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <User className="w-5 h-5 text-teal-600" />
                <h5 className="text-base font-bold text-gray-800">
                  ذاتی و رابطہ معلومات
                </h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {student.dateOfBirth && (
                  <div>
                    <span className="text-gray-600">تاریخ پیدائش: </span>
                    <span className="font-semibold text-gray-800">
                      {new Date(student.dateOfBirth).toLocaleDateString(
                        "ur-PK"
                      )}
                    </span>
                  </div>
                )}
                {student.gender && (
                  <div>
                    <span className="text-gray-600">جنس: </span>
                    <span className="font-semibold text-gray-800">
                      {student.gender === "male"
                        ? "مرد"
                        : student.gender === "female"
                          ? "خاتون"
                          : "دیگر"}
                    </span>
                  </div>
                )}
                {student.cnic && (
                  <div>
                    <span className="text-gray-600">شناختی کارڈ نمبر: </span>
                    <span className="font-semibold text-gray-800">
                      {student.cnic}
                    </span>
                  </div>
                )}
                {student.contactNumber && (
                  <div>
                    <span className="text-gray-600">رابطہ نمبر: </span>
                    <span className="font-semibold text-gray-800">
                      {student.contactNumber}
                    </span>
                  </div>
                )}
                {student.emergencyContact && (
                  <div>
                    <span className="text-gray-600">ہنگامی رابطہ: </span>
                    <span className="font-semibold text-gray-800">
                      {student.emergencyContact}
                    </span>
                  </div>
                )}
                {student.address && (
                  <div className="md:col-span-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-1" />
                    <div>
                      <div className="text-xs text-gray-600 mb-1">مکمل پتہ</div>
                      <div className="text-sm font-semibold text-gray-800 whitespace-pre-line">
                        {student.address}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guardian Information */}
            {(student.fatherName ||
              student.guardianName ||
              student.guardianPhone) && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <User className="w-5 h-5 text-teal-600" />
                    <h5 className="text-base font-bold text-gray-800">
                      والد / سرپرست کی معلومات
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
                    {student.guardianRelation && (
                      <div>
                        <span className="text-gray-600">رشتہ: </span>
                        <span className="font-semibold text-gray-800">
                          {student.guardianRelation}
                        </span>
                      </div>
                    )}
                    {student.guardianCNIC && (
                      <div>
                        <span className="text-gray-600">
                          سرپرست کا شناختی کارڈ:{" "}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {student.guardianCNIC}
                        </span>
                      </div>
                    )}
                    {student.guardianPhone && (
                      <div>
                        <span className="text-gray-600">
                          سرپرست کا فون نمبر:{" "}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {student.guardianPhone}
                        </span>
                      </div>
                    )}
                    {student.guardianAddress && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">سرپرست کا پتہ: </span>
                        <span className="font-semibold text-gray-800">
                          {student.guardianAddress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Hostel / Transport / Scholarship Summary */}
            {(student.isHostel ||
              student.isTransport ||
              (student.scholarshipType &&
                student.scholarshipType !== "none")) && (
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <Home className="w-5 h-5 text-emerald-600" />
                    <h5 className="text-base font-bold text-gray-800">
                      ہاسٹل / ٹرانسپورٹ / اسکالرشپ
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Home className="w-4 h-4 text-emerald-600 mt-1" />
                      <div>
                        <div className="text-xs text-gray-600 mb-1">ہاسٹل</div>
                        <div className="font-semibold text-gray-800">
                          {student.isHostel ? "ہاں" : "نہیں"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Bus className="w-4 h-4 text-blue-600 mt-1" />
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          ٹرانسپورٹ
                        </div>
                        <div className="font-semibold text-gray-800">
                          {student.isTransport ? "ہاں" : "نہیں"}
                        </div>
                      </div>
                    </div>

                    {student.scholarshipType &&
                      student.scholarshipType !== "none" && (
                        <div className="flex items-start gap-2 md:col-span-1">
                          <BadgePercent className="w-4 h-4 text-amber-600 mt-1" />
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              اسکالرشپ / رعایت
                            </div>
                            <div className="font-semibold text-gray-800">
                              {student.scholarshipType === "percent"
                                ? `${student.scholarshipValue || 0}%`
                                : `Rs. ${student.scholarshipValue || 0}`}
                            </div>
                            {student.scholarshipNote && (
                              <div className="text-xs text-gray-600 mt-1">
                                {student.scholarshipNote}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

            {/* Notes & Signatures */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-xs text-gray-600 mb-1">نوٹس</div>
                  <div className="min-h-[60px] rounded-lg border border-dashed border-gray-300 p-3 text-gray-800 whitespace-pre-line">
                    {student.notes || ""}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-xs text-gray-600 mb-6">
                      طالب علم / سرپرست کے دستخط
                    </div>
                    <div className="h-[1px] bg-gray-300" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-6">
                      ادارہ / منتظم کے دستخط
                    </div>
                    <div className="h-[1px] bg-gray-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block p-6 border-t border-gray-300 text-center text-xs text-gray-600">
              <p>
                یہ دستاویز الیکٹرانک طور پر مدرسہ منیجمنٹ سسٹم سے تیار کی گئی
                ہے۔
              </p>
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
    </TalbaLayout >
  );
}
