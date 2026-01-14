import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import { Modal } from "@/components/ui/Modal";
import {
  BookOpen,
  Plus,
  Trash2,
  BarChart3,
  Filter,
  Layers,
} from "lucide-react";

const DEPT_TABS = [
  {
    code: "HIFZ",
    title: "حفظ القرآن",
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    code: "NIZAMI",
    title: "درس نظامی",
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
  { code: "TAJWEED", title: "تجوید", color: "bg-cyan-500 hover:bg-cyan-600" },
  {
    code: "WAFAQ",
    title: "وفاق المدارس",
    color: "bg-amber-500 hover:bg-amber-600",
  },
] as const;

type DeptCode = (typeof DEPT_TABS)[number]["code"];

export default function SyllabusPage() {
  const router = useRouter();
  const deptCode = (router.query.dept as DeptCode) || ("HIFZ" as DeptCode);

  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<{ _id: string; label: string }[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  // loader removed per request
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const currentTab = DEPT_TABS.find((d) => d.code === deptCode);

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
    await loadItems(departmentId, classId);
  };

  const updateProgress = async (id: string, progress: number) => {
    await api.put(`/api/syllabus/${id}`, { progress });
    await loadItems(departmentId, classId);
  };

  const askRemove = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!deleteId) return;
    await api.delete(`/api/syllabus/${deleteId}`);
    await loadItems(departmentId, classId);
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const avgProgress =
    items.length > 0
      ? Math.round(
          items.reduce((sum, i) => sum + (i.progress || 0), 0) / items.length
        )
      : 0;

  return (
    <TalbaLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">نصاب کا انتظام</h1>
                <p className="text-white/80 text-xs">
                  نصاب کی تفصیلات اور پیشرفت
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <div>
                    <p className="text-[10px] text-white/80">اوسط پیشرفت</p>
                    <p className="text-lg font-bold">{avgProgress}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Department Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-bold text-gray-800">شعبہ منتخب کریں</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {DEPT_TABS.map((d) => {
              const active = d.code === deptCode;
              return (
                <Link
                  key={d.code}
                  href={{
                    pathname: "/talba/syllabus",
                    query: { dept: d.code },
                  }}
                  className={`text-xs font-semibold rounded-lg px-4 py-2 transition-all ${
                    active
                      ? `bg-primary text-white shadow-md`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {d.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Filter & Add Form */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">
              کلاس منتخب کریں اور نیا آئٹم شامل کریں
            </h2>
          </div>
          <form onSubmit={addItem} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  کلاس
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">تمام کلاسز</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  عنوان
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: سورۃ البقرہ"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  تفصیل
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اختیاری تفصیل"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!title}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
                >
                  <Plus className="w-4 h-4" />
                  <span>شامل کریں</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Syllabus Items */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm mb-1">
                کوئی نصاب آئٹم نہیں
              </p>
              <p className="text-xs text-gray-400">
                اوپر فارم استعمال کرکے نیا آئٹم شامل کریں
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mr-11">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">
                                پیشرفت
                              </span>
                              <span className="text-xs font-bold text-gray-800">
                                {item.progress || 0}%
                              </span>
                            </div>
                            <div className="relative">
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{
                                    width: `${item.progress || 0}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={item.progress || 0}
                            onChange={(e) =>
                              updateProgress(item._id, Number(e.target.value))
                            }
                            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => askRemove(item._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
        title="تصدیق حذف"
      >
        <div className="space-y-4 text-right">
          <p>کیا آپ واقعی اس آئٹم کو حذف کرنا چاہتے ہیں؟</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setConfirmOpen(false);
                setDeleteId(null);
              }}
              className="rounded border px-4 py-2 text-xs"
            >
              منسوخ کریں
            </button>
            <button
              onClick={confirmRemove}
              className="rounded bg-red-600 text-white px-4 py-2 text-xs font-semibold hover:bg-red-700"
            >
              حذف کریں
            </button>
          </div>
        </div>
      </Modal>
    </TalbaLayout>
  );
}
