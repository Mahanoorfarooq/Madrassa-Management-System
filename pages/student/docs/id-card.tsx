import { useEffect, useState } from "react";
import api from "@/utils/api";
import Head from "next/head";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Printer, GraduationCap, MapPin, Phone, Mail, Award, BookOpen, Clock, Calendar } from "lucide-react";

export default function StudentIdCard() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<"front" | "back" | "both">("both");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/students/me");
        setStudent(res.data?.student || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || "لوڈ نہیں ہو سکا۔");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePrint = (mode: "front" | "back" | "both") => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-PK");
    } catch {
      return dateString || "—";
    }
  };

  if (loading)
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      </StudentLayout>
    );

  if (error || !student)
    return (
      <StudentLayout>
        <div className="p-10 text-center text-red-500 font-urdu bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto mt-10">
          {error || "طالب علم کا ریکارڈ نہیں ملا۔"}
        </div>
      </StudentLayout>
    );

  // Data mapping
  const studentData = {
    ...student,
    departmentName: student.departmentId?.name || student.departmentName || "شعبہ غیر موجود",
    className: student.className || student.classId?.className || student.classId?.name || "کلاس غیر موجود",
    idNumber: student.rollNumber || student.admissionNumber || "—",
    photo: student.photoUrl || null
  };

  return (
    <StudentLayout>
      <Head>
        <title>Identity Card - {studentData.fullName}</title>
      </Head>

      <div className="max-w-5xl mx-auto py-8 px-4 print:p-0 print:m-0" dir="rtl">
        {/* Top Control Panel */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 print:hidden">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 font-urdu">شناختی کارڈ</h1>
              <p className="text-sm text-gray-500 font-urdu">آپ کا ڈیجیٹل اسٹوڈنٹ آئی ڈی کارڈ</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handlePrint("front")}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-100 transition-all font-urdu text-sm border border-emerald-100"
            >
              <Printer className="w-4 h-4" />
              صرف فرنٹ
            </button>
            <button
              onClick={() => handlePrint("back")}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-100 transition-all font-urdu text-sm border border-emerald-100"
            >
              <Printer className="w-4 h-4" />
              صرف بیک
            </button>
            <button
              onClick={() => handlePrint("both")}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all font-urdu text-sm shadow-lg shadow-emerald-200"
            >
              <Printer className="w-4 h-4" />
              مکمل پرنٹ
            </button>
          </div>
        </div>

        {/* Card Display Area */}
        <div className="flex flex-col items-center gap-12 py-10 print:py-0 print:gap-0">

          {/* ================= PREMIUM FRONT SIDE ================= */}
          <div
            id="premium-id-front"
            className={`id-card-container relative overflow-hidden bg-white print:bg-white print:m-0 print:shadow-none ${printMode === "back" ? "hidden-on-print" : ""
              } ${printMode === "both" ? "page-break-after" : ""}`}
          >
            {/* Header Design */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-l from-emerald-800 to-emerald-600 overflow-hidden">
              {/* Abstract Patterns */}
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-tr-full"></div>

              <div className="relative z-10 h-full flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                  <div className="text-white text-right font-urdu">
                    <h2 className="text-[17px] font-bold leading-tight drop-shadow-sm">الجامعہ الاسلامیہ السلفیہ</h2>
                    <p className="text-[10px] opacity-90 tracking-[2px] font-sans">ISLAMIC UNIVERSITY</p>
                  </div>
                </div>
                <div className="bg-white/15 px-4 py-1.5 rounded-full border border-white/20">
                  <span className="text-white font-urdu text-[12px] font-bold">شناختی کارڈ</span>
                </div>
              </div>
            </div>

            {/* Photo Section */}
            <div className="absolute top-20 right-8 z-20">
              <div className="w-[32mm] h-[38mm] bg-white rounded-2xl p-1.5 shadow-2xl overflow-hidden border border-gray-100">
                <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                  {studentData.photo ? (
                    <img src={studentData.photo} alt={studentData.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300">
                      <GraduationCap className="w-12 h-12 opacity-30" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Details Body */}
            <div className="absolute top-36 left-8 right-[45mm] text-right font-urdu" dir="rtl">
              <div className="space-y-4">
                <div className="mb-2">
                  <label className="text-[10px] text-gray-400 font-bold block mb-0.5">طالب علم کا نام:</label>
                  <h3 className="text-2xl font-black text-gray-800 leading-none">{studentData.urduName || studentData.fullName}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-0.5">رول نمبر:</label>
                    <p className="text-[14px] font-black text-emerald-700 font-sans tracking-wide" dir="ltr">{studentData.idNumber}</p>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-0.5">کلاس:</label>
                    <p className="text-[13px] font-bold text-gray-700">{studentData.className}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-400 font-bold block mb-0.5">شعبہ:</label>
                  <p className="text-[13px] font-bold text-gray-700">{studentData.departmentName}</p>
                </div>

                {studentData.dateOfBirth && (
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-0.5">تاریخ پیدائش:</label>
                    <p className="text-[12px] font-black font-sans text-gray-700" dir="ltr">{formatDate(studentData.dateOfBirth)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-slate-50 border-t border-gray-100 flex items-center justify-between px-8">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                <span className="text-[10px] font-black font-sans text-gray-400 tracking-[1px] uppercase">Official ID</span>
              </div>
              {/* Signature Placeholder */}
              <div className="text-center font-urdu">
                <div className="text-[10px] text-gray-400 mb-0.5 font-bold">دستخط ناظم</div>
                <div className="w-20 h-6 border-b border-gray-200"></div>
              </div>
            </div>

            {/* Edge Accents */}
            <div className="absolute top-0 right-0 bottom-0 w-2 bg-emerald-700"></div>
          </div>

          {/* ================= PREMIUM BACK SIDE ================= */}
          <div
            id="premium-id-back"
            className={`id-card-container relative overflow-hidden bg-white print:bg-white print:m-0 print:shadow-none ${printMode === "front" ? "hidden-on-print" : ""
              } print:mt-10`}
          >
            {/* Header Strip */}
            <div className="h-4 bg-emerald-800 w-full"></div>

            <div className="p-8 h-full flex flex-col font-urdu" dir="rtl">
              {/* Top Info Section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-emerald-800">ہدایات اور معلومات</span>
                </div>
                {studentData.cnic && (
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black font-sans tracking-wide text-gray-500">
                    ID: {studentData.cnic}
                  </div>
                )}
              </div>

              {/* Main Instruction Block */}
              <div className="flex-1 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 relative group overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-200"></div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1.5">مستقل پتہ:</label>
                  <p className="text-[13px] text-gray-700 leading-relaxed min-h-[40px]">
                    {studentData.address || "پتہ دستیاب نہیں۔"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 block font-bold leading-none mb-0.5">رابطہ نمبر:</label>
                      <p className="text-[11px] font-black font-sans tracking-wide" dir="ltr">{studentData.contactNumber || "—"}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3 text-right">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 block font-bold leading-none mb-0.5">تاریخِ اجراء:</label>
                      <p className="text-[11px] font-black font-sans tracking-wide" dir="ltr">{new Date().toLocaleDateString('en-PK')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lost & Found Instruction */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-center border border-emerald-100/50">
                <p className="text-[10.5px] leading-relaxed font-bold">
                  یہ کارڈ گم ہونے کی صورت میں فوری طور پر ادارے کے آفس میں اطلاع دیں۔ کارڈ پانے والا شخص قریبی ڈاکخانہ یا درج بالا پتہ پر ارسال فرمائے۔
                </p>
              </div>

              {/* Footer Strip with Contact Info */}
              <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-gray-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-emerald-200" />
                  <span>منڈی بہاء الدین، پنجاب</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-emerald-200" />
                  <span>info@university.edu</span>
                </div>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-800"></div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @font-face {
          font-family: "AlQalam Taj Nastaleeq";
          src: url("/fonts/alqalam-taj-nastaleeq/AlQalam Taj Nastaleeq Regular.ttf") format("truetype");
        }
        
        .font-urdu {
          font-family: "AlQalam Taj Nastaleeq", "Urdu", serif, system-ui;
        }

        .id-card-container {
            width: 120mm;
            height: 76mm;
            border-radius: 6mm;
            box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1);
        }

        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .id-card-container {
              box-shadow: none !important;
              border: 1px solid #eee !important;
              margin: 15mm auto !important;
              page-break-inside: avoid;
          }

          .hidden-on-print {
            display: none !important;
          }

          .page-break-after {
            page-break-after: always;
          }

          @page {
            size: auto;
            margin: 0mm;
          }

          /* Hide UI Elements */
          nav, aside, header, footer, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </StudentLayout>
  );
}
