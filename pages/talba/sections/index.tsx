import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

export default function SectionsPage() {
  const router = useRouter();
  const dept =
    (router.query.dept as "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ") || "HIFZ";
  const initialClassId = (router.query.classId as string) || "";

  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<{ _id: string; label: string }[]>([]);
  const [classId, setClassId] = useState<string>(initialClassId);
  const [sections, setSections] = useState<
    { _id: string; sectionName: string }[]
  >([]);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const deptRes = await api.get("/api/departments", {
        params: { code: dept, ensure: "true" },
      });
      const d = deptRes.data?.department;
      if (d?._id) {
        setDepartmentId(d._id);
        const classesRes = await api.get("/api/classes", {
          params: { departmentId: d._id },
        });
        const cls = (classesRes.data?.classes || []).map((c: any) => ({
          _id: c._id,
          label: c.className || c.title,
        }));
        setClasses(cls);
      }
    };
    init();
  }, [dept]);

  useEffect(() => {
    const loadSections = async () => {
      if (!departmentId || !classId) {
        setSections([]);
        return;
      }
      const res = await api.get("/api/sections", {
        params: { departmentId, classId },
      });
      setSections(res.data?.sections || []);
    };
    loadSections();
  }, [departmentId, classId]);

  const addSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !classId || !name) return;
    await api.post("/api/sections", { name, departmentId, classId });
    setName("");
    const res = await api.get("/api/sections", {
      params: { departmentId, classId },
    });
    setSections(res.data?.sections || []);
  };

  return (
    <TalbaLayout title="سیکشنز">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 text-right">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              کلاس منتخب کریں
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">منتخب کریں</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600 mb-1 block">
              نیا سیکشن
            </label>
            <form onSubmit={addSection} className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700">
                شامل کریں
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right">
        <h2 className="text-sm font-semibold mb-3">سیکشنز کی فہرست</h2>
        <div className="divide-y">
          {sections.map((s) => (
            <div key={s._id} className="py-3 flex items-center justify-between">
              <span className="text-sm text-gray-800">{s.sectionName}</span>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-xs text-gray-500">کوئی سیکشن موجود نہیں۔</p>
          )}
        </div>
      </div>
    </TalbaLayout>
  );
}
