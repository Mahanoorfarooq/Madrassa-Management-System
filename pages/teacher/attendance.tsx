import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TeacherLayout } from "@/components/layout/TeacherLayout";

export default function TeacherAttendanceLanding() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/teacher/classes");
        setClasses(res.data?.classes || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
      }
    })();
  }, []);

  const go = () => {
    if (!classId || !sectionId) return;
    router.push(`/teacher/classes/${classId}/sections/${sectionId}`);
  };

  const sections =
    classes.find((c: any) => String(c.classId) === String(classId))?.sections ||
    [];

  return (
    <TeacherLayout title="حاضری">
      {error && (
        <div className="mb-3 rounded bg-red-100 text-red-700 text-sm px-3 py-2 text-right">
          {error}
        </div>
      )}
      <div className="bg-white border rounded p-4 text-right max-w-xl ml-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              کلاس منتخب کریں
            </label>
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSectionId("");
              }}
              className="w-full rounded border px-3 py-2 text-sm bg-white"
            >
              <option value="">—</option>
              {classes.map((c: any) => (
                <option key={c.classId || ""} value={c.classId || ""}>
                  {c.className || c.classId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              سیکشن منتخب کریں
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm bg-white"
              disabled={!classId}
            >
              <option value="">—</option>
              {sections.map((s: any) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.sectionName || s.sectionId}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={go}
            disabled={!classId || !sectionId}
            className="rounded bg-primary text-white px-5 py-2 text-sm disabled:opacity-60"
          >
            جائیں
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
}
