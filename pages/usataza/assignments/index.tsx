import { useEffect, useState } from "react";
import api from "@/utils/api";
import { UsatazaLayout } from "@/components/layout/UsatazaLayout";

interface Dept {
  _id: string;
  code: string;
  name: string;
}
interface Cls {
  _id: string;
  label: string;
}
interface Sec {
  _id: string;
  label: string;
}
interface Teacher {
  _id: string;
  fullName: string;
  designation?: string;
}

export default function TeachingAssignmentsPage() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<Cls[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [sections, setSections] = useState<Sec[]>([]);
  const [sectionId, setSectionId] = useState<string>("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadDepts = async () => {
      const res = await api.get("/api/departments");
      setDepartments(res.data?.departments || []);
    };
    loadDepts();
  }, []);

  useEffect(() => {
    const loadClassesAndTeachers = async () => {
      if (!departmentId) return;
      setLoading(true);
      try {
        const clsRes = await api.get("/api/classes", {
          params: { departmentId },
        });
        const cls = (clsRes.data?.classes || []).map((c: any) => ({
          _id: c._id,
          label: c.className || c.title,
        }));
        setClasses(cls);
        const tRes = await api.get("/api/teachers", {
          params: { departmentId },
        });
        setTeachers(tRes.data?.teachers || []);
        const aRes = await api.get("/api/teaching-assignments", {
          params: { departmentId },
        });
        setAssignments(aRes.data?.assignments || []);
      } finally {
        setLoading(false);
      }
    };
    loadClassesAndTeachers();
  }, [departmentId]);

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

  const addAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !teacherId) return;
    await api.post("/api/teaching-assignments", {
      departmentId,
      teacherId,
      classId: classId || undefined,
      sectionId: sectionId || undefined,
      subject: subject || undefined,
    });
    setSubject("");
    const aRes = await api.get("/api/teaching-assignments", {
      params: { departmentId },
    });
    setAssignments(aRes.data?.assignments || []);
  };

  const removeAssignment = async (id: string) => {
    if (!confirm("کیا آپ واقعی اس تفویض کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/teaching-assignments/${id}`);
    const aRes = await api.get("/api/teaching-assignments", {
      params: { departmentId },
    });
    setAssignments(aRes.data?.assignments || []);
  };

  return (
    <UsatazaLayout title="تفویضِ تدریس">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 text-right">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">شعبہ</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">منتخب کریں</option>
              {departments.map((d) => (
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
            <label className="text-xs text-gray-600 mb-1 block">استاد</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">منتخب کریں</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName}
                  {t.designation ? ` (${t.designation})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              مضمون (اختیاری)
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={addAssignment}
            className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700"
            disabled={!departmentId || !teacherId}
          >
            تفویض کریں
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right">
        <h2 className="text-sm font-semibold mb-3">تفویضات</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">استاد</th>
                <th className="px-3 py-2 font-semibold text-gray-700">کلاس</th>
                <th className="px-3 py-2 font-semibold text-gray-700">سیکشن</th>
                <th className="px-3 py-2 font-semibold text-gray-700">مضمون</th>
                <th className="px-3 py-2 font-semibold text-gray-700">عمل</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a._id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {a.teacherId?.fullName}
                    {a.teacherId?.designation
                      ? ` (${a.teacherId?.designation})`
                      : ""}
                  </td>
                  <td className="px-3 py-2">{a.classId?.className || "-"}</td>
                  <td className="px-3 py-2">
                    {a.sectionId?.sectionName || "-"}
                  </td>
                  <td className="px-3 py-2">{a.subject || "-"}</td>
                  <td className="px-3 py-2 flex gap-2 justify-end">
                    <button
                      onClick={() => removeAssignment(a._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-gray-400 text-xs"
                    colSpan={5}
                  >
                    کوئی ریکارڈ موجود نہیں۔
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </UsatazaLayout>
  );
}
