import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

export default function SyllabusPage() {
  const router = useRouter();
  const deptCode =
    (router.query.dept as "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ") || "HIFZ";

  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<{ _id: string; label: string }[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const deptRes = await api.get("/api/departments", {
        params: { code: deptCode, ensure: "true" },
      });
      const dept = deptRes.data?.department;
      if (dept?._id) {
        setDepartmentId(dept._id);
        const classesRes = await api.get("/api/classes", {
          params: { departmentId: dept._id },
        });
        const cls = (classesRes.data?.classes || []).map((c: any) => ({
          _id: c._id,
          label: c.className || c.title,
        }));
        setClasses(cls);
      }
    };
    init();
  }, [deptCode]);

  const loadItems = async (deptId: string, clsId?: string) => {
    const res = await api.get("/api/syllabus", {
      params: { departmentId: deptId, classId: clsId },
    });
    setItems(res.data?.syllabus || []);
  };

  useEffect(() => {
    if (departmentId) loadItems(departmentId, classId);
  }, [departmentId, classId]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !title) return;
    await api.post("/api/syllabus", {
      departmentId,
      classId,
      title,
      description,
    });
    setTitle("");
    setDescription("");
    loadItems(departmentId, classId);
  };

  const updateProgress = async (id: string, progress: number) => {
    await api.put(`/api/syllabus/${id}`, { progress });
    loadItems(departmentId, classId);
  };

  return (
    <TalbaLayout title="نصاب">
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
              <option value="">تمام</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600 mb-1 block">نیا آئٹم</label>
            <form
              onSubmit={addItem}
              className="grid grid-cols-1 md:grid-cols-3 gap-2"
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان"
                className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفصیل"
                className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
              />
              <button className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700">
                شامل کریں
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right">
        <h2 className="text-sm font-semibold mb-3">نصاب کی فہرست</h2>
        <div className="divide-y">
          {items.map((i) => (
            <div key={i._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-800">{i.title}</div>
                {i.description && (
                  <div className="text-xs text-gray-500">{i.description}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">ترقی:</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={i.progress || 0}
                  onChange={(e) =>
                    updateProgress(i._id, Number(e.target.value))
                  }
                />
                <span className="text-xs text-gray-800 w-8 text-center">
                  {i.progress || 0}%
                </span>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-gray-500">کوئی ریکارڈ موجود نہیں۔</p>
          )}
        </div>
      </div>
    </TalbaLayout>
  );
}
