import { useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { Topbar } from "@/components/layout/Topbar";

export default function AdminTeacherCreate() {
  const [form, setForm] = useState<any>({
    fullName: "",
    designation: "",
    specialization: "",
    phone: "",
    contactNumber: "",
  });
  const [subjects, setSubjects] = useState<string>("");
  const [assignments, setAssignments] = useState<Array<any>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const addAssignment = () =>
    setAssignments((a) => [
      ...a,
      { departmentId: "", classId: "", sectionIds: [], subject: "" },
    ]);
  const updateAssignment = (idx: number, key: string, value: any) => {
    setAssignments((a) =>
      a.map((x, i) => (i === idx ? { ...x, [key]: value } : x))
    );
  };
  const removeAssignment = (idx: number) =>
    setAssignments((a) => a.filter((_, i) => i !== idx));

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const payload: any = {
        ...form,
        subjects: subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        assignments: assignments.map((a) => ({
          departmentId: a.departmentId || undefined,
          classId: a.classId || undefined,
          sectionIds: Array.isArray(a.sectionIds)
            ? a.sectionIds.filter((x: string) => x && x !== "")
            : undefined,
          subject: a.subject || undefined,
        })),
      };
      await api.post("/api/admin/teachers", payload);
      setOk("استاد بنا دیا گیا");
      setForm({
        fullName: "",
        designation: "",
        specialization: "",
        phone: "",
        contactNumber: "",
      });
      setSubjects("");
      setAssignments([]);
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightBg">
      <Topbar roleLabel="ایڈمن / نیا استاد" />
      <main className="max-w-3xl mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800">نیا استاد</h1>
          <Link href="/admin/teachers" className="text-primary text-sm">
            فہرست پر واپس
          </Link>
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">نام</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">عہدہ</label>
              <input
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">تخصص</label>
              <input
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">فون</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                رابطہ نمبر
              </label>
              <input
                value={form.contactNumber}
                onChange={(e) =>
                  setForm({ ...form, contactNumber: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              مضامین (کامہ سے جدا)
            </label>
            <input
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <h2 className="text-sm font-semibold text-gray-700">تفویضات</h2>
            <button
              type="button"
              onClick={addAssignment}
              className="rounded border px-3 py-1.5 text-xs bg-white"
            >
              نیا
            </button>
          </div>

          <div className="space-y-3">
            {assignments.map((a, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-white border rounded p-2"
              >
                <input
                  placeholder="departmentId"
                  value={a.departmentId}
                  onChange={(e) =>
                    updateAssignment(idx, "departmentId", e.target.value)
                  }
                  className="rounded border px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="classId"
                  value={a.classId}
                  onChange={(e) =>
                    updateAssignment(idx, "classId", e.target.value)
                  }
                  className="rounded border px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="sectionIds (comma)"
                  value={(a.sectionIds || []).join(",")}
                  onChange={(e) =>
                    updateAssignment(
                      idx,
                      "sectionIds",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  className="rounded border px-2 py-1.5 text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    placeholder="subject"
                    value={a.subject}
                    onChange={(e) =>
                      updateAssignment(idx, "subject", e.target.value)
                    }
                    className="rounded border px-2 py-1.5 text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeAssignment(idx)}
                    className="rounded bg-red-100 text-red-700 px-2 py-1 text-xs"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
            {!assignments.length && (
              <div className="text-xs text-gray-500">
                کوئی تفویض شامل نہیں — اوپر &quot;نیا&quot; دبائیں
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              disabled={saving}
              className="rounded bg-primary text-white px-5 py-2 text-sm disabled:opacity-60"
            >
              {saving ? "محفوظ ہو رہا ہے" : "محفوظ کریں"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
