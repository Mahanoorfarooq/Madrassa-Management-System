import React from "react";
import localFont from "next/font/local";
import type { AdmissionData } from "@/types/admission";

type Props = {
  data?: AdmissionData;
};

// A4 dimensions in mm for accurate print sizing
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const urduFont = localFont({
  src: [
    {
      path: "../public/fonts/alqalam-taj-nastaleeq/AlQalam Taj Nastaleeq Regular.ttf",
      style: "normal",
      weight: "400",
    },
  ],
  variable: "--font-urdu",
});

export function AdmissionForm({ data }: Props) {
  const d = data;

  return (
    <div className={`${urduFont.className} print-container`} dir="rtl">
      <div className="sheet">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="w-24 h-28 border border-gray-400 flex items-center justify-center text-xs text-gray-600">
            تصویر
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold urdu-text leading-tight">
              داخلہ فارم
            </div>
            <div className="text-sm text-gray-700 urdu-text mt-1">
              الجامعۃ الاسلامیۃ السلفیۃ جامع مساجد اہلحدیث
            </div>
          </div>
          <div className="w-24" />
        </div>

        {/* Title Bar */}
        <div className="mx-6 mt-4 h-8 bg-gray-800 text-white rounded-sm flex items-center justify-center">
          <span className="text-sm">طلبہ کی معلومات</span>
        </div>

        {/* Main Section */}
        <div className="mt-4 px-6">
          <Row label="نام" value={d?.studentName} dotted />
          <Row label="ولدیت" value={d?.fatherName} dotted />
          <div className="grid grid-cols-2 gap-6">
            <Row label="قوم" value={d?.caste} dotted />
            <Row label="ولایت" value={d?.profession} dotted />
          </div>
          <div className="grid grid-cols-2 gap-6 mt-2">
            <Row label="کلاس" value={d?.class} dotted />
            <DateRow label="تاریخ پیدائش" value={d?.dateOfBirth} />
          </div>
          <div className="grid grid-cols-2 gap-6 mt-2">
            <Row label="فون نمبر" value={d?.homePhone} dotted />
            <Row label="ذاتی نمبر" value={d?.personalPhone} dotted />
          </div>
          <Row label="پتہ" value={d?.address} dotted long />
        </div>

        {/* Secondary Section */}
        <div className="mx-6 mt-6 h-8 bg-gray-800 text-white rounded-sm flex items-center justify-center">
          <span className="text-sm urdu-text">قواعد و ضوابط</span>
        </div>
        <div className="px-8 mt-4 text-[11pt] urdu-text text-gray-800 leading-7">
          <ol
            className="list-decimal list-inside space-y-1"
            style={{ direction: "rtl" }}
          >
            <li>بالغ ہونے پر نماز باجماعت کی پابندی ضروری ہے۔</li>
            <li>تعلیمی نظم و ضبط کی مکمل پابندی لازم ہے۔</li>
            <li>اساتذہ کی عزت و احترام اور احکامات کی پابندی لازم ہے۔</li>
            <li>
              جامعہ کے قوانین کے مطابق لباس اور ظاہری وضع قطع اختیار کریں۔
            </li>
            <li>بلا اجازت غیرحاضری اور چھٹی ناقابلِ قبول ہے۔</li>
            <li>جامعہ کی املاک کی حفاظت طالب علم کی ذمہ داری ہے۔</li>
            <li>کسی بھی قسم کی سیاسی/غیر تعلیمی سرگرمی ممنوع ہے۔</li>
            <li>غلط معلومات دینے کی صورت میں داخلہ منسوخ کیا جا سکتا ہے۔</li>
            <li>فیees و واجبات کی ادائیگی مقررہ مدت میں ضروری ہے۔</li>
            <li>دیگر ہدایات و ضوابط وقتاً فوقتاً جاری کیے جائیں گے۔</li>
          </ol>
        </div>

        {/* Previous education block */}
        <div className="px-6 mt-6">
          <Row label="سابقہ ادارہ" value={d?.previousSchool} dotted />
          <Row label="سابقہ تعلیم" value={d?.previousEducation} dotted />
          <DateRow label="تاریخ اندراج" value={d?.dateOfEntry} />
        </div>

        {/* Footer */}
        <div className="px-6 mt-8 grid grid-cols-3 gap-6">
          <SignBox title="سرپرست کے دستخط" />
          <SignBox title="کلرک کے دستخط" />
          <SignBox title="پرنسپل کے دستخط" />
        </div>
      </div>

      <style jsx>{`
        .print-container {
          width: ${A4_WIDTH_MM}mm;
          display: flex;
          justify-content: center;
        }
        .sheet {
          position: relative;
          width: ${A4_WIDTH_MM}mm;
          height: ${A4_HEIGHT_MM}mm;
          background: #fff;
          color: #111;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          border: 1px solid #d1d5db;
        }
        .urdu-text {
          font-family: inherit;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          html,
          body,
          #__next {
            height: auto;
          }
          body {
            background: #fff;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

function Row({
  label,
  value,
  long = false,
  dotted = false,
}: {
  label: string;
  value?: string;
  long?: boolean;
  dotted?: boolean;
}) {
  return (
    <div className={`flex items-end gap-4 ${long ? "mt-3" : "mt-2"}`}>
      <div className="shrink-0 w-48 text-sm text-gray-700 text-right">
        {label}
      </div>
      <div
        className={`flex-1 pb-1 min-h-[22px] urdu-text text-[12pt] ${
          dotted
            ? "border-b border-dotted border-gray-500"
            : "border-b border-gray-400"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function DateRow({ label, value }: { label: string; value?: string }) {
  const digits = (value || "").replace(/[^0-9]/g, "").slice(0, 8); // DDMMYYYY expected
  const boxes = new Array(8).fill("").map((_, i) => digits[i] || "");
  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="shrink-0 w-48 text-sm text-gray-700 text-right">
        {label}
      </div>
      <div className="flex items-center gap-1">
        {boxes.map((ch, idx) => (
          <div
            key={idx}
            className="w-6 h-7 border border-gray-500 rounded-[2px] flex items-center justify-center text-[11pt] urdu-text"
          >
            {ch}
          </div>
        ))}
      </div>
    </div>
  );
}

function SignBox({ title }: { title: string }) {
  return (
    <div className="h-24 border border-gray-400 rounded-sm flex items-end justify-center pb-2 text-sm text-gray-700">
      {title}
    </div>
  );
}

export default AdmissionForm;
