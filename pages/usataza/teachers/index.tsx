import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { UsatazaLayout } from "@/components/layout/UsatazaLayout";

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
    <UsatazaLayout title="اساتذہ">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">شعبہ</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">تمام</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">نام / عہدہ</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-end justify-end">
          <Link
            href="/usataza/teachers/new"
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            نیا استاد شامل کریں
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">نام</th>
              <th className="px-3 py-2 font-semibold text-gray-700">عہدہ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">رابطہ</th>
              <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{t.fullName}</td>
                <td className="px-3 py-2">{t.designation || "-"}</td>
                <td className="px-3 py-2">{t.contactNumber || "-"}</td>
                <td className="px-3 py-2 flex gap-2 justify-end">
                  <Link
                    href={`/usataza/teachers/${t._id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    تفصیل
                  </Link>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-gray-400 text-xs"
                  colSpan={4}
                >
                  کوئی ریکارڈ موجود نہیں۔
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </UsatazaLayout>
  );
}
