import React from "react";
import Head from "next/head";

export default function AdmissionPrint() {
  return (
    <div className="min-h-screen bg-white p-8 font-urdu" dir="rtl">
      <Head>
        <title>داخلہ فارم</title>
      </Head>

      {/* Main Container */}
      <div className="mx-auto max-w-[21cm] border-2 border-black p-8 relative">
        {/* Corner Designs (Optional/Placeholder based on simple border for now) */}
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          {/* Photo Box */}
          <div className="w-32 h-40 border-2 border-black flex items-center justify-center rounded-lg">
            <span className="text-xl rotate-[-15deg]">تصویر</span>
          </div>

          {/* Title Area */}
          <div className="text-center flex-1">
            <h1 className="text-7xl font-bold leading-tight">داخلہ فارم</h1>
            <div className="bg-black text-white inline-block px-4 py-1 rounded-full text-lg mt-2 mb-2">
              برائے علوم اسلامیہ
            </div>
            <h2 className="text-3xl font-bold mt-2">
              الجامعہ الاسلامیہ السلفیہ جامع مسجد مکرم آھلحدیث
            </h2>
            <p className="text-sm mt-1 bg-black text-white inline-block px-2">
              صادق آباد - کوچہ نمبر 1 - پاکستان
            </p>
          </div>

          {/* Logo Section */}
          <div className="w-32 h-32 flex items-center justify-center">
             {/* Logo Placeholder */}
             <div className="w-28 h-28 border-2 border-black rounded-full flex items-center justify-center text-center text-xs p-1">
                جامعہ اسلامیہ سلفیہ
             </div>
          </div>
        </div>

        {/* Input Fields Section */}
        <div className="space-y-6 text-xl mt-8">
          {/* Row 1 */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">نام:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
            <div className="flex-1 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">ولدیت:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex gap-4 items-end">
            <div className="w-[60%] flex items-end">
               {/* This seems to be split in the image, scanning carefully */}
               {/* Looks like: Date of Birth ...... Caste: [ ] [ ] [ ] */}
               <span className="whitespace-nowrap font-bold ml-2">تاریخ پیدائش:</span>
               <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
             <div className="flex-1 flex items-end justify-end">
               <span className="whitespace-nowrap font-bold ml-2">قوم:</span>
               <div className="flex gap-1">
                 {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="w-8 h-8 border border-black"></div>
                 ))}
               </div>
             </div>
          </div>

          {/* Row 3 */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">سابقہ تعلیم:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
            <div className="flex-1 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">سابقہ تعلیمی مرکز:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
             <div className="w-24 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">پیشہ:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex gap-4 items-end">
             <div className="w-32 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">کلاس:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
            <div className="flex-1 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">گھر کا فون نمبر:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
             <div className="flex-1 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">ذاتی فون نمبر:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
          </div>

           {/* Row 5 */}
          <div className="flex gap-4 items-end">
             <div className="w-[60%] flex items-end">
               <span className="whitespace-nowrap font-bold ml-2">تاریخ اندراج:</span>
               <div className="flex gap-1">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="w-8 h-8 border border-black"></div>
                 ))}
               </div>
             </div>
            <div className="flex-1 flex items-end">
              <span className="whitespace-nowrap font-bold ml-2">مکمل پتہ:</span>
              <div className="border-b-2 border-dotted border-black flex-1"></div>
            </div>
          </div>
        </div>

        <hr className="border-black border-t-2 my-8" />

        {/* Rules Section */}
        <div>
           <div className="flex justify-center mb-6">
              <div className="bg-black text-white text-2xl font-bold px-8 py-2 rounded-full border-4 border-double border-white shadow-lg">
                قواعد و ضوابط
              </div>
           </div>

           <ol className="list-decimal list-inside space-y-3 text-xl leading-relaxed pr-4">
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
        <div className="flex justify-between items-end mt-16 px-8 text-xl">
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

      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
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
