import { useEffect, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">کل سلیبس</div>
          <div className="text-2xl font-bold">{syCount}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">کل امتحانات</div>
          <div className="text-2xl font-bold">{exCount}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-xs text-gray-500">کل نتائج</div>
          <div className="text-2xl font-bold">{reCount}</div>
        </div>
      </div>
    </NisabLayout>
  );
}
