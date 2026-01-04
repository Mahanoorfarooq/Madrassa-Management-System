import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import api from "@/utils/api";

interface StudentItem {
    _id: string;
    fullName: string;
    fatherName?: string;
    dateOfBirth?: string;
    cnic?: string;
    photoUrl?: string;
}

export default function StudentPrintReport() {
    const router = useRouter();
    const { departmentId, classId, sectionId, q, status } = router.query;

    const [students, setStudents] = useState<StudentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deptName, setDeptName] = useState("");
    const [className, setClassName] = useState("");

    useEffect(() => {
        if (!router.isReady) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Students with filters
                const params: any = { departmentId };
                if (q) params.q = q;
                if (classId) params.classId = classId;
                if (sectionId) params.sectionId = sectionId;
                if (status && status !== "All") params.status = status;

                const res = await api.get("/api/students", { params });
                setStudents(res.data?.students || []);

                // Fetch Department Name if ID exists
                if (departmentId) {
                    const dRes = await api.get(`/api/departments/${departmentId}`);
                    setDeptName(dRes.data?.department?.name || "");
                }

                // Fetch Class Name if ID exists
                if (classId) {
                    const cRes = await api.get(`/api/classes/${classId}`);
                    setClassName(cRes.data?.class?.className || cRes.data?.class?.name || "");
                }
            } catch (error) {
                console.error("Failed to fetch print data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router.isReady, departmentId, classId, sectionId, q, status]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString("en-PK");
        } catch {
            return dateString || "—";
        }
    };

    if (loading) return <div className="p-10 text-center font-urdu">لوڈ ہو رہا ہے...</div>;

    return (
        <div className="bg-white min-h-screen p-8 font-urdu" dir="rtl">
            <Head>
                <title>طلباء کی فہرست - پرنٹ</title>
            </Head>

            {/* Print Controls */}
            <div className="fixed top-4 left-4 print:hidden flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all font-urdu"
                >
                    پرنٹ کریں
                </button>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-gray-300 transition-all font-urdu"
                >
                    واپس
                </button>
            </div>

            {/* Header Section */}
            <div className="text-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-black mb-1 leading-normal">الجامعہ الاسلامیہ السلفیہ</h1>
                <h2 className="text-xl font-bold mb-3 leading-normal">جامع مسجد مکرم آھلحدیث</h2>
                <div className="text-xs bg-black text-white inline-block px-4 py-1 rounded-sm mb-4">
                    ماڈل ٹاؤن - گوجرانوالہ - پاکستان
                </div>
                <div className="flex justify-center gap-8 text-lg font-bold mt-1">
                    {deptName && (
                        <p className="bg-gray-50 px-4 py-1 rounded border border-gray-200">
                            <strong>شعبہ:</strong> {deptName}
                        </p>
                    )}
                    {className && (
                        <p className="bg-gray-50 px-4 py-1 rounded border border-gray-200">
                            <strong>مرحلہ / کلاس:</strong> {className}
                        </p>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto shadow-sm">
                <table className="w-full border-collapse border-[2px] border-black table-fixed">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-[1.5px] border-black px-1 py-1 w-[6%] text-center text-sm">لڑی نمبر</th>
                            <th className="border-[1.5px] border-black px-2 py-1 w-[22%] text-right text-sm">نام طالب علم</th>
                            <th className="border-[1.5px] border-black px-2 py-1 w-[20%] text-right text-sm">ولدیت</th>
                            <th className="border-[1.5px] border-black px-1 py-1 w-[15%] text-center text-sm">تاریخ پیدائش</th>
                            <th className="border-[1.5px] border-black px-1 py-1 w-[25%] text-center text-sm">شناختی کارڈ نمبر</th>
                            <th className="border-[1.5px] border-black px-1 py-1 w-[12%] text-center text-sm">تصویر</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student._id} className="break-inside-avoid">
                                <td className="border-[1.5px] border-black px-1 py-1 text-center font-bold text-lg">{index + 1}</td>
                                <td className="border-[1.5px] border-black px-2 py-1 font-bold text-lg leading-normal">{(student as any).urduName || student.fullName}</td>
                                <td className="border-[1.5px] border-black px-2 py-1 text-md font-bold leading-normal">{student.fatherName || "—"}</td>
                                <td className="border-[1.5px] border-black px-1 py-1 text-center font-sans text-sm font-bold" dir="ltr">{formatDate(student.dateOfBirth)}</td>
                                <td className="border-[1.5px] border-black px-1 py-1 text-center font-sans text-sm tracking-tighter font-bold whitespace-nowrap" dir="ltr">{student.cnic || "—"}</td>
                                <td className="border-[1.5px] border-black px-1 py-1 text-center">
                                    <div className="w-16 h-20 mx-auto border border-dashed border-gray-400 flex items-center justify-center bg-white overflow-hidden rounded-sm">
                                        {student.photoUrl ? (
                                            <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] font-urdu opacity-30">تصویر</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer / Meta (Optional) */}
            <div className="mt-8 text-[10px] text-gray-500 text-center print:block hidden font-sans">
                پرنٹ کی تاریخ: {new Date().toLocaleDateString("en-PK")} | الجامعہ الاسلامیہ السلفیہ
            </div>

            <style jsx global>{`
                @font-face {
                    font-family: 'AlQalam Taj Nastaleeq';
                    src: url('/fonts/AlQalamTajNastaleeq.ttf') format('truetype');
                }
                .font-urdu {
                    font-family: 'AlQalam Taj Nastaleeq', serif;
                    line-height: 1.5 !important;
                }
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                    }
                }
                table td {
                    vertical-align: middle;
                    padding-top: 4px;
                    padding-bottom: 4px;
                }
            `}</style>
        </div>
    );
}
