import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import {
  BookOpen,
  PlusCircle,
  Trash2,
  Users,
  AlertCircle,
  Layers,
  ArrowRight,
} from "lucide-react";

interface Section {
  _id: string;
  sectionName: string;
}

interface ClassItem {
  _id: string;
  label: string;
}

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

export default function SectionsPage() {
  const router = useRouter();
  const deptCode = (router.query.dept as DeptCode) || ("HIFZ" as DeptCode);
  const initialClassId = (router.query.classId as string) || "";

  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState<string>(initialClassId);
  const [sections, setSections] = useState<Section[]>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const currentTab = DEPT_TABS.find((d) => d.code === deptCode);
  const selectedClass = classes.find((c) => c._id === classId);

  useEffect(() => {
    const init = async () => {
      const deptRes = await api.get("/api/departments", {
        params: { code: deptCode, ensure: "true" },
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
  }, [deptCode]);

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
    setLoading(true);
    try {
      await api.post("/api/sections", { name, departmentId, classId });
      setName("");
      const res = await api.get("/api/sections", {
        params: { departmentId, classId },
      });
      setSections(res.data?.sections || []);
    } finally {
      setLoading(false);
    }
  };

  const removeSection = async (id: string) => {
    if (!confirm("کیا آپ واقعی اس سیکشن کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/sections/${id}`);
    const res = await api.get("/api/sections", {
      params: { departmentId, classId },
    });
    setSections(res.data?.sections || []);
  };

  return (
    <TalbaLayout>
      <div className="space-y-6" dir="rtl">
        {/* Department Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">شعبہ منتخب کریں</h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            {DEPT_TABS.map((d) => {
              const active = d.code === deptCode;
              return (
                <Link
                  key={d.code}
                  href={{
                    pathname: "/talba/sections",
                    query: { dept: d.code },
                  }}
                  className={`text-sm font-semibold rounded-xl px-6 py-3 transition-all duration-200 transform hover:scale-105 ${
                    active
                      ? `${d.color} text-white shadow-lg`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {d.title}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Section Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div
                  className={`${currentTab?.color} rounded-full p-2 text-white`}
                >
                  <PlusCircle className="w-5 h-5" />
                </div>
                نیا سیکشن شامل کریں
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کلاس منتخب کریں
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300"
                  >
                    <option value="">کلاس منتخب کریں</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سیکشن کا نام
                  </label>
                  <input
                    placeholder="مثلاً: سیکشن الف"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!classId}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSection(e as any);
                      }
                    }}
                  />
                </div>

                <button
                  onClick={addSection}
                  disabled={loading || !name || !classId}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg ${currentTab?.color} text-white px-6 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>شامل ہو رہا ہے...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>شامل کریں</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-purple-50 border-r-4 border-purple-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-purple-800 font-medium mb-1">
                      نوٹ:
                    </p>
                    <p className="text-xs text-purple-700">
                      پہلے کلاس منتخب کریں، پھر سیکشن کا نام لکھیں
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`${currentTab?.color} rounded-full p-2 text-white`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <span>
                    {selectedClass
                      ? `${selectedClass.label} کے سیکشنز`
                      : "سیکشنز کی فہرست"}
                  </span>
                </div>
                <span className="text-sm font-normal text-gray-600">
                  ({sections.length} سیکشنز)
                </span>
              </h2>
            </div>

            <div className="p-6">
              {!classId ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">
                    پہلے کلاس منتخب کریں
                  </p>
                  <p className="text-xs text-gray-400">
                    سیکشنز دیکھنے کے لیے سائیڈ فارم سے کلاس منتخب کریں
                  </p>
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-3">
                  {sections.map((s, index) => (
                    <div
                      key={s._id}
                      className={`group rounded-xl border-2 border-gray-200 p-5 hover:border-purple-400 hover:shadow-md transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 rounded-lg p-2 group-hover:bg-purple-200 transition-colors">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800">
                              {s.sectionName}
                            </h3>
                            <p className="text-xs text-gray-500">
                              سیکشن نمبر: {index + 1}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => removeSection(s._id)}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">
                    ابھی کوئی سیکشن موجود نہیں
                  </p>
                  <p className="text-xs text-gray-400">
                    پہلا سیکشن شامل کرنے کے لیے سائیڈ فارم استعمال کریں
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TalbaLayout>
  );
}
