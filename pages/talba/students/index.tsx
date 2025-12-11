import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

interface StudentItem {
  _id: string;
  fullName: string;
  rollNumber?: string;
  className?: string;
  section?: string;
  status: "Active" | "Left";
}

const DEPT_TABS = [
  { code: "HIFZ", title: "حفظ القرآن" },
  { code: "NIZAMI", title: "درس نظامی" },
  { code: "TAJWEED", title: "تجوید" },
  { code: "WAFAQ", title: "وفاق المدارس" },
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

  // Load department and related classes/sections
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        // Resolve department by code
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

  return (
    <TalbaLayout title="طلبہ مینجمنٹ">
      {/* Department tabs */}
      <div className="flex justify-end gap-2 mb-3 flex-wrap">
        {DEPT_TABS.map((d) => {
          const active = d.code === deptCode;
          return (
            <Link
              key={d.code}
              href={{ pathname: "/talba/students", query: { dept: d.code } }}
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-right">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">
            نام / رول نمبر
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">کلاس</label>
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
        <div>
          <label className="text-xs text-gray-600 mb-1 block">سیکشن</label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">تمام</option>
            {sections.map((s) => (
              <option key={s._id} value={s._id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">حیثیت</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">تمام</option>
            <option value="Active">فعال</option>
            <option value="Left">نکل چکے</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">کل ریکارڈ: {students.length}</p>
        <Link
          href={{ pathname: "/talba/students/new", query: { dept: deptCode } }}
          className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          نیا طالب علم شامل کریں
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">
                نام طالب علم
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">
                رول نمبر
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">
                کلاس / سیکشن
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">حیثیت</th>
              <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-gray-400 text-xs"
                  colSpan={5}
                >
                  اس وقت کوئی ریکارڈ موجود نہیں۔
                </td>
              </tr>
            )}
            {students.map((s) => (
              <tr key={s._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{s.fullName}</td>
                <td className="px-3 py-2 font-mono text-[11px]">
                  {s.rollNumber || "-"}
                </td>
                <td className="px-3 py-2">
                  {s.className || "-"} {s.section ? ` / ${s.section}` : ""}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      s.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.status === "Active" ? "فعال" : "نکل چکے"}
                  </span>
                </td>
                <td className="px-3 py-2 flex gap-2 justify-end">
                  <Link
                    href={{
                      pathname: `/talba/students/${s._id}`,
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
