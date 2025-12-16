import { useEffect, useState } from "react";
import api from "@/utils/api";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Award, Printer, FileText, Download } from "lucide-react";

export default function CertificatesDoc() {
  const [student, setStudent] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const s = await api.get("/api/students/me");
      setStudent(s.data?.student || null);
      // If you have a real certificates API, call it here. Placeholder empty list for now.
      setCerts([]);
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <div className="p-6 max-w-5xl mx-auto print:p-0" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">سرٹیفیکیٹس</h2>
                <p className="text-amber-100 text-sm">
                  تعلیمی سرٹیفکیٹس اور اسناد
                </p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-all border border-white/30"
            >
              <Printer className="w-4 h-4" />
              پرنٹ
            </button>
          </div>
        </div>

        {/* Student Info */}
        {student && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 print:border-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">نام: </span>
                <span className="font-semibold text-gray-800">
                  {student.fullName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">رول نمبر: </span>
                <span className="font-semibold text-gray-800">
                  {student.rollNumber}
                </span>
              </div>
              <div>
                <span className="text-gray-600">کلاس: </span>
                <span className="font-semibold text-gray-800">
                  {student.className || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Certificates List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden print:shadow-none print:border">
          <div className="p-6">
            {certs.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                <div className="text-gray-500 text-sm mb-2">
                  ابھی کوئی سرٹیفیکیٹ دستیاب نہیں۔
                </div>
                <p className="text-xs text-gray-400">
                  جب آپ کے سرٹیفیکیٹس تیار ہو جائیں گے تو یہاں دستیاب ہوں گے۔
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {certs.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-amber-50/50 hover:border-amber-300 transition-all group print:border-gray-300"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800 mb-1">
                            {c.title}
                          </div>
                          {c.date && (
                            <div className="text-xs text-gray-600">
                              تاریخ:{" "}
                              {new Date(c.date).toLocaleDateString("ur-PK")}
                            </div>
                          )}
                          {c.description && (
                            <div className="text-xs text-gray-600 mt-1">
                              {c.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0 w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center hover:bg-amber-200 transition-colors print:hidden"
                          title="ڈاؤن لوڈ"
                        >
                          <Download className="w-4 h-4 text-amber-600" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
          <p>یہ دستاویز الیکٹرانک طور پر تیار کی گئی ہے۔</p>
        </div>

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
            .print\\:border-0 {
              border: 0 !important;
            }
            .print\\:border-gray-300 {
              border-color: #d1d5db !important;
            }
          }
        `}</style>
      </div>
    </StudentLayout>
  );
}
