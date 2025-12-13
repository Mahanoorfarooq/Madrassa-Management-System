import { useEffect, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";
import { StatCard } from "@/components/ui/Card";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { BookOpen, ClipboardCheck, GraduationCap } from "lucide-react";

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
      <div className="space-y-4" dir="rtl">
        <p className="text-sm text-gray-600 text-right max-w-2xl ml-auto">
          یہاں سے آپ سلیبس، امتحانات اور نتائج کا مجموعی خلاصہ دیکھ سکتے ہیں،
          نیچے دیا گیا گراف بھی ایک نظر میں صورتحال واضح کرتا ہے۔
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="کل سلیبس"
            value={syCount}
            icon={<BookOpen className="w-4 h-4" />}
          />
          <StatCard
            title="کل امتحانات"
            value={exCount}
            icon={<ClipboardCheck className="w-4 h-4" />}
          />
          <StatCard
            title="کل نتائج"
            value={reCount}
            icon={<GraduationCap className="w-4 h-4" />}
          />
        </div>

        <SimpleBarChart
          title="نصاب ماڈیول کا خلاصہ"
          labels={["سلیبس", "امتحانات", "نتائج"]}
          values={[syCount, exCount, reCount]}
        />
      </div>
    </NisabLayout>
  );
}
