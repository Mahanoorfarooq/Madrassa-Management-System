import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { UsatazaLayout } from "@/components/layout/UsatazaLayout";
import {
  Users,
  Search,
  UserPlus,
  Eye,
  BookOpen,
  Phone,
  Briefcase,
  Filter,
} from "lucide-react";

interface TeacherItem {
  _id: string;
  fullName: string;
  designation?: string;
  contactNumber?: string;
}
interface Dept {
  _id: string;
  name: string;
}

export default function UsatazaTeachersList() {
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [search, setSearch] = useState<string>("");
  // loader removed per request

  useEffect(() => {
    const loadDepts = async () => {
      const res = await api.get("/api/departments");
      setDepartments(res.data?.departments || []);
    };
    loadDepts();
  }, []);

  useEffect(() => {
    const loadTeachers = async () => {
      const params: any = {};
      if (departmentId) params.departmentId = departmentId;
      if (search) params.q = search;
      const res = await api.get("/api/teachers", { params });
      setTeachers(res.data?.teachers || []);
    };
    loadTeachers();
  }, [departmentId, search]);

  return (
    <UsatazaLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">اساتذہ کی فہرست</h1>
                <p className="text-indigo-100 text-xs">
                  تمام اساتذہ کی تفصیلات دیکھیں
                </p>
              </div>
            </div>
            <Link
              href="/usataza/teachers/new"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              نیا استاد
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <div>
                  <p className="text-[10px] text-indigo-100">کل اساتذہ</p>
                  <p className="text-lg font-bold">{teachers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800">فلٹرز</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                شعبہ
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">تمام شعبہ جات</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  نام / عہدہ
                </div>
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="استاد کا نام یا عہدہ تلاش کریں..."
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                کوئی استاد نہیں ملا
              </p>
              <p className="text-xs text-gray-400 mt-1">
                فلٹرز تبدیل کریں یا نیا استاد شامل کریں
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      نام
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      عہدہ
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      رابطہ نمبر
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teachers.map((t, index) => (
                    <tr
                      key={t._id}
                      className={`hover:bg-indigo-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-bold text-xs">
                              {t.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {t.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {t.designation ? (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700">
                              {t.designation}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {t.contactNumber ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-full">
                              {t.contactNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/usataza/teachers/${t._id}`}
                          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          تفصیل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </UsatazaLayout>
  );
}
