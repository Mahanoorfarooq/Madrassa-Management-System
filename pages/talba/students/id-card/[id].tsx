import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import Head from "next/head";

export default function StudentIdCard() {
    const router = useRouter();
    const { id, autoprint } = router.query as { id?: string; autoprint?: string };

    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [printMode, setPrintMode] = useState<'front' | 'back' | 'both'>('both');

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

    useEffect(() => {
        if (autoprint === "true" && !loading && student) {
            setTimeout(() => {
                handlePrint('both');
            }, 1500);
        }
    }, [autoprint, loading, student]);

    const handlePrint = (mode: 'front' | 'back' | 'both') => {
        setPrintMode(mode);
        setTimeout(() => {
            window.print();
        }, 100);
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

    if (loading) return <div className="p-10 text-center font-urdu text-lg">لوڈ ہو رہا ہے...</div>;
    if (error) return <div className="p-10 text-center text-red-500 font-urdu">{error}</div>;
    if (!student) return <div className="p-10 text-center font-urdu text-lg">طالب علم نہیں ملا۔</div>;

    // Robust Photo URL resolution
    let photoSrc = null;
    if (student?.photoUrl) {
        photoSrc = student.photoUrl;
        if (!photoSrc.startsWith('http') && !photoSrc.startsWith('data:') && !photoSrc.startsWith('/')) {
            photoSrc = '/' + photoSrc;
        }
        // Add cache buster only if NOT data URI
        if (!photoSrc.startsWith('data:')) {
            photoSrc = `${photoSrc}${photoSrc.includes('?') ? '&' : '?'}t=${Date.now()}`;
        }
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
            <Head>
                <title>ID Card - {student.fullName}</title>
            </Head>

            <div className={`print:m-0 print:p-0 flex flex-col items-center gap-6 ${printMode}`}>

                {/* ================= FRONT SIDE ================= */}
                <div
                    id="id-card-front"
                    className={`relative bg-white shadow-2xl overflow-hidden font-sans border border-gray-100 print:shadow-none print:border-none page-break-after ${printMode === 'back' ? 'hidden-on-print' : ''}`}
                    style={{
                        width: '120mm',
                        height: '76mm',
                        borderRadius: '4mm',
                    }}
                >
                    {/* Top Header - Teal Background */}
                    <div
                        className="absolute top-0 left-0 right-0 h-[38%] bg-[#00695c] text-white flex items-center justify-between px-8"
                    >
                        {/* Logo on Left - Removed */}
                        <div className="z-10 w-[72px] h-[72px] flex items-center justify-center">
                            {/* Logo removed */}
                        </div>

                        {/* Title on Right - UPDATED Urdu & Sizes (White text, no border) */}
                        <div className="z-10 text-right font-urdu" dir="rtl">
                            <div className="text-[18px] font-bold leading-tight mb-0.5 opacity-90">الجامعہ الاسلامیہ السلفیہ</div>
                            <div className="text-[28px] font-black tracking-normal leading-none text-white">
                                طالب علم شناختی کارڈ
                            </div>
                        </div>
                    </div>

                    {/* Photo Section - Moved DOWN to center it more with info (46%) */}
                    <div className="absolute top-[46%] left-10 z-20">
                        <div className="w-[33mm] h-[33mm] rounded-full border-[5px] border-white overflow-hidden bg-gray-50 shadow-xl flex items-center justify-center">
                            {photoSrc ? (
                                <img
                                    src={photoSrc}
                                    alt={student.fullName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error("Image failed to load:", photoSrc);
                                        e.currentTarget.src = "/placeholder-avatar.png";
                                    }}
                                />
                            ) : (
                                <div className="text-gray-400 text-xs font-urdu text-center px-2">تصویر موجود نہیں</div>
                            )}
                        </div>
                    </div>

                    {/* Details Section - Moved Adjusted (44%) */}
                    <div className="absolute top-[44%] right-10 left-[48mm] text-right font-urdu" dir="rtl">
                        <div className="space-y-1">
                            <div className="border-b border-dashed border-gray-200 pb-1">
                                <div className="text-[9px] text-gray-400 font-bold leading-none mb-0.5">نام طالب علم:</div>
                                <div className="text-[18px] font-black text-gray-900 leading-tight">{student.urduName || student.fullName}</div>
                            </div>

                            <div>
                                <div className="text-[9px] text-gray-400 font-bold leading-none mb-0.5">شعبہ:</div>
                                <div className="text-[12px] font-bold text-gray-800 leading-none">{student.departmentName || "—"}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <div className="text-[9px] text-gray-400 font-bold leading-none mb-0.5">آئی ڈی نمبر:</div>
                                    <div className="text-[13px] font-bold text-gray-800 leading-none">{student.rollNumber || student.admissionNumber || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-gray-400 font-bold leading-none mb-0.5">کلاس:</div>
                                    <div className="text-[13px] font-bold text-gray-800 leading-none">{student.className || "—"}</div>
                                </div>
                            </div>

                            <div className="mt-1">
                                <div className="text-[9px] text-gray-400 font-bold leading-none mb-0.5">تاریخ پیدائش:</div>
                                <div className="text-[13px] font-bold text-gray-800 leading-none" dir="ltr">{formatDate(student.dateOfBirth)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-[#00695c]"></div>
                </div>

                {/* ================= BACK SIDE ================= */}
                <div
                    id="id-card-back"
                    className={`relative bg-white shadow-2xl overflow-hidden font-sans border border-gray-100 print:shadow-none print:border-none print:mt-4 ${printMode === 'front' ? 'hidden-on-print' : ''}`}
                    style={{
                        width: '120mm',
                        height: '76mm',
                        borderRadius: '4mm',
                    }}
                >
                    {/* Header Strip */}
                    <div className="absolute top-0 left-0 right-0 h-[10%] bg-[#00695c]"></div>

                    <div className="absolute top-[12%] left-6 right-6 bottom-[12%] flex flex-col justify-center gap-4 font-urdu text-right" dir="rtl">

                        {/* Student CNIC / ID Card Number */}
                        <div className="border-b border-gray-200 pb-2">
                            <div className="text-[10px] text-gray-400 font-bold leading-none mb-1 text-center">شناختی کارڈ نمبر (Student ID Card):</div>
                            <div className="text-[22px] font-black text-gray-900 tracking-wider text-center" dir="ltr">
                                {student.cnic || "—"}
                            </div>
                        </div>

                        {/* Address Block */}
                        <div className="flex-1">
                            <div className="text-[10px] text-gray-400 font-bold leading-none mb-1">مستقل پتہ:</div>
                            <div className="text-[13px] font-medium text-gray-800 leading-snug">
                                {student.address || student.guardianAddress || "پتہ دستیاب نہیں"}
                            </div>
                        </div>

                        {/* Terms / Lost & Found */}
                        <div className="text-[10px] text-gray-500 leading-tight border-t border-gray-200 pt-2 text-center">
                            یہ کارڈ گم ہونے کی صورت میں براہ کرم نیچے دیے گئے پتے پر ارسال فرمائیں یا ادارے سے رابطہ کریں۔
                            <div className="font-bold text-[#00695c] mt-0.5 text-[11px]">الجامعہ الاسلامیہ السلفیہ</div>
                        </div>
                    </div>

                    {/* Bottom Strip - Plain Teal, No Text */}
                    <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-[#00695c]"></div>
                </div>

                {/* Print Buttons */}
                <div className="flex flex-wrap justify-center gap-4 print:hidden mt-4">
                    <button
                        onClick={() => handlePrint('front')}
                        className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-teal-700 transition-all font-urdu"
                    >
                        فرنٹ پرنٹ
                    </button>
                    <button
                        onClick={() => handlePrint('back')}
                        className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-teal-700 transition-all font-urdu"
                    >
                        بیک پرنٹ
                    </button>
                    <button
                        onClick={() => handlePrint('both')}
                        className="bg-gray-800 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-gray-900 transition-all font-urdu"
                    >
                        دونوں سائیڈ پرنٹ
                    </button>
                </div>
            </div>

            <style jsx global>{`
        @font-face {
          font-family: 'AlQalam Taj Nastaleeq';
          src: url('/fonts/AlQalamTajNastaleeq.ttf') format('truetype');
        }
        .font-urdu {
          font-family: 'AlQalam Taj Nastaleeq', serif, system-ui;
        }
        @media print {
          body {
             background: white !important;
             margin: 0 !important;
             padding: 0 !important;
             -webkit-print-color-adjust: exact;
          }
          .min-h-screen {
             min-height: 0 !important;
             background: transparent !important;
             padding: 0 !important;
             display: block !important;
          }
          .print\\:hidden {
             display: none !important;
          }
          .print\\:mt-4 {
             margin-top: 10mm !important;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
          #id-card-front, #id-card-back {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            margin: 10mm auto !important; /* Center on page with some margin */
            page-break-inside: avoid;
          }
          .page-break-after {
            page-break-after: always;
          }
        }
      `}</style>
        </div>
    );
}
