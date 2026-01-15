import { useEffect, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { BookOpen, ClipboardCheck, GraduationCap, Library } from "lucide-react";

export default function NisabDashboard() {
  const [syCount, setSyCount] = useState(0);
  const [exCount, setExCount] = useState(0);
  const [reCount, setReCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [s, e, r] = await Promise.all([
        api.get("/api/nisab/syllabus"),
        api.get("/api/nisab/exams"),
        api.get("/api/nisab/results"),
      ]);
      setSyCount((s.data?.syllabus || []).length);
      setExCount((e.data?.exams || []).length);
      setReCount((r.data?.results || []).length);
    };
    load();
  }, []);

  return (
    <NisabLayout title="نصاب ڈیش بورڈ">
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Library className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">نصاب ڈیش بورڈ</h1>
              <p className="text-white/80 text-sm mt-1">
                سلیبس، امتحانات اور نتائج کا مجموعی خلاصہ
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{syCount}</div>
            <div className="text-amber-100 text-sm font-medium">کل سلیبس</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{exCount}</div>
            <div className="text-emerald-100 text-sm font-medium">
              کل امتحانات
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{reCount}</div>
            <div className="text-amber-100 text-sm font-medium">کل نتائج</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 rounded-lg p-2">
              <Library className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                نصاب ماڈیول کا خلاصہ
              </h2>
              <p className="text-xs text-gray-500">تمام ماڈیولز کی تفصیل</p>
            </div>
          </div>
          <SimpleBarChart
            title=""
            labels={["سلیبس", "امتحانات", "نتائج"]}
            values={[syCount, exCount, reCount]}
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-200 rounded-lg p-2">
                <BookOpen className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-gray-800">سلیبس</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {syCount > 0
                ? `${syCount} سلیبس موجود ہیں جو مختلف شعبہ جات کے لیے ہیں۔`
                : "ابھی تک کوئی سلیبس شامل نہیں کیا گیا۔"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-200 rounded-lg p-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-gray-800">امتحانات</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {exCount > 0
                ? `${exCount} امتحانات مختلف کلاسز کے لیے منظم کیے گئے ہیں۔`
                : "ابھی تک کوئی امتحان منعقد نہیں ہوا۔"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-200 rounded-lg p-2">
                <GraduationCap className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-gray-800">نتائج</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {reCount > 0
                ? `${reCount} طلبہ کے نتائج محفوظ کیے گئے ہیں۔`
                : "ابھی تک کوئی نتیجہ اعلان نہیں ہوا۔"}
            </p>
          </div>
        </div>
      </div>
    </NisabLayout>
  );
}
