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
} from "lucide-react";

interface ClassItem {
  _id: string;
  className: string;
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

export default function ClassesPage() {
  const router = useRouter();
  const deptCode = (router.query.dept as DeptCode) || ("HIFZ" as DeptCode);

  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const currentTab = DEPT_TABS.find((d) => d.code === deptCode);

  useEffect(() => {
    const init = async () => {
      const deptRes = await api.get("/api/departments", {
        params: { code: deptCode, ensure: "true" },
      });
      const dept = deptRes.data?.department;
      if (dept?._id) {
        setDepartmentId(dept._id);
        const res = await api.get("/api/classes", {
          params: { departmentId: dept._id },
        });
        setClasses(res.data?.classes || []);
      }
    };
    init();
  }, [deptCode]);

  const addClass = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!title || !departmentId) return;
    setLoading(true);
    try {
      await api.post("/api/classes", { title, departmentId });
      setTitle("");
      const res = await api.get("/api/classes", { params: { departmentId } });
      setClasses(res.data?.classes || []);
    } finally {
      setLoading(false);
    }
  };

  const removeClass = async (id: string) => {
    if (!confirm("کیا آپ واقعی اس کلاس کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/classes/${id}`);
    const res = await api.get("/api/classes", { params: { departmentId } });
    setClasses(res.data?.classes || []);
  };

  return (
    <TalbaLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <BookOpen className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">کلاسز کا انتظام</h1>
              <p className="text-blue-100 text-sm">
                شعبہ جات کی کلاسز اور سیکشنز کو منظم کریں
              </p>
            </div>
          </div>
        </div>

        {/* Department Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">شعبہ منتخب کریں</h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            {DEPT_TABS.map((d) => {
              const active = d.code === deptCode;
              return (
                <Link
                  key={d.code}
                  href={{ pathname: "/talba/classes", query: { dept: d.code } }}
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
          {/* Add Class Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div
                  className={`${currentTab?.color} rounded-full p-2 text-white`}
                >
                  <PlusCircle className="w-5 h-5" />
                </div>
                نئی کلاس شامل کریں
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کلاس کا نام
                  </label>
                  <input
                    placeholder="مثلاً: حفظ پارہ ۱"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addClass(e as any);
                      }
                    }}
                  />
                </div>

                <button
                  onClick={addClass}
                  disabled={loading || !title}
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
              <div className="mt-6 bg-blue-50 border-r-4 border-blue-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-800 font-medium mb-1">
                      نوٹ:
                    </p>
                    <p className="text-xs text-blue-700">
                      کلاس شامل کرنے کے بعد آپ اس کے لیے سیکشن بنا سکتے ہیں
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Classes List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`${currentTab?.color} rounded-full p-2 text-white`}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {currentTab?.title} کی کلاسز
                </div>
                <span className="text-sm font-normal text-gray-600">
                  ({classes.length} کلاسز)
                </span>
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Search */}
              <div className="flex justify-end">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="تلاش کریں..."
                  className="w-full md:w-72 rounded-lg border-2 border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {classes.length > 0 ? (
                <div className="space-y-3">
                  {classes
                    .filter((c) =>
                      (c.className || "")
                        .toLowerCase()
                        .includes(q.toLowerCase())
                    )
                    .map((c, index) => (
                      <div
                        key={c._id}
                        className={`group rounded-xl border-2 border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-lg p-2 group-hover:bg-blue-200 transition-colors">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-800">
                                {c.className}
                              </h3>
                              <p className="text-xs text-gray-500">
                                کلاس نمبر: {index + 1}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={{
                                pathname: "/talba/sections",
                                query: { dept: deptCode, classId: c._id },
                              }}
                              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            >
                              <Users className="w-4 h-4" />
                              سیکشنز
                            </Link>
                            <button
                              onClick={() => removeClass(c._id)}
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
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">
                    ابھی کوئی کلاس موجود نہیں
                  </p>
                  <p className="text-xs text-gray-400">
                    پہلی کلاس شامل کرنے کے لیے سائیڈ فارم استعمال کریں
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
