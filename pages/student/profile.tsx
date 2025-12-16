import { useEffect, useState, FormEvent } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";
import {
  User,
  Users,
  FileText,
  Send,
  Download,
  GraduationCap,
} from "lucide-react";

export default function StudentProfile() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [correctionSent, setCorrectionSent] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [correctionLoading, setCorrectionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/students/me");
        setStudent(res.data?.student || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || "ریکارڈ نہیں ملا");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitCorrection = async (e: FormEvent) => {
    e.preventDefault();
    if (!correctionText.trim()) return;
    try {
      setCorrectionLoading(true);
      setCorrectionError(null);
      await api.post("/api/student/profile-corrections", {
        description: correctionText,
      });
      setCorrectionSent(true);
      setCorrectionText("");
    } catch (e: any) {
      setCorrectionError(
        e?.response?.data?.message || "درخواست محفوظ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setCorrectionLoading(false);
    }
  };

  if (!student && !loading) {
    return (
      <StudentLayout title="میرا پروفائل">
        <div className="p-6 max-w-7xl mx-auto" dir="rtl">
          <div className="text-center py-12 text-red-600">{error}</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-6 max-w-7xl mx-auto" dir="rtl">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {student?.fullName || "طالب علم"}
              </h2>
              <p className="text-blue-100 text-sm">
                رول نمبر: {student?.rollNumber || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <h3 className="text-base font-bold">بنیادی معلومات</h3>
              </div>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">نام:</span>
                <span className="font-semibold text-gray-800">
                  {student?.fullName || "—"}
                </span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">رول نمبر:</span>
                <span className="font-semibold text-gray-800">
                  {student?.rollNumber || "—"}
                </span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">شعبہ:</span>
                <span className="font-semibold text-gray-800">
                  {student?.departmentId?.name ||
                    student?.departmentId?.code ||
                    "—"}
                </span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">کلاس:</span>
                <span className="font-semibold text-gray-800">
                  {student?.className || "—"}
                </span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">سیکشن:</span>
                <span className="font-semibold text-gray-800">
                  {student?.section || "—"}
                </span>
              </div>
              {student?.admissionNumber && (
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">داخلہ نمبر:</span>
                  <span className="font-semibold text-gray-800">
                    {student.admissionNumber}
                  </span>
                </div>
              )}
              {student?.admissionDate && (
                <div className="flex items-start justify-between py-2">
                  <span className="text-gray-600">داخلہ کی تاریخ:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(student.admissionDate).toLocaleDateString(
                      "ur-PK"
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h3 className="text-base font-bold">سرپرست کی معلومات</h3>
              </div>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {student?.fatherName && (
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">والد کا نام:</span>
                  <span className="font-semibold text-gray-800">
                    {student.fatherName}
                  </span>
                </div>
              )}
              {student?.guardianName && (
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">سرپرست کا نام:</span>
                  <span className="font-semibold text-gray-800">
                    {student.guardianName}
                  </span>
                </div>
              )}
              {student?.guardianRelation && (
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">رشتہ:</span>
                  <span className="font-semibold text-gray-800">
                    {student.guardianRelation}
                  </span>
                </div>
              )}
              {student?.guardianPhone && (
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">فون نمبر:</span>
                  <span className="font-semibold text-gray-800 direction-ltr">
                    {student.guardianPhone}
                  </span>
                </div>
              )}
              {student?.guardianAddress && (
                <div className="flex items-start justify-between py-2">
                  <span className="text-gray-600">پتہ:</span>
                  <span className="font-semibold text-gray-800 text-right max-w-xs">
                    {student.guardianAddress}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="text-base font-bold">دستاویزات</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-2">
                {[
                  { label: "داخلہ فارم", href: "/student/docs/admission" },
                  { label: "شناختی کارڈ", href: "/student/docs/id-card" },
                  { label: "ٹرانسکرپٹ", href: "/student/docs/transcript" },
                  { label: "سرٹیفیکیٹس", href: "/student/docs/certificates" },
                ].map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition-all group"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {doc.label}
                    </span>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Correction Request */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="text-base font-bold">پروفائل میں اصلاح</h3>
              </div>
            </div>
            <form onSubmit={submitCorrection} className="p-5 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  درخواست کی تفصیل
                </label>
                <textarea
                  className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  rows={4}
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder="براہ کرم واضح لکھیں کہ کون سی معلومات درست کرنی ہیں۔"
                />
              </div>

              {correctionError && (
                <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200">
                  {correctionError}
                </div>
              )}

              {correctionSent && (
                <div className="rounded-lg bg-emerald-50 text-emerald-700 text-sm px-4 py-3 border border-emerald-200">
                  آپ کی درخواست محفوظ ہو گئی ہے۔
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all"
                disabled={!correctionText.trim() || correctionLoading}
              >
                <Send className="w-4 h-4" />
                درخواست جمع کریں
              </button>
            </form>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
