import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import Link from "next/link";

interface StudentListItem {
  _id: string;
  fullName: string;
  rollNumber: string;
  className?: string;
  section?: string;
  status: "Active" | "Left";
}

export default function StudentsListPage() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Left">("Active");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const params: any = {};
        if (search) params.q = search;
        if (status !== "All") params.status = status;
        const res = await axios.get("/api/students", { params });
        setStudents(res.data.students || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStudents();
  }, [search, status]);

  return (
    <div className="min-h-screen bg-lightBg flex">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar userName="ایڈمن" roleLabel="ایڈمن" />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-right">
                <h1 className="text-lg font-bold text-gray-800">
                  طلبہ کا ریکارڈ
                </h1>
                <p className="text-xs text-gray-500">
                  یہاں سے طلبہ کو تلاش کریں، نیا طالب علم شامل کریں یا موجودہ
                  ریکارڈ اپ ڈیٹ کریں۔
                </p>
              </div>
              <Link
                href="/students/new"
                className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                نیا طالب علم شامل کریں
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
              <div className="flex-1 flex flex-col text-right">
                <label className="text-xs text-gray-600 mb-1">
                  نام / رول نمبر سے تلاش کریں
                </label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 justify-end text-xs">
                <span className="text-gray-600">حیثیت:</span>
                <select
                  className="rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="All">تمام</option>
                  <option value="Active">فعال</option>
                  <option value="Left">نکل چکے</option>
                </select>
              </div>
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
                    <th className="px-3 py-2 font-semibold text-gray-700">
                      حیثیت
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700">
                      عمل
                    </th>
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
                        {s.rollNumber}
                      </td>
                      <td className="px-3 py-2">
                        {s.className || "-"}{" "}
                        {s.section ? ` / ${s.section}` : ""}
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
                          href={`/students/${s._id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          تفصیل
                        </Link>
                        <Link
                          href={`/students/${s._id}/edit`}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          ترمیم
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
