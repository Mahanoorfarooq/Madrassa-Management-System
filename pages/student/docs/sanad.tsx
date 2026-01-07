import { useEffect, useState } from "react";
import api from "@/utils/api";
import Head from "next/head";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Printer, Award, Clock, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function StudentSanad() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [meRes, requestRes] = await Promise.all([
          api
            .get("/api/students/me")
            .catch(() => ({ data: { student: null } })),
          api
            .get("/api/student/document-requests")
            .catch(() => ({ data: { requests: [] } })),
        ]);

        setStudent(meRes.data?.student || null);

        // Find if there's an approved request for sanad
        const sanadReq = requestRes.data?.requests?.find(
          (r: any) => r.documentType === "sanad"
        );
        setRequestStatus(sanadReq?.status || null);
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

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApply = async () => {
    try {
      setLoading(true);
      await api.post("/api/student/document-requests", {
        documentType: "sanad",
      });
      setRequestStatus("pending");
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message || "درخواست جمع کرنے میں غلطی ہوئی۔"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
        </div>

        {/* Error Modal */}
        <Modal open={!!errorMsg} title="غلطی" onClose={() => setErrorMsg(null)}>
          <div className="space-y-3">
            <p className="text-sm text-red-600">{errorMsg}</p>
            <div className="text-right">
              <button
                onClick={() => setErrorMsg(null)}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white"
              >
                بند کریں
              </button>
            </div>
          </div>
        </Modal>
      </StudentLayout>
    );
  }

  if (error || !student) {
    return (
      <StudentLayout>
        <div className="p-10 text-center text-red-500 font-urdu bg-red-50 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">
          {error || "طالب علم کا ڈیٹا دستیاب نہیں۔"}
        </div>
      </StudentLayout>
    );
  }

  // If request is not approved, show "Apply" UI
  if (requestStatus !== "approved") {
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto mt-20 text-center font-urdu p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-4">سندِ فراغت</h2>

          {requestStatus === "pending" ? (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
              <div className="flex items-center justify-center gap-2 text-amber-700 font-bold mb-2">
                <Clock className="w-5 h-5" />
                درخواست زیرِ غور ہے
              </div>
              <p className="text-gray-600 text-sm">
                آپ کی سند کی درخواست ایڈمن کو بھیج دی گئی ہے۔ براہِ کرم منظوری
                کا انتظار کریں۔
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-8 leading-relaxed">
                سند حاصل کرنے یا پرنٹ کرنے کے لیے آپ کو پہلے درخواست جمع کروانی
                ہوگی۔ ایڈمن کی منظوری کے بعد آپ اسے یہاں دیکھ سکیں گے۔
              </p>
              <button
                onClick={handleApply}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                سند کے لیے درخواست دیں
              </button>
            </>
          )}

          <div className="mt-8 text-xs text-gray-400">
            Islamic University Management System
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <Head>
        <title>Academic Sanad - {student.fullName}</title>
      </Head>

      <div
        className="w-full max-w-[297mm] mx-auto py-6 px-4 print:p-0"
        dir="rtl"
      >
        {/* Top Control Panel */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:hidden font-urdu no-print">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-600" />
            <h1 className="text-sm font-black text-gray-800">
              سندِ فراغت (Completion Certificate)
            </h1>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm shadow-md"
          >
            <Printer className="w-4 h-4" />
            سند پرنٹ کریں
          </button>
        </div>

        {/* ================= PREMIUM SANAD TEMPLATE ================= */}
        <div className="sanad-container relative bg-white overflow-hidden p-1">
          {/* Outer Decorative Border */}
          <div className="border-[12px] border-emerald-800 p-1 relative">
            <div className="border-4 border-yellow-500 p-8 min-h-[190mm] flex flex-col items-center justify-between text-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
              {/* Top Row - Religious Phrases */}
              <div className="w-full flex justify-between items-center mb-6 font-urdu text-[11px] font-bold text-gray-700">
                <div className="flex-1 text-right">
                  خیرکم من تعلم القرآن وعلمہ (الحدیث)
                </div>
                <div className="flex-1 text-center text-base font-black">
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </div>
                <div className="flex-1 text-left">
                  انا نحن نزلنا الذکر وانا لہ لحفظون (القرآن)
                </div>
              </div>

              {/* University Title */}
              <div className="w-full mb-6 z-10">
                <h2 className="text-4xl font-black text-emerald-900 mb-1 font-urdu tracking-tighter">
                  الجامعہ الاسلامیہ السلفیہ
                </h2>
                <p className="text-gray-500 text-[10px] font-sans tracking-[4px] font-bold uppercase">
                  Islamic University of Salafia
                </p>
                <p className="text-xs font-bold text-emerald-700 mt-1 font-urdu">
                  ماڈل ٹاؤن، گوجرانوالہ، پاکستان
                </p>
              </div>

              {/* Main Sanad Title */}
              <div className="relative mb-6 mt-2">
                <h3 className="relative text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-600 via-orange-600 to-red-600 font-urdu leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                  سند فراغت دورہ تجوید و قرائت
                </h3>
                <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-1"></div>
              </div>

              {/* Opening Arabic Praise */}
              <div className="text-emerald-700 text-lg font-bold mb-6 font-urdu opacity-90 max-w-4xl">
                اَلْحَمْدُ لِلّٰہِ رَبِّ الْعٰلَمِیْنَ وَالصَّلٰوۃُ وَالسَّلَامُ
                عَلٰی خَاتَمِ الْاَنْبِیَآئِ وَالْمُرْسَلِیْنَ وَعَلٰی اٰلِہٖ
                وَاَصْحٰبِہٖ اَجْمَعِیْنَ
              </div>

              {/* Main Content Body */}
              <div className="w-full max-w-5xl text-right leading-[3] text-lg font-urdu text-gray-800 px-6 mb-6">
                <div className="relative inline-block">
                  تصدیق کی جاتی ہے کہ قاری/قاریہ
                  <span className="inline-block min-w-[200px] border-b border-dotted border-gray-400 font-black text-xl text-emerald-900 px-4 mx-2 text-center">
                    {student.urduName || student.fullName}
                  </span>
                  بن / بنت
                  <span className="inline-block min-w-[200px] border-b border-dotted border-gray-400 font-black text-xl text-emerald-900 px-4 mx-2 text-center">
                    {student.fatherName || "—"}
                  </span>
                </div>
                <div className="relative inline-block">
                  ساکن
                  <span className="inline-block min-w-[350px] border-b border-dotted border-gray-400 font-bold text-base text-emerald-800 px-4 mx-2 text-center">
                    {student.address || "—"}
                  </span>
                  تاریخ پیدائش
                  <span className="inline-block min-w-[120px] border-b border-dotted border-gray-400 font-black font-sans text-base text-emerald-800 px-4 mx-2 text-center">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString(
                          "ur-PK"
                        )
                      : "—"}
                  </span>
                  نے
                </div>
                <div className="relative block">
                  جامعہ الاسلامیہ السلفیہ گوجرانوالہ سے
                  <span className="font-black text-emerald-900 px-2">
                    دورہ تجوید و قرائت
                  </span>
                  از
                  <span className="inline-block min-w-[100px] border-b border-dotted border-gray-400 font-bold font-sans text-base text-emerald-800 px-2 mx-1 text-center">
                    {new Date().getFullYear() - 1}-01-01
                  </span>
                  تا
                  <span className="inline-block min-w-[100px] border-b border-dotted border-gray-400 font-bold font-sans text-base text-emerald-800 px-2 mx-1 text-center">
                    {new Date().toLocaleDateString("en-CA")}
                  </span>
                  مکمل کیا ہے
                </div>
                <div className="relative block">
                  مندرجہ ذیل کتب پڑھیں اور مورخہ
                  <span className="inline-block min-w-[120px] border-b border-dotted border-gray-400 font-bold font-sans text-base text-emerald-800 px-4 mx-2 text-center">
                    {new Date().toLocaleDateString("en-PK")}
                  </span>
                  ء کو فارغ ہوا/ہوئی۔
                </div>
              </div>

              {/* Closing Prayer */}
              <div className="text-base font-bold text-gray-700 font-urdu max-w-4xl italic mb-6">
                اللہ تعالیٰ ان کو قرآن کریم کی تلاوت کرنے اور اس پر عمل کرنے کی
                توفیق عطا فرمائے۔ آمین بجاہ النبی الامین صلی اللہ علیہ وسلم
              </div>

              {/* Signatures Area */}
              <div className="w-full grid grid-cols-2 gap-20 mt-8 px-10">
                <div className="flex flex-col items-center">
                  <div className="w-full border-b-2 border-emerald-100 mb-2 h-12"></div>
                  <p className="text-lg font-black text-red-700 font-urdu">
                    دستخط ناظم اعلیٰ
                  </p>
                  <p className="text-[9px] text-gray-400 font-sans tracking-[2px] uppercase">
                    Registrar Signature
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full border-b-2 border-emerald-100 mb-2 h-12"></div>
                  <p className="text-lg font-black text-red-700 font-urdu">
                    دستخط معلم
                  </p>
                  <p className="text-[9px] text-gray-400 font-sans tracking-[2px] uppercase">
                    Teacher Signature
                  </p>
                </div>
              </div>

              {/* Bottom Accreditation */}
              <div className="mt-8 h-1 w-full bg-gradient-to-r from-emerald-800 via-yellow-500 to-emerald-800 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @font-face {
          font-family: "AlQalam Taj Nastaleeq";
          src: url("/fonts/alqalam-taj-nastaleeq/AlQalam Taj Nastaleeq Regular.ttf")
            format("truetype");
        }

        .font-urdu {
          font-family: "AlQalam Taj Nastaleeq", "Urdu", serif, system-ui;
        }

        .sanad-container {
          width: 100%;
          min-height: 200mm;
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.1);
        }

        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @page {
            size: A4 landscape;
            margin: 0;
          }

          /* General reset for print */
          header,
          nav,
          aside,
          footer,
          .no-print,
          nav,
          [role="navigation"] {
            display: none !important;
          }

          /* Ensure main layout doesn't interfere */
          div[class*="md:pr-64"],
          div.md\\:pr-64 {
            padding-right: 0 !important;
            margin-right: 0 !important;
          }

          .sanad-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 5mm !important;
            box-shadow: none !important;
            background-color: white !important;
            z-index: 99999 !important;
          }

          .sanad-container > div {
            height: 100% !important;
          }
        }
      `}</style>
    </StudentLayout>
  );
}
