import { useEffect, useState } from "react";
import api from "@/utils/api";
import { UsatazaLayout } from "@/components/layout/UsatazaLayout";
import {
  ClipboardList,
  Plus,
  Trash2,
  Filter,
  BookOpen,
  Users,
  User,
} from "lucide-react";

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
    setTeacherId("");
    setClassId("");
    setSectionId("");
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
    <UsatazaLayout>
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">تفویضِ تدریس</h1>
                <p className="text-purple-100 text-xs">
                  اساتذہ کو کلاسز اور مضامین تفویض کریں
                </p>
              </div>
            </div>
            {assignments.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  <div>
                    <p className="text-[10px] text-purple-100">کل تفویضات</p>
                    <p className="text-lg font-bold">{assignments.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Assignment Form */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-gray-800">
              نئی تفویض شامل کریں
            </h2>
          </div>
          <form onSubmit={addAssignment}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  شعبہ
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setClassId("");
                    setSectionId("");
                    setTeacherId("");
                  }}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">شعبہ منتخب کریں</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  استاد
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  disabled={!departmentId}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">استاد منتخب کریں</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName}
                      {t.designation ? ` (${t.designation})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  کلاس
                </label>
                <select
                  value={classId}
                  onChange={(e) => {
                    setClassId(e.target.value);
                    setSectionId("");
                  }}
                  disabled={!departmentId}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">کلاس (اختیاری)</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  سیکشن
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  disabled={!classId}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">سیکشن (اختیاری)</option>
                  {sections.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  مضمون
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثلاً: عربی"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!departmentId || !teacherId}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>تفویض کریں</span>
              </button>
            </div>
          </form>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {!departmentId ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <Filter className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                پہلے شعبہ منتخب کریں
              </p>
              <p className="text-xs text-gray-400 mt-1">
                تفویضات دیکھنے کے لیے اوپر سے شعبہ منتخب کریں
              </p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-5 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <ClipboardList className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                ابھی کوئی تفویض نہیں
              </p>
              <p className="text-xs text-gray-400 mt-1">
                پہلی تفویض شامل کرنے کے لیے اوپر فارم استعمال کریں
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      استاد
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      کلاس
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      سیکشن
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      مضمون
                    </th>
                    <th className="px-5 py-3 text-right font-bold text-gray-700">
                      عمل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map((a, index) => (
                    <tr
                      key={a._id}
                      className={`hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {a.teacherId?.fullName}
                            </p>
                            {a.teacherId?.designation && (
                              <p className="text-xs text-gray-500">
                                {a.teacherId?.designation}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {a.classId?.className ? (
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700">
                              {a.classId?.className}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {a.sectionId?.sectionName ? (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700">
                              {a.sectionId?.sectionName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {a.subject ? (
                          <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                            {a.subject}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => removeAssignment(a._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          حذف
                        </button>
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
