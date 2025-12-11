import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

interface ClassItem {
  _id: string;
  className: string;
}

const DEPT_TABS = [
  { code: "HIFZ", title: "حفظ القرآن" },
  { code: "NIZAMI", title: "درس نظامی" },
  { code: "TAJWEED", title: "تجوید" },
  { code: "WAFAQ", title: "وفاق المدارس" },
] as const;

type DeptCode = (typeof DEPT_TABS)[number]["code"];

export default function ClassesPage() {
  const router = useRouter();
  const deptCode = (router.query.dept as DeptCode) || ("HIFZ" as DeptCode);

  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [title, setTitle] = useState("");

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

  const addClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !departmentId) return;
    await api.post("/api/classes", { title, departmentId });
    setTitle("");
    const res = await api.get("/api/classes", { params: { departmentId } });
    setClasses(res.data?.classes || []);
  };

  const removeClass = async (id: string) => {
    if (!confirm("کیا آپ واقعی اس کلاس کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/classes/${id}`);
    const res = await api.get("/api/classes", { params: { departmentId } });
    setClasses(res.data?.classes || []);
  };

  return (
    <TalbaLayout title="کلاس و سیکشن مینجمنٹ">
      {/* Department tabs */}
      <div className="flex justify-end gap-2 mb-3 flex-wrap">
        {DEPT_TABS.map((d) => {
          const active = d.code === deptCode;
          return (
            <Link
              key={d.code}
              href={{ pathname: "/talba/classes", query: { dept: d.code } }}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:col-span-1">
          <h2 className="text-sm font-semibold text-right mb-3">نئی کلاس</h2>
          <form onSubmit={addClass} className="space-y-3 text-right">
            <input
              placeholder="مثلاً: حفظ پارہ ۱"
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700">
              شامل کریں
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-right mb-3">تمام کلاسز</h2>
          <div className="divide-y">
            {classes.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm text-gray-800">{c.className}</span>
                <div className="flex gap-2">
                  <Link
                    href={{
                      pathname: "/talba/sections",
                      query: { dept: deptCode, classId: c._id },
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    سیکشنز
                  </Link>
                  <button
                    onClick={() => removeClass(c._id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <p className="text-xs text-gray-500 text-right">
                ابھی کوئی کلاس موجود نہیں۔
              </p>
            )}
          </div>
        </div>
      </div>
    </TalbaLayout>
  );
}
