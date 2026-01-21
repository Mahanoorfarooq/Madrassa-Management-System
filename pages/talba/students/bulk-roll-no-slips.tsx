import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import api from "@/utils/api";

interface Student {
  _id: string;
  fullName: string;
  fatherName: string;
  rollNumber: string;
  admissionNumber: string;
  photoUrl?: string;
  dateOfBirth?: string;
  departmentId?: any;
  classId?: any;
  sectionId?: any;
  className?: string;
}

interface Exam {
  title: string;
  term: string;
  className: string;
  examDate: Date;
  papers?: {
    subject: string;
    date: string;
    startTime?: string;
    endTime?: string;
    room?: string;
  }[];
}

export default function BulkRollNoSlips() {
  const router = useRouter();
  const { ids, className: queryClassName } = router.query;
  const [students, setStudents] = useState<Student[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const loadData = async () => {
      try {
        let fetchedStudents: Student[] = [];

        if (ids) {
          const idList = Array.isArray(ids) ? ids : (ids as string).split(",");
          const studentPromises = idList.map((id) =>
            api.get(`/api/admin/student-id-card/${id}`),
          );
          const results = await Promise.all(studentPromises);
          fetchedStudents = results.map((r) => r.data?.student).filter(Boolean);
        } else if (queryClassName) {
          const res = await api.get("/api/students", {
            params: { className: queryClassName, limit: 100 },
          });
          fetchedStudents = res.data?.students || [];
        }

        setStudents(fetchedStudents);

        if (fetchedStudents.length > 0) {
          const cName =
            queryClassName ||
            fetchedStudents[0].className ||
            fetchedStudents[0].classId?.name;
          if (cName) {
            const eRes = await api.get("/api/nisab/exams", {
              params: { className: cName },
            });
            const foundExam =
              eRes.data?.exams?.find((x: any) => x.status !== "draft") ||
              eRes.data?.exams?.[0];
            setExam(foundExam);
          }
        }
      } catch (err) {
        console.error("Error loading bulk data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router.isReady, ids, queryClassName]);

  const handlePrint = () => {
    window.print();
  };

  if (loading)
    return <div className="p-8 text-center font-urdu">لوڈ ہو رہا ہے...</div>;
  if (students.length === 0)
    return (
      <div className="p-8 text-center font-urdu text-red-600">
        طلبہ کا ڈیٹا نہیں ملا۔
      </div>
    );

  const dummyPapers = [
    {
      subject: "حفظ القرآن الکریم",
      date: "26-01-2026",
      day: "سوموار",
      time: "02:00PM",
    },
    {
      subject: "ترجمة القرآن الکریم",
      date: "24-01-2026",
      day: "ہفتہ",
      time: "09:00AM",
    },
    {
      subject: "الحدیث ومصطلحه",
      date: "25-01-2026",
      day: "اتوار",
      time: "09:00AM",
    },
    { subject: "العقائد", date: "26-01-2026", day: "سوموار", time: "09:00AM" },
    {
      subject: "السيرة النبوية",
      date: "27-01-2026",
      day: "منگل",
      time: "09:00AM",
    },
    {
      subject: "النحو والصرف",
      date: "28-01-2026",
      day: "بدھ",
      time: "09:00AM",
    },
    {
      subject: "الانشاء والترجمة",
      date: "29-01-2026",
      day: "جمعرات",
      time: "09:00AM",
    },
    { subject: "جنرل ریاضی", date: "24-01-2026", day: "ہفتہ", time: "02:00PM" },
    { subject: "انگلش", date: "25-01-2026", day: "اتوار", time: "02:00PM" },
  ];

  const papersToDisplay =
    exam?.papers?.map((p) => ({
      subject: p.subject,
      date: new Date(p.date).toLocaleDateString("en-PK"),
      day: new Date(p.date).toLocaleDateString("ur-PK", { weekday: "long" }),
      time: p.startTime || "—",
    })) || dummyPapers;

  return (
    <div className="min-h-screen bg-white font-urdu" dir="rtl">
      <Head>
        <title>بلک رول نمبر سلپس</title>
      </Head>

      <div className="fixed left-4 top-4 flex gap-2 print:hidden z-50">
        <button
          onClick={() => router.back()}
          className="bg-gray-100 px-4 py-2 rounded text-sm font-sans hover:bg-gray-200 shadow-md"
        >
          Back
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-sans hover:bg-blue-700 shadow-md"
        >
          Print All Slips
        </button>
      </div>

      <div className="flex flex-col gap-8 p-4 print:p-0">
        {students.map((student, sIdx) => (
          <div
            key={student._id}
            className="max-w-[21cm] mx-auto border-2 border-black p-6 relative bg-white slip-container page-break"
          >
            {/* Header Section */}
            <div className="text-center mb-4">
              <h1 className="text-3xl font-black mb-1">
                الجامعہ الاسلامیہ السلفیہ
              </h1>
              <h2 className="text-lg font-bold mb-1">
                جامع مسجد مکرم آھلحدیث (ماڈل ٹاؤن گوجرانوالہ)
              </h2>
              <h2 className="text-xl font-bold mb-1">
                رول نمبر سلپ سال: 2026/1447
              </h2>
              <h3 className="text-lg font-bold underline underline-offset-4 decoration-2">
                {exam?.className ||
                  student.classId?.name ||
                  queryClassName ||
                  "ثانویہ عامہ"}
              </h3>
            </div>

            {/* Student Info & Photo Section */}
            <div className="flex gap-4 mb-6">
              <div className="w-36 h-44 border-2 border-black flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center opacity-30">
                    <span className="text-lg block">تصویر</span>
                    <span className="text-xs">موجود نہیں</span>
                  </div>
                )}
              </div>

              <table className="flex-1 border-collapse border-2 border-black text-xs">
                <tbody>
                  <tr>
                    <td className="border border-black bg-gray-100 p-1 font-bold w-24 text-center">
                      رول نمبر
                    </td>
                    <td className="border border-black p-1 px-3 font-black text-lg w-32">
                      {student.rollNumber || student.admissionNumber || "—"}
                    </td>
                    <td className="border border-black bg-gray-100 p-1 font-bold w-32 text-center">
                      امتحانی شناختی نمبر
                    </td>
                    <td className="border border-black p-1 px-3 font-bold">
                      {"4356-WMS(A)-26"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black bg-gray-100 p-1 font-bold text-center">
                      نام
                    </td>
                    <td className="border border-black p-1 px-3 font-bold text-base">
                      {student.fullName}
                    </td>
                    <td className="border border-black bg-gray-100 p-1 font-bold text-center">
                      ولدیت
                    </td>
                    <td className="border border-black p-1 px-3 font-bold">
                      {student.fatherName}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black bg-gray-100 p-1 font-bold text-center">
                      تاریخ پیدائش
                    </td>
                    <td
                      className="border border-black p-1 px-3 font-bold font-sans"
                      dir="ltr"
                    >
                      {student.dateOfBirth
                        ? new Date(student.dateOfBirth).toLocaleDateString(
                            "en-PK",
                          )
                        : "—"}
                    </td>
                    <td className="border border-black bg-gray-100 p-1 font-bold text-center">
                      الحاق نمبر
                    </td>
                    <td className="border border-black p-1 px-3 font-bold">
                      {"100224"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black bg-gray-100 p-1 font-bold text-center">
                      مدرسہ کا نام
                    </td>
                    <td
                      colSpan={3}
                      className="border border-black p-1 px-3 font-bold"
                    >
                      الجامعہ الاسلامیہ السلفیہ ماڈل ٹاؤن گوجرانوالہ
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black bg-gray-100 p-1 font-bold text-center">
                      امتحانی مرکز
                    </td>
                    <td
                      colSpan={3}
                      className="border border-black p-1 px-3 font-bold"
                    >
                      الجامعہ الاسلامیہ السلفیہ ماڈل ٹاؤن گوجرانوالہ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Date Sheet Table */}
            <div className="mb-4">
              <table className="w-full border-collapse border-2 border-black text-center text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border-2 border-black p-1.5 w-[15%]">وقت</th>
                    <th className="border-2 border-black p-1.5 w-[15%]">دن</th>
                    <th className="border-2 border-black p-1.5 w-[20%]">
                      تاریخ
                    </th>
                    <th className="border-2 border-black p-1.5 w-[50%]">
                      مضمون
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!exam?.papers?.length ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="border-2 border-black p-8 text-center text-red-600 bg-red-50"
                      >
                        <p className="text-xl font-bold mb-2">
                          اس کلاس کے لیے ابھی تک کوئی امتحانی شیڈول (Date Sheet)
                          نہیں بنایا گیا۔
                        </p>
                        <p className="text-sm">
                          براہِ کرم &quot;نصاب&quot; ماڈیول میں جا کر
                          &quot;امتحانات&quot; سیکشن میں اس کلاس کا شیڈول تیار
                          کریں۔
                        </p>
                      </td>
                    </tr>
                  ) : (
                    papersToDisplay.map((paper, pIdx) => (
                      <tr key={pIdx}>
                        <td
                          className="border-2 border-black p-2 font-sans text-base"
                          dir="ltr"
                        >
                          {paper.time}
                        </td>
                        <td className="border-2 border-black p-2">
                          {paper.day}
                        </td>
                        <td
                          className="border-2 border-black p-2 font-sans text-base"
                          dir="ltr"
                        >
                          {paper.date}
                        </td>
                        <td className="border-2 border-black p-2 font-bold">
                          {paper.subject}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Instructions Section */}
            <div className="border-t border-black pt-4">
              <h4 className="text-xl font-black mb-2 text-center underline decoration-1">
                ہدایات و تعلیمات
              </h4>
              {/* Changed <ul> to <ol> to support 'start' property if needed, although not using it here to avoid errors */}
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] leading-snug pr-2">
                <li>
                  امیدوار کا امتحانی مرکز میں پرچہ شروع ہونے سے 15 منٹ قبل آنا
                  ضروری ہے۔
                </li>
                <li>
                  امیدوار اصل رول نمبر سلپ ہمراہ لائے گا بصورت دیگر اسے امتحان
                  میں شرکت کی اجازت نہیں ہوگی۔
                </li>
                <li>
                  امیدوار کو کمرہ امتحان میں ایسا مواد لانے کی اجازت نہیں ہے جو
                  امتحان میں مدد دے سکتا ہو۔
                </li>
                <li>
                  امیدوار کو کمرہ امتحان میں موبائل فون لانے کی اجازت نہیں ہے۔
                </li>
                <li>
                  دورانِ امتحانات ایک دوسرے سے مدد لینا اور دینا جرم ہے۔ ایسا
                  کرنے پر نگران عملہ امیدوار کو کمرہ امتحان سے باہر نکال سکتا
                  ہے۔
                </li>
                <li>
                  امیدوار صرف ان ہی مضامین کا امتحان دے سکتا ہے جو رول نمبر سلپ
                  پر درج ہیں، اگر اس میں کوئی غلطی ہو تو امتحان سے قبل دفتر وفاق
                  سے اس کی تصحیح کروالی جائے۔
                </li>
                <li>
                  امیدوار کے لیے مقرر کردہ امتحانی مرکز کسی حالت میں تبدیل نہیں
                  کیا جائے گا۔
                </li>
                <li>
                  امیدوار اپنا شناختی کارڈ (شناختی کارڈ نہ ہونے کی صورت میں کوئی
                  شناختی ثبوت) اپنے پاس رکھے تاکہ نگران عملہ جان سکے کہ اصل
                  امیدوار ہی امتحان دے رہا ہے۔
                </li>
                <li>
                  یہ رول نمبر سلپ مشروط جاری کی جارہی ہے اگر کسی امیدوار کی غلط
                  بیانی ثابت ہوجائے تو اس کو کالعدم قرار دیا جاسکتا ہے۔
                </li>
              </ol>
            </div>
          </div>
        ))}
      </div>

      {/* Fixing 'jsx' error by using a style tag with a template literal string if needed, 
                but standard Next.js uses 'jsx' attribute. To satisfy TS if configuration is weird: */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @font-face {
                    font-family: 'AlQalam';
                    src: url('/fonts/AlQalamTajNastaleeq.ttf') format('truetype');
                }
                .font-urdu {
                    font-family: 'AlQalam', serif;
                    line-height: 1.6;
                }
                @media print {
                    @page {
                        size: A4;
                        margin: 0mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        page-break-after: always;
                        border: none !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        height: 297mm;
                        width: 210mm;
                    }
                    .slip-container {
                        box-shadow: none !important;
                    }
                }
            `,
        }}
      />
    </div>
  );
}
