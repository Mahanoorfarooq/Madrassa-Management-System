import { useEffect, useState } from "react";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";

export default function AttendancePage() {
  const [deptCode, setDeptCode] = useState<
    "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ"
  >("HIFZ");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<{ _id: string; label: string }[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<
    Record<string, "Present" | "Absent" | "Leave">
  >({});

  useEffect(() => {
    const init = async () => {
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
    };
    init();
  }, [deptCode]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!departmentId || !classId) {
        setStudents([]);
        setMarks({});
        return;
      }
      const res = await api.get("/api/students", {
        params: { departmentId, classId },
      });
      const list = res.data?.students || [];
      setStudents(list);
      const initial: Record<string, any> = {};
      list.forEach((s: any) => (initial[s._id] = "Present"));
      setMarks(initial);
    };
    loadStudents();
  }, [departmentId, classId]);

  const setMark = (id: string, status: "Present" | "Absent" | "Leave") => {
    setMarks((m) => ({ ...m, [id]: status }));
  };

  const saveAttendance = async () => {
    for (const s of students) {
      await api.post("/api/attendance", {
        studentId: s._id,
        departmentId,
        classId,
        date,
        status: marks[s._id] || "Present",
      });
    }
    alert("حاضری محفوظ ہو گئی");
  };

  return (
    <TalbaLayout title="حاضری">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 text-right">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">شعبہ</label>
            <select
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value as any)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="HIFZ">حفظ القرآن</option>
              <option value="NIZAMI">درس نظامی</option>
              <option value="TAJWEED">تجوید</option>
              <option value="WAFAQ">وفاق المدارس</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">کلاس</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">منتخب کریں</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">تاریخ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">کلاس کی حاضری</h2>
          <button
            onClick={saveAttendance}
            className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700"
          >
            محفوظ کریں
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">نام</th>
                <th className="px-3 py-2 font-semibold text-gray-700">حالت</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="px-3 py-2">{s.fullName}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 justify-end">
                      {(["Present", "Absent", "Leave"] as const).map((st) => (
                        <label
                          key={st}
                          className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer ${
                            marks[s._id] === st
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`mark-${s._id}`}
                            className="hidden"
                            checked={marks[s._id] === st}
                            onChange={() => setMark(s._id, st)}
                          />
                          {st === "Present"
                            ? "حاضر"
                            : st === "Absent"
                            ? "غائب"
                            : "رخصت"}
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-gray-400 text-xs"
                    colSpan={2}
                  >
                    کوئی طالب علم نظر نہیں آیا۔
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TalbaLayout>
  );
}
