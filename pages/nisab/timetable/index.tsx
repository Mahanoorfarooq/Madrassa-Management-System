import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { NisabLayout } from "@/components/layout/NisabLayout";

interface DeptOption {
  _id: string;
  name: string;
  code?: string;
}

interface Option {
  _id: string;
  label: string;
}

interface TeacherOption {
  _id: string;
  fullName: string;
  designation?: string;
}

interface DarsOption {
  _id: string;
  title: string;
  code?: string;
}

interface EntryRow {
  _id: string;
  dayOfWeek: number;
  period: number;
  startTime?: string;
  endTime?: string;
  subject: string;
  room?: string;
  classId: any;
  sectionId?: any;
  teacherId?: any;
}

const urDays = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];

export default function NisabTimetablePage() {
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [classes, setClasses] = useState<Option[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [sections, setSections] = useState<Option[]>([]);
  const [sectionId, setSectionId] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [dars, setDars] = useState<DarsOption[]>([]);

  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    dayOfWeek: 1,
    period: 1,
    startTime: "",
    endTime: "",
    subjectId: "",
    teacherId: "",
    room: "",
  });

  const loadDepartments = async () => {
    try {
      const res = await api.get("/api/departments");
      setDepartments(res.data?.departments || []);
    } catch {
      setDepartments([]);
    }
  };

  const loadDars = async () => {
    if (!departmentId) {
      setDars([]);
      return;
    }
    try {
      const res = await api.get("/api/nisab/dars", {
        params: {
          departmentId,
          classId: classId || undefined,
          isActive: "true",
        },
      });
      setDars(res.data?.dars || []);
    } catch {
      setDars([]);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await api.get("/api/admin/teachers", {
        params: { departmentId: departmentId || undefined },
      });
      setTeachers(res.data?.teachers || []);
    } catch {
      setTeachers([]);
    }
  };

  const loadClasses = async () => {
    if (!departmentId) {
      setClasses([]);
      return;
    }
    const res = await api.get("/api/classes", { params: { departmentId } });
    setClasses(
      (res.data?.classes || []).map((c: any) => ({
        _id: c._id,
        label: c.className || c.title,
      }))
    );
  };

  const loadSections = async () => {
    if (!departmentId || !classId) {
      setSections([]);
      return;
    }
    const res = await api.get("/api/sections", {
      params: { departmentId, classId },
    });
    setSections(
      (res.data?.sections || []).map((s: any) => ({
        _id: s._id,
        label: s.sectionName || s.name,
      }))
    );
  };

  const loadEntries = async () => {
    if (!classId) {
      setEntries([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/nisab/timetable", {
        params: {
          departmentId: departmentId || undefined,
          classId,
          sectionId: sectionId || undefined,
        },
      });
      setEntries(res.data?.entries || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "ٹائم ٹیبل لوڈ نہیں ہو سکا۔");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    (async () => {
      if (!departmentId) {
        setClassId("");
        setSectionId("");
        setClasses([]);
        setSections([]);
        setTeachers([]);
        setEntries([]);
        return;
      }
      try {
        await Promise.all([loadClasses(), loadTeachers()]);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  useEffect(() => {
    (async () => {
      setSectionId("");
      await loadSections();
      await loadDars();
      await loadEntries();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  useEffect(() => {
    loadDars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  const submit = async () => {
    if (!classId || !form.subjectId) return;
    const subj = dars.find((s) => s._id === form.subjectId);
    if (!subj?.title) return;
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/nisab/timetable", {
        departmentId: departmentId || undefined,
        classId,
        sectionId: sectionId || undefined,
        dayOfWeek: Number(form.dayOfWeek),
        period: Number(form.period),
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        subject: subj.title,
        teacherId: form.teacherId || undefined,
        room: form.room || undefined,
      });
      setForm((p) => ({ ...p, subjectId: "", teacherId: "", room: "" }));
      await loadEntries();
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا۔");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("کیا آپ واقعی یہ انٹری حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/nisab/timetable/${id}`);
    await loadEntries();
  };

  const weekly = useMemo(() => {
    const map = new Map<number, EntryRow[]>();
    for (let i = 0; i < 7; i++) map.set(i, []);
    for (const e of entries) {
      map.get(e.dayOfWeek)?.push(e);
    }
    for (const [k, arr] of map.entries()) {
      map.set(
        k,
        arr.sort((a, b) => (a.period || 0) - (b.period || 0))
      );
    }
    return map;
  }, [entries]);

  return (
    <NisabLayout title="ٹائم ٹیبل">
      <div className="space-y-4" dir="rtl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">شعبہ</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="">منتخب کریں</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">کلاس</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={!departmentId}
                className="w-full rounded border px-3 py-2 text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">منتخب کریں</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">
                سیکشن (اختیاری)
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId}
                className="w-full rounded border px-3 py-2 text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">تمام / جنرل</option>
                {sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-right mb-3">
            <h2 className="text-sm font-bold text-gray-800">نئی انٹری</h2>
            <p className="text-xs text-gray-500">پہلے شعبہ/کلاس منتخب کریں</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">دن</label>
              <select
                value={form.dayOfWeek}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dayOfWeek: Number(e.target.value) }))
                }
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                {urDays.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">پیریڈ</label>
              <input
                type="number"
                value={form.period}
                onChange={(e) =>
                  setForm((p) => ({ ...p, period: Number(e.target.value) }))
                }
                className="w-full rounded border px-3 py-2 text-sm"
                min={1}
              />
            </div>

            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">وقت</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="08:00"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startTime: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="08:45"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endTime: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">کمرہ</label>
              <input
                value={form.room}
                onChange={(e) =>
                  setForm((p) => ({ ...p, room: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>

            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">مضمون</label>
              <select
                value={form.subjectId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subjectId: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm bg-white"
                disabled={!departmentId}
              >
                <option value="">منتخب کریں</option>
                {dars.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title} {s.code ? `(${s.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">
                استاد (اختیاری)
              </label>
              <select
                value={form.teacherId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, teacherId: e.target.value }))
                }
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="">منتخب کریں</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.fullName} {t.designation ? `(${t.designation})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end">
              <button
                disabled={loading || !classId || !form.subjectId}
                onClick={submit}
                className="rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 text-right">
            <h2 className="text-sm font-bold text-gray-800">ٹائم ٹیبل</h2>
            <p className="text-xs text-gray-500">
              سیکشن منتخب ہو تو اسی سیکشن کی انٹریز دکھیں گی
            </p>
          </div>

          {loading && entries.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              لوڈ ہو رہا ہے…
            </div>
          ) : !classId ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              پہلے کلاس منتخب کریں
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {Array.from({ length: 7 }, (_, i) => i).map((day) => (
                <div
                  key={day}
                  className="rounded border border-gray-100 overflow-hidden"
                >
                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 text-right">
                    {urDays[day]}
                  </div>
                  <div className="divide-y">
                    {(weekly.get(day) || []).length === 0 ? (
                      <div className="px-3 py-3 text-xs text-gray-400 text-right">
                        —
                      </div>
                    ) : (
                      (weekly.get(day) || []).map((e) => (
                        <div
                          key={e._id}
                          className="px-3 py-2 flex items-start justify-between gap-3"
                        >
                          <div className="text-right">
                            <div className="text-xs font-semibold text-gray-800">
                              {e.period}. {e.subject}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {(e.teacherId as any)?.fullName || ""}
                              {e.room ? ` • ${e.room}` : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-[11px] text-gray-500 font-mono">
                              {e.startTime || ""}
                              {e.endTime ? `-${e.endTime}` : ""}
                            </div>
                            <button
                              onClick={() => remove(e._id)}
                              className="rounded border border-red-200 text-red-700 px-3 py-1.5 text-[11px] font-semibold hover:bg-red-50"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NisabLayout>
  );
}
