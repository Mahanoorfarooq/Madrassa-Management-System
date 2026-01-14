import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import {
  Users,
  Search,
  UserPlus,
  Eye,
  BookOpen,
  Phone,
  Briefcase,
  Layers,
} from "lucide-react";

interface TeacherItem {
  _id: string;
  fullName: string;
  designation?: string;
  contactNumber?: string;
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

export default function TalbaTeachersList() {
  const router = useRouter();
  const deptCode = (router.query.dept as DeptCode) || ("HIFZ" as DeptCode);

  const [departmentId, setDepartmentId] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const currentTab = DEPT_TABS.find((d) => d.code === deptCode);

  useEffect(() => {
    const init = async () => {
      const deptRes = await api.get("/api/departments", {
        params: { code: deptCode, ensure: "true" },
      });
      const dept = deptRes.data?.department;
      if (dept?._id) setDepartmentId(dept._id);
    };
    init();
  }, [deptCode]);

  useEffect(() => {
    const load = async () => {
      if (!departmentId) return;
      setLoading(true);
      try {
        const res = await api.get("/api/teachers", {
          params: { departmentId, q: search },
        });
        setTeachers(res.data?.teachers || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [departmentId, search]);

  return (
    <TalbaLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="bg-secondary rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <BookOpen className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">اساتذہ کی فہرست</h1>
                <p className="text-white/80 text-sm">
                  تمام اساتذہ کی تفصیلات دیکھیں اور تلاش کریں
                </p>
              </div>
            </div>
            <Link
              href={{
                pathname: "/talba/teachers/new",
                query: { dept: deptCode },
              }}
              className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-lg px-5 py-3 text-sm font-semibold shadow-lg transition-all"
            >
              <UserPlus className="w-5 h-5" />
              نیا استاد
            </Link>
          </div>

          {/* Stats Card */}
          <div className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-xs mb-1">کل اساتذہ</p>
                  <p className="text-3xl font-bold">{teachers.length}</p>
                </div>
                <Users className="w-10 h-10 text-white/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Department Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-bold text-gray-800">شعبہ منتخب کریں</h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            {DEPT_TABS.map((d) => {
              const active = d.code === deptCode;
              return (
                <Link
                  key={d.code}
                  href={{
                    pathname: "/talba/teachers",
                    query: { dept: d.code },
                  }}
                  className={`text-sm font-semibold rounded-xl px-6 py-3 transition-all duration-200 ${
                    active
                      ? `bg-primary text-white shadow-lg`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {d.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-bold text-gray-800">تلاش</h2>
            </div>
          </div>

          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-secondary" />
                  نام / عہدہ
                </div>
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="استاد کا نام یا عہدہ تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-2">
                  کوئی استاد نہیں ملا
                </p>
                <p className="text-xs text-gray-400">
                  تلاش تبدیل کریں یا نیا استاد شامل کریں
                </p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      نام
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      عہدہ
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      رابطہ نمبر
                    </th>
                    <th className="px-6 py-4 text-right font-bold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teachers.map((t, index) => (
                    <tr
                      key={t._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <span className="text-secondary font-bold text-sm">
                              {t.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {t.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {t.designation ? (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {t.designation}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {t.contactNumber ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-full">
                              {t.contactNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={{
                            pathname: `/talba/teachers/${t._id}`,
                            query: { dept: deptCode },
                          }}
                          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                          <Eye className="w-4 h-4 text-secondary" />
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
