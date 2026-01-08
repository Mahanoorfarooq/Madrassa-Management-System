import { useEffect, useState } from "react";
import api from "@/utils/api";
import Head from "next/head";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Printer, Award, FileText, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";

export default function TranscriptDoc() {
  const [student, setStudent] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Robust fetching
        const [studentRes, examsRes, requestRes] = await Promise.all([
          api
            .get("/api/students/me")
            .catch(() => ({ data: { student: null } })),
          api
            .get("/api/student/exams")
            .catch(() => ({ data: { results: [] } })),
          api
            .get("/api/student/document-requests")
            .catch(() => ({ data: { requests: [] } })),
        ]);

        setStudent(studentRes.data?.student || null);
        setResults(examsRes.data?.results || []);

        // Find if there's an approved request for transcript
        const transcriptReq = requestRes.data?.requests?.find(
          (r: any) => r.documentType === "transcript"
        );
        setRequestStatus(transcriptReq?.status || null);
      } catch (err: any) {
        console.error("Failed to load transcript data", err);
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
        documentType: "transcript",
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
      </StudentLayout>
    );
  }

  if (!student) {
    return (
      <StudentLayout>
        <div className="p-10 text-center text-red-500 font-urdu bg-red-50 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">
          طالب علم کا ریکارڈ نہیں ملا۔
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
            <FileText className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-4">
            تعلیمی ٹرانسکرپٹ
          </h2>

          {requestStatus === "pending" ? (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
              <div className="flex items-center justify-center gap-2 text-amber-700 font-bold mb-2">
                <Clock className="w-5 h-5" />
                درخواست زیرِ غور ہے
              </div>
              <p className="text-gray-600 text-sm">
                آپ کی ٹرانسکرپٹ کی درخواست ایڈمن کو بھیج دی گئی ہے۔ براہِ کرم
                منظوری کا انتظار کریں۔
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-8 leading-relaxed">
                ٹرانسکرپٹ دیکھنے یا پرنٹ کرنے کے لیے آپ کو پہلے درخواست جمع
                کروانی ہوگی۔ ایڈمن کی منظوری کے بعد آپ اسے یہاں دیکھ سکیں گے۔
              </p>
              <button
                onClick={handleApply}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                ٹرانسکرپٹ کے لیے درخواست دیں
              </button>
            </>
          )}

          <div className="mt-8 text-xs text-gray-400">
            Islamic University management System
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Calculate totals
  const totalMarks = results.reduce(
    (acc, curr) => acc + (curr.totalMarks || 0),
    0
  );
  const totalObtained = results.reduce(
    (acc, curr) => acc + (curr.totalObtained || 0),
    0
  );
  const percentage =
    totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : "0.00";

  return (
    <StudentLayout>
      <Head>
        <title>Transcript - {student.fullName}</title>
      </Head>

      <div
        id="transcript-main-wrapper"
        className="max-w-5xl mx-auto py-2 px-4 font-urdu text-right relative"
        dir="rtl"
      >
        {/* Print Button Wrapper - Strictly hidden on print */}
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 print:hidden no-print">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-gray-800 uppercase tracking-wide">
              تعلیمی ٹرانسکرپٹ
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-1.5 rounded-lg font-bold hover:bg-emerald-700 transition-all text-xs shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            پرنٹ کریں
          </button>
        </div>

        {/* ================= ACTUAL PRINT CONTENT ================= */}
        <div className="official-transcript-document bg-white flex flex-col min-h-[270mm]">
          {/* Professional Header - Smaller & Higher */}
          <div className="text-center py-2 border-b-2 border-emerald-900 mb-4">
            <h1 className="text-xl font-black leading-tight text-gray-950 mb-0.5 font-urdu uppercase">
              الجامعہ الاسلامیہ السلفیہ
            </h1>
            <h2 className="text-sm font-bold text-gray-700 mb-1 font-urdu">
              ماڈل ٹاؤن ، گوجرانوالہ
            </h2>

            <div className="inline-block mt-1">
              <div className="bg-emerald-900 text-white px-8 py-1 rounded shadow-md font-black text-sm relative z-10">
                تعلیمی ٹرانسکرپٹ
              </div>
            </div>
          </div>

          {/* Information Row - Single Line Layout */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100 mb-6 print:bg-transparent print:border-gray-200 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">نام طالب علم:</span>
              <span className="font-black text-gray-900 uppercase">
                {student.urduName || student.fullName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">رول نمبر:</span>
              <span className="font-black font-sans text-emerald-800" dir="ltr">
                {student.rollNumber || student.admissionNumber || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">شعبہ:</span>
              <span className="font-black text-gray-800">
                {student.departmentId?.name || student.departmentName || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">کلاس:</span>
              <span className="font-black text-gray-800">
                {student.className || student.classId?.className || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">تعلیمی سال:</span>
              <span className="font-black font-sans" dir="ltr">
                {new Date().getFullYear() - 1}-{new Date().getFullYear()}
              </span>
            </div>
          </div>

          {/* Results Table */}
          <div className="flex-grow mb-8">
            <h3 className="text-sm font-black text-emerald-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              نتائج کی تفصیل
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-white text-[12px] font-bold">
                  <th className="border border-gray-400 px-3 py-3 text-right">
                    امتحان
                  </th>
                  <th className="border border-gray-400 px-3 py-3 text-center">
                    مدت
                  </th>
                  <th className="border border-gray-400 px-3 py-3 text-center">
                    کل نمبر
                  </th>
                  <th className="border border-gray-400 px-3 py-3 text-center">
                    حاصل کردہ
                  </th>
                  <th className="border border-gray-400 px-3 py-3 text-center">
                    فیصد
                  </th>
                  <th className="border border-gray-400 px-3 py-3 text-center">
                    گریڈ
                  </th>
                </tr>
              </thead>
              <tbody className="text-[10px] text-gray-800 font-bold">
                {results.length > 0 ? (
                  results.map((res, idx) => {
                    const perc =
                      res.totalMarks > 0
                        ? ((res.totalObtained / res.totalMarks) * 100).toFixed(
                            1
                          )
                        : "0";
                    return (
                      <tr key={idx} className="border-b border-gray-300">
                        <td className="border border-gray-400 px-3 py-2">
                          {res.exam?.title || "—"}
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-center">
                          {res.exam?.term || "Annual"}
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-center font-sans">
                          {res.totalMarks || 100}
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-center font-black font-sans text-emerald-900 text-sm">
                          {res.totalObtained || 0}
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-center font-sans tracking-tight">
                          {perc}%
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-center font-black">
                          {res.grade ||
                            (Number(perc) >= 80
                              ? "A+"
                              : Number(perc) >= 60
                              ? "B"
                              : "C")}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-gray-400 px-3 py-8 text-center text-gray-400 italic"
                    >
                      کوئی ریکارڈ دستیاب نہیں۔
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-black text-[11px] print:bg-transparent">
                <tr className="border-t-2 border-emerald-900">
                  <td
                    colSpan={2}
                    className="border border-gray-400 px-3 py-3 text-right text-base text-gray-800"
                  >
                    مجموعی حاصل کردہ نمبرات:
                  </td>
                  <td className="border border-gray-400 px-3 py-3 text-center font-sans">
                    {totalMarks || 0}
                  </td>
                  <td className="border border-gray-400 px-3 py-3 text-center font-sans text-emerald-900 text-lg">
                    {totalObtained || 0}
                  </td>
                  <td className="border border-gray-400 px-3 py-3 text-center font-sans text-emerald-900 text-lg">
                    {percentage}%
                  </td>
                  <td className="border border-gray-400 px-3 py-3 text-center text-emerald-900 text-lg">
                    {Number(percentage) >= 80 ? "A+" : "B"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature Area - Pushed to Bottom */}
          <div className="mt-auto">
            <div className="grid grid-cols-2 gap-20 text-center pb-12">
              <div className="space-y-3">
                <div className="border-b border-gray-400 w-full"></div>
                <div>
                  <p className="text-xs font-black text-gray-900 font-urdu mb-0.5">
                    کنٹرولر امتحانات
                  </p>
                  <p className="text-[8px] text-gray-400 font-sans uppercase tracking-[2px]">
                    Controller Exams
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="border-b border-gray-400 w-full"></div>
                <div>
                  <p className="text-xs font-black text-gray-900 font-urdu mb-0.5">
                    مدیر / پرنسپل
                  </p>
                  <p className="text-[8px] text-gray-400 font-sans uppercase tracking-[2px]">
                    Official Principal
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-[7px] text-gray-400 uppercase font-sans tracking-[1px] opacity-60 mb-2">
              Generated by ITQANIFY Systems |{" "}
              {new Date().toLocaleDateString("en-PK")}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @font-face {
          font-family: "AlQalam";
          src: url("/fonts/alqalam-taj-nastaleeq/AlQalam Regular.ttf") format("truetype");
        }

        .font-urdu {
          font-family: "AlQalam", "Urdu", serif, system-ui;
        }

        @media print {
          /* Force layout elements to disappear */
          body {
            visibility: hidden !important;
            background: white !important;
          }

          .official-transcript-document,
          .official-transcript-document * {
            visibility: visible !important;
          }

          .official-transcript-document {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: calc(100% - 30mm) !important;
            margin: 0 !important;
            padding: 0 !important;
            height: calc(100% - 30mm) !important;
            left: 15mm !important;
            top: 15mm !important;
            z-index: 99999 !important;
            background: white !important;
            display: flex !important;
            flex-direction: column !important;
          }

          aside,
          header,
          nav,
          .no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
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
