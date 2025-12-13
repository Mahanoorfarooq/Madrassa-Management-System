import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HazriLayout } from "@/components/layout/HazriLayout";

export default function StudentsHazriPage() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [departments, setDepartments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [classId, setClassId] = useState("");
  const [attendance, setAttendance] = useState<
    Record<string, "Present" | "Absent" | "Leave" | "">
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [d, c] = await Promise.all([
        api.get("/api/departments"),
        api.get("/api/classes"),
      ]);
      setDepartments(d.data?.departments || []);
      setClasses(c.data?.classes || []);
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const s = await api.get("/api/students", {
        params: {
          departmentId: departmentId || undefined,
          classId: classId || undefined,
        },
      });
      setStudents(s.data?.students || []);
      // Load existing attendance for the date
      const a = await api.get("/api/attendance", {
        params: {
          departmentId: departmentId || undefined,
          classId: classId || undefined,
          from: date,
          to: date,
        },
      });
      const map: Record<string, any> = {};
      (a.data?.attendance || []).forEach((r: any) => {
        map[String(r.student?._id || r.student)] = r.status;
      });
      setAttendance(map as any);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (
    studentId: string,
    status: "Present" | "Absent" | "Leave"
  ) => setAttendance((m) => ({ ...m, [studentId]: status }));
  const markAllPresent = () => {
    const map: Record<string, any> = {};
    students.forEach((s: any) => {
      map[s._id] = "Present";
    });
    setAttendance(map as any);
  };

  const saveAll = async () => {
    for (const s of students) {
      const st = (attendance as any)[s._id];
      if (!st) continue;
      await api.post("/api/attendance", {
        studentId: s._id,
        date,
        status: st,
        departmentId: departmentId || undefined,
        classId: classId || undefined,
      });
    }
    await load();
  };

  const doneCount = useMemo(
    () => Object.values(attendance).filter(Boolean).length,
    [attendance]
  );

  return (
    <HazriLayout title="طلبہ حاضری">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 text-right">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">تاریخ</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">شعبہ</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">تمام</option>
            {departments.map((d: any) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">کلاس</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded border px-2 py-2 text-sm"
          >
            <option value="">تمام</option>
            {classes.map((c: any) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end justify-end gap-2 md:col-span-2">
          <button
            onClick={load}
            className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            لوڈ
          </button>
          <button
            onClick={markAllPresent}
            className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white"
          >
            سب حاضر
          </button>
          <button
            onClick={saveAll}
            className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white"
          >
            محفوظ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-xs text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700">
                طالب علم
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">
                رجسٹریشن
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700">حالت</th>
              <th className="px-3 py-2 font-semibold text-gray-700">
                کارروائی
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => (
              <tr key={s._id} className="border-t">
                <td className="px-3 py-2">{s.fullName || s.name}</td>
                <td className="px-3 py-2">{s.rollNumber || s.regNo}</td>
                <td className="px-3 py-2">{attendance[s._id] || "-"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setStatus(s._id, "Present")}
                      className="px-3 py-1 rounded bg-green-600 text-white"
                    >
                      حاضر
                    </button>
                    <button
                      onClick={() => setStatus(s._id, "Absent")}
                      className="px-3 py-1 rounded bg-red-600 text-white"
                    >
                      غائب
                    </button>
                    <button
                      onClick={() => setStatus(s._id, "Leave")}
                      className="px-3 py-1 rounded bg-yellow-500 text-white"
                    >
                      رخصت
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && students.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-400" colSpan={4}>
                  کوئی ریکارڈ نہیں
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50">
              <td className="px-3 py-2 font-semibold" colSpan={4}>
                نشان زد: {doneCount} / {students.length}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </HazriLayout>
  );
}
