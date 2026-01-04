import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import Link from "next/link";

export default function AssignTeacher() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [teacher, setTeacher] = useState<any>(null);
  const [assignments, setAssignments] = useState<Array<any>>([]);

  // Optional dropdown data (best-effort). Fallback to free text if not available.
  const [departments, setDepartments] = useState<any[]>([]);
  const [classesMap, setClassesMap] = useState<Record<string, any[]>>({});
  const [sectionsMap, setSectionsMap] = useState<Record<string, any[]>>({});

  const canUseDropdowns = useMemo(
    () => departments.length > 0,
    [departments.length]
  );

  const loadTeacher = async (tid: string) => {
    const res = await api.get(`/api/admin/teachers/${tid}`);
    setTeacher(res.data);
    setAssignments(res.data.assignments || []);
  };

  const tryLoadDepartments = async () => {
    try {
      const r = await api.get("/api/departments");
      const rows = Array.isArray(r.data?.departments)
        ? r.data.departments
        : Array.isArray(r.data)
        ? r.data
        : [];
      setDepartments(rows);
    } catch {
      // ignore - UI will fall back to inputs
    }
  };

  const loadClassesForDept = async (departmentId: string) => {
    if (!departmentId) return;
    if (classesMap[departmentId]) return;
    try {
      const r = await api.get(`/api/classes`, { params: { departmentId } });
      const rows = Array.isArray(r.data?.classes)
        ? r.data.classes
        : Array.isArray(r.data)
        ? r.data
        : [];
      setClassesMap((m) => ({ ...m, [departmentId]: rows }));
    } catch {
      // ignore
    }
  };

  const loadSectionsForClass = async (classId: string) => {
    if (!classId) return;
    if (sectionsMap[classId]) return;
    try {
      const r = await api.get(`/api/sections`, { params: { classId } });
      const rows = Array.isArray(r.data?.sections)
        ? r.data.sections
        : Array.isArray(r.data)
        ? r.data
        : [];
      setSectionsMap((m) => ({ ...m, [classId]: rows }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([loadTeacher(id), tryLoadDepartments()])
      .catch((e) =>
        setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const addRow = () => {
    setAssignments((a) => [
      ...a,
      { departmentId: "", classId: "", sectionId: "", subject: "" },
    ]);
  };

  const removeRow = (idx: number) => {
    setAssignments((a) => a.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, patch: any) => {
    setAssignments((a) =>
      a.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  };

  const onDeptChange = async (idx: number, departmentId: string) => {
    updateRow(idx, { departmentId, classId: "", sectionId: "" });
    await loadClassesForDept(departmentId);
  };

  const onClassChange = async (idx: number, classId: string) => {
    updateRow(idx, { classId, sectionId: "" });
    await loadSectionsForClass(classId);
  };

  const onSave = async () => {
    if (!id) return;
    setSaving(true);
    setOk(null);
    setError(null);
    try {
      await api.put(`/api/admin/teachers/${id}`, { assignments });
      setOk("اسائنمنٹس محفوظ ہو گئیں");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">استاد کی اسائنمنٹس</h1>
          <div className="flex gap-2">
            <Link
              href={`/admin/teachers/${id}/edit`}
              className="px-3 py-2 text-sm border rounded"
            >
              پروفائل
            </Link>
            <Link
              href={`/admin/teachers/${id}`}
              className="px-3 py-2 text-sm border rounded"
            >
              تفصیل
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded bg-red-100 text-red-700 text-sm px-3 py-2 text-right">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-3 rounded bg-emerald-100 text-emerald-700 text-sm px-3 py-2 text-right">
            {ok}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-gray-600">لوڈ ہو رہا ہے…</div>
        ) : (
          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-700">{teacher?.fullName}</div>
              <button
                onClick={addRow}
                className="px-3 py-2 text-sm rounded bg-primary text-white"
              >
                نئی اسائنمنٹ
              </button>
            </div>

            <div className="space-y-3">
              {assignments.length === 0 && (
                <div className="text-sm text-gray-500 text-right">
                  کوئی اسائنمنٹ موجود نہیں، نئی اسائنمنٹ شامل کریں۔
                </div>
              )}
              {assignments.map((row, idx) => {
                const deptId = row.departmentId || "";
                const clsId = row.classId || "";
                const secId = row.sectionId || "";
                const deptClasses = classesMap[deptId] || [];
                const clsSections = sectionsMap[clsId] || [];
                return (
                  <div key={idx} className="border rounded p-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          شعبہ
                        </label>
                        {canUseDropdowns ? (
                          <select
                            value={deptId}
                            onChange={(e) => onDeptChange(idx, e.target.value)}
                            className="w-full rounded border px-3 py-2 text-sm"
                          >
                            <option value="">منتخب کریں</option>
                            {departments.map((d: any) => (
                              <option key={d._id || d.id} value={d._id || d.id}>
                                {d.name || d.title || d.code || d._id}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={deptId}
                            onChange={(e) =>
                              updateRow(idx, { departmentId: e.target.value })
                            }
                            className="w-full rounded border px-3 py-2 text-sm"
                            placeholder="DepartmentId"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          کلاس
                        </label>
                        {canUseDropdowns && deptId && deptClasses.length > 0 ? (
                          <select
                            value={clsId}
                            onChange={(e) => onClassChange(idx, e.target.value)}
                            className="w-full rounded border px-3 py-2 text-sm"
                          >
                            <option value="">منتخب کریں</option>
                            {deptClasses.map((c: any) => (
                              <option key={c._id || c.id} value={c._id || c.id}>
                                {c.name || c.title || c.code || c._id}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={clsId}
                            onChange={(e) =>
                              updateRow(idx, { classId: e.target.value })
                            }
                            className="w-full rounded border px-3 py-2 text-sm"
                            placeholder="ClassId"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          سیکشن
                        </label>
                        {canUseDropdowns && clsId && clsSections.length > 0 ? (
                          <select
                            value={secId}
                            onChange={(e) =>
                              updateRow(idx, { sectionId: e.target.value })
                            }
                            className="w-full rounded border px-3 py-2 text-sm"
                          >
                            <option value="">منتخب کریں</option>
                            {clsSections.map((s: any) => (
                              <option key={s._id || s.id} value={s._id || s.id}>
                                {s.name || s.title || s.code || s._id}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={secId}
                            onChange={(e) =>
                              updateRow(idx, { sectionId: e.target.value })
                            }
                            className="w-full rounded border px-3 py-2 text-sm"
                            placeholder="SectionId"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          مضمون
                        </label>
                        <input
                          value={row.subject || ""}
                          onChange={(e) =>
                            updateRow(idx, { subject: e.target.value })
                          }
                          className="w-full rounded border px-3 py-2 text-sm"
                          placeholder="Subject"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => removeRow(idx)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        حذف کریں
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={onSave}
                disabled={saving}
                className="px-5 py-2 text-sm rounded bg-primary text-white disabled:opacity-60"
              >
                {saving ? "محفوظ ہو رہا ہے" : "محفوظ کریں"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
