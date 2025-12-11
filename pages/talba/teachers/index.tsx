import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

interface TeacherItem {
  _id: string;
  fullName: string;
  designation?: string;
  contactNumber?: string;
}

const DEPT_TABS = [
  { code: "HIFZ", title: "حفظ القرآن" },
  { code: "NIZAMI", title: "درس نظامی" },
  { code: "TAJWEED", title: "تجوید" },
  { code: "WAFAQ", title: "وفاق المدارس" },
] as const;

type DeptCode = (typeof DEPT_TABS)[number]["code"];

export default function TalbaTeachersList() {
  const router = useRouter();
  const deptCode = (router.query.dept as DeptCode) || ("HIFZ" as DeptCode);

  const [departmentId, setDepartmentId] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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
    <TalbaLayout title="اساتذہ">
      {/* Department tabs */}
      <div className="flex justify-end gap-2 mb-3 flex-wrap">
        {DEPT_TABS.map((d) => {
          const active = d.code === deptCode;
          return (
            <Link
              key={d.code}
              href={{ pathname: "/talba/teachers", query: { dept: d.code } }}
              className={`text-xs rounded-full border px-3 py-1 transition ${
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {d.title}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">نام / عہدہ</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">کل ریکارڈ: {teachers.length}</p>
        <Link
          href={{ pathname: "/talba/teachers/new", query: { dept: deptCode } }}
          className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          نیا استاد شامل کریں
        </Link>
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
            {teachers.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-gray-400 text-xs"
                  colSpan={4}
                >
                  اس وقت کوئی ریکارڈ موجود نہیں۔
                </td>
              </tr>
            )}
            {teachers.map((t) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{t.fullName}</td>
                <td className="px-3 py-2">{t.designation || "-"}</td>
                <td className="px-3 py-2">{t.contactNumber || "-"}</td>
                <td className="px-3 py-2 flex gap-2 justify-end">
                  <Link
                    href={{
                      pathname: `/talba/teachers/${t._id}`,
                      query: { dept: deptCode },
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    تفصیل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TalbaLayout>
  );
}
