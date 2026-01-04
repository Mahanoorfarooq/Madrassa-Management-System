import React from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { connectDB } from "@/lib/db";
import { Student } from "@/schemas/Student";
import { Types } from "mongoose";

type StudentData = {
    _id: string;
    fullName: string;
    urduName?: string;
    fatherName?: string;
    dateOfBirth?: string;
    previousSchool?: string;
    className?: string;
    guardianPhone?: string;
    contactNumber?: string;
    admissionDate?: string;
    address?: string;
    photoUrl?: string;
    cnic?: string; // Added CNIC
};

interface Props {
    student: StudentData | null;
    error?: string;
}

export default function AdmissionForm({ student, error }: Props) {
    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    if (!student) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        return d.toLocaleDateString("en-PK");
    };

    return (
        <div className="bg-white font-urdu" dir="rtl">
            <Head>
                <title>داخلہ فارم - {student.urduName || student.fullName}</title>
            </Head>

            {/* Print Controls - Hidden during print */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-center gap-4 z-[100] print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-black text-white px-6 py-2 rounded-full font-bold shadow hover:bg-gray-800 transition-colors"
                >
                    داخلہ فارم پرنٹ کریں
                </button>
            </div>

            {/* Spacing for Fixed Header in View Mode */}
            <div className="pt-20 print:pt-0">
                {/* Main Container - A4 Size Fixed */}
                <div className="mx-auto w-[210mm] min-h-[297mm] p-6 relative flex flex-col" style={{ boxSizing: 'border-box' }}>

                    <div className="border-4 border-black h-full flex flex-col p-6 flex-grow rounded-xl">
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-4">
                            {/* Photo Box */}
                            <div className="w-28 h-36 border-2 border-black flex items-center justify-center rounded-lg overflow-hidden relative shadow-md">
                                {student.photoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-base rotate-[-15deg]">تصویر</span>
                                )}
                            </div>

                            {/* Title Area */}
                            <div className="text-center flex-1 pt-1">
                                <h1 className="text-4xl font-bold leading-none mb-1">داخلہ فارم</h1>
                                <div className="bg-black text-white inline-block px-4 py-0.5 rounded-full text-base mb-1 shadow-sm">
                                    برائے علوم اسلامیہ
                                </div>
                                <h2 className="text-2xl font-bold mt-1 leading-tight">
                                    الجامعہ الاسلامیہ السلفیہ جامع مسجد مکرم آھلحدیث
                                </h2>
                                <p className="text-xs mt-1 bg-black text-white inline-block px-3 py-0.5 rounded-sm">
                                    ماڈل ٹاؤن - گوجرانوالہ - پاکستان
                                </p>
                            </div>

                            {/* Logo Section - Removed as per request */}
                            <div className="w-28 h-28 flex items-center justify-center">
                                {/* Logo removed */}
                            </div>
                        </div>

                        {/* Input Fields Section */}
                        <div className="space-y-4 mt-2">
                            {/* Row 1 */}
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">نام:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-center font-bold text-lg">
                                        {student.urduName || student.fullName}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">ولدیت:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-center font-bold text-lg">
                                        {student.fatherName}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="flex gap-3 items-end">
                                <div className="flex-[0.8] flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">تاریخ پیدائش:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-center font-bold font-sans text-lg" dir="ltr">
                                        {formatDate(student.dateOfBirth)}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">شناختی کارڈ/ب فارم:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-center font-bold font-sans text-lg" dir="ltr">
                                        {student.cnic}
                                    </div>
                                </div>
                                <div className="flex-[0.6] flex items-end justify-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">قوم:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-6 h-6 border-2 border-black"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">سابقہ تعلیم:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1"></div>
                                </div>
                                <div className="flex-1 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">سابقہ تعلیمی مرکز:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-center font-bold text-base">
                                        {student.previousSchool}
                                    </div>
                                </div>
                                <div className="w-20 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">پیشہ:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1"></div>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="flex gap-3 items-end">
                                <div className="w-28 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">کلاس:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-center font-bold text-base">
                                        {student.className}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">گھر کا فون نمبر:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-center font-bold font-sans text-base" dir="ltr">
                                        {student.guardianPhone}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">ذاتی فون نمبر:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-center font-bold font-sans text-base" dir="ltr">
                                        {student.contactNumber}
                                    </div>
                                </div>
                            </div>

                            {/* Row 5 */}
                            <div className="flex gap-3 items-end">
                                <div className="w-[50%] flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">تاریخ اندراج:</span>
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="font-bold flex-1 text-center font-sans border-b-2 border-dotted border-black text-lg" dir="ltr">
                                            {formatDate(student.admissionDate)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-end">
                                    <span className="whitespace-nowrap font-bold ml-2 text-base">مکمل پتہ:</span>
                                    <div className="border-b-2 border-dotted border-black flex-1 text-xs leading-tight text-center font-bold truncate">
                                        {student.address}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-black border-t-2 my-6" />

                        {/* Rules Section */}
                        <div className="mb-2">
                            <div className="flex justify-center mb-4">
                                <div className="bg-black text-white text-xl font-bold px-6 py-0.5 rounded-full border-2 border-double border-white shadow-lg transform -skew-x-12">
                                    <span className="inline-block skew-x-12">قواعد و ضوابط</span>
                                </div>
                            </div>

                            <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed pr-2 text-justify">
                                <li>ہر طالب علم کیلئے ہر سبق میں وقت کی پابندی اور حاضری ضروری ہے۔</li>
                                <li>بیماری یا کسی ضروری کام کیلئے رخصت کی تحریری درخواست لازمی ہے۔</li>
                                <li>ہر طالب علم کیلئے پانچ وقتہ نماز باجماعت ادا کرنے کی پابندی ہے۔</li>
                                <li>نظم و نسق اور صفائی کے معاملات میں مدرسہ / جامعہ کے احکام کی پابندی لازمی ہے۔</li>
                                <li>جامعہ کے علمی، تعلیمی اور تربیتی اجتماعات کے علاوہ جامعہ میں کسی قسم کا اجلاس یا میٹنگ کرنے کی اجازت نہیں ہوگی۔</li>
                                <li>ہر طالب علم کیلئے اسلامی شعائر کا احترام، یونیفارم (سر کے بال، داڑھی) سنت کے مطابق رکھنا لازمی ہے۔</li>
                                <li>جامعہ کی کتب کی حفاظت ہر طالب علم کیلئے لازمی ہے۔</li>
                                <li>لائبریری، مسجد، جامعہ کی دیواروں اور کتابوں وغیرہ پر چاکنگ اور تحریر منع ہے۔</li>
                                <li>ہر طالب علم کیلئے اسمبلی / اسبوغ اجلاس میں حاضری ضروری ہے۔</li>
                                <li>اگر کسی طالب علم نے قواعد و ضوابط کی خلاف ورزی یا بد اخلاقی کا ارتکاب کیا تو اسے جامعہ سے خارج کر دیا جائے گا۔</li>
                            </ol>
                        </div>

                        {/* Footer Signatures */}
                        <div className="flex justify-between items-end mt-auto px-4 text-base font-bold">
                            <div className="text-center">
                                <div className="mb-2">دستخط طالب علم: ........................</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2">دستخط سرپرست: ........................</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2">دستخط انچارج داخلہ: ........................</div>
                            </div>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params as { id: string };

    try {
        await connectDB();
        const studentDoc = await Student.findById(id).lean();

        if (!studentDoc) {
            return {
                props: {
                    error: "طالب علم نہیں ملا۔",
                    student: null,
                },
            };
        }

        // Serialization for JSON
        const student = JSON.parse(JSON.stringify(studentDoc));

        return {
            props: {
                student,
            },
        };
    } catch (error) {
        console.error("Error fetching student:", error);
        return {
            props: {
                error: "ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔",
                student: null,
            },
        };
    }
};
