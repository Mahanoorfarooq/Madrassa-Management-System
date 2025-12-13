import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Eye,
  GraduationCap,
  Layers,
} from "lucide-react";

interface StudentItem {
  _id: string;
  fullName: string;
  rollNumber?: string;
  className?: string;
  section?: string;
  status: "Active" | "Left";
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

export default function TalbaStudentsList() {
  const router = useRouter();
  const deptCode = (router.query.dept as DeptCode) || ("HIFZ" as DeptCode);

  const [departmentId, setDepartmentId] = useState<string>("");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<{ _id: string; label: string }[]>([]);
  const [sections, setSections] = useState<{ _id: string; label: string }[]>(
    []
  );

  const [search, setSearch] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [status, setStatus] = useState<"All" | "Active" | "Left">("All");
  const [loading, setLoading] = useState<boolean>(false);

  const currentTab = DEPT_TABS.find((d) => d.code === deptCode);

  // Load department and related classes/sections
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
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
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [deptCode]);

  // Load sections when class changes
  useEffect(() => {
    const loadSections = async () => {
      if (!departmentId || !classId) {
        setSections([]);
        return;
      }
      const res = await api.get("/api/sections", {
        params: { departmentId, classId },
      });
      const secs = (res.data?.sections || []).map((s: any) => ({
        _id: s._id,
        label: s.sectionName || s.name,
      }));
      setSections(secs);
    };
    loadSections();
  }, [departmentId, classId]);

  // Load students on filters change
  useEffect(() => {
    const loadStudents = async () => {
      if (!departmentId) return;
      setLoading(true);
      try {
        const params: any = { departmentId };
        if (search) params.q = search;
        if (classId) params.classId = classId;
        if (sectionId) params.sectionId = sectionId;
        if (status !== "All") params.status = status;
        const res = await api.get("/api/students", { params });
        setStudents(res.data?.students || []);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [departmentId, search, classId, sectionId, status]);

  const activeCount = students.filter((s) => s.status === "Active").length;
  const leftCount = students.filter((s) => s.status === "Left").length;

  return (
    <TalbaLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">طلباء کی فہرست</h1>
                <p className="text-blue-100 text-sm">
                  تمام طلباء کی تفصیلات دیکھیں اور تلاش کریں
                </p>
              </div>
            </div>
            <Link
              href={{
                pathname: "/talba/students/new",
                query: { dept: deptCode },
              }}
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg px-5 py-3 text-sm font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              نیا طالب علم
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs mb-1">کل طلباء</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-white/60" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs mb-1">فعال</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs mb-1">نکل چکے</p>
                  <p className="text-2xl font-bold">{leftCount}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-500/30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                </div>
              </div>
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
                  href={{
                    pathname: "/talba/students",
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

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">فلٹرز</h2>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  نام / رول نمبر / شناختی کارڈ نمبر
                </div>
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کلاس
              </label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId("");
                }}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سیکشن
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">تمام سیکشنز</option>
                {sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حیثیت
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
              >
                <option value="All">تمام</option>
                <option value="Active">فعال</option>
                <option value="Left">نکل چکے</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-2">
                  کوئی طالب علم نہیں ملا
                </p>
                <p className="text-xs text-gray-400">
                  فلٹرز تبدیل کریں یا نیا طالب علم شامل کریں
                </p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      نام طالب علم
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      رول نمبر
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      کلاس / سیکشن
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      حیثیت
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s, index) => (
                    <tr
                      key={s._id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">
                              {s.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {s.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-full">
                          {s.rollNumber || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700">
                          {s.className || "-"}
                          {s.section && (
                            <span className="text-gray-500">
                              {" "}
                              / {s.section}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            s.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              s.status === "Active"
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                          ></div>
                          {s.status === "Active" ? "فعال" : "نکل چکے"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={{
                            pathname: `/talba/students/${s._id}`,
                            query: { dept: deptCode },
                          }}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          تفصیل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </TalbaLayout>
  );
}
