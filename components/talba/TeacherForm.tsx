import { useEffect, useState } from "react";
import api from "@/utils/api";

export interface TeacherFormValues {
  fullName: string;
  designation?: string;
  contactNumber?: string;
  departmentId: string;
  assignedClasses: string[];
  // Optional login fields so Talba module can also create teacher logins
  username?: string;
  password?: string;
}

interface TeacherFormProps {
  deptCode: "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ";
  initial?: Partial<TeacherFormValues>;
  onSubmit: (values: TeacherFormValues) => Promise<void>;
  submitLabel?: string;
}

export default function TeacherForm({
  deptCode,
  initial,
  onSubmit,
  submitLabel = "محفوظ کریں",
}: TeacherFormProps) {
  const [departmentId, setDepartmentId] = useState<string>(
    initial?.departmentId || ""
  );
  const [classOptions, setClassOptions] = useState<
    { _id: string; label: string }[]
  >([]);
  const [values, setValues] = useState<TeacherFormValues>({
    fullName: initial?.fullName || "",
    designation: initial?.designation || "",
    contactNumber: initial?.contactNumber || "",
    departmentId: initial?.departmentId || "",
    assignedClasses: initial?.assignedClasses || [],
    username: initial?.username || "",
    password: "",
  });
  const [newClassInput, setNewClassInput] = useState<string>("");
  const [selectClassId, setSelectClassId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setError(null);
        const deptRes = await api.get("/api/departments", {
          params: { code: deptCode, ensure: "true" },
        });
        const dept = deptRes.data?.department;
        if (dept?._id) {
          setDepartmentId(dept._id);
          setValues((v) => ({ ...v, departmentId: dept._id }));
          const classesRes = await api.get("/api/classes", {
            params: { departmentId: dept._id },
          });
          const cls = (classesRes.data?.classes || []).map((c: any) => ({
            _id: c._id,
            label: c.className || c.title,
          }));
          setClassOptions(cls);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "مسئلہ درپیش ہے");
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptCode]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const addAssignedClass = () => {
    if (!newClassInput.trim()) return;
    setValues((v) => ({
      ...v,
      assignedClasses: [...v.assignedClasses, newClassInput.trim()],
    }));
    setNewClassInput("");
  };

  const addAssignedClassFromSelect = () => {
    if (!selectClassId) return;
    const found = classOptions.find((c) => c._id === selectClassId);
    if (!found) return;
    setValues((v) => ({
      ...v,
      assignedClasses: [...v.assignedClasses, found.label],
    }));
    setSelectClassId("");
  };

  const removeAssignedClass = (idx: number) => {
    setValues((v) => ({
      ...v,
      assignedClasses: v.assignedClasses.filter((_, i) => i !== idx),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ ...values, departmentId });
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 text-right">
      {error && (
        <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-700 mb-1">نام استاد</label>
          <input
            name="fullName"
            value={values.fullName}
            onChange={onChange}
            required
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">عہدہ</label>
          <input
            name="designation"
            value={values.designation || ""}
            onChange={onChange}
            placeholder="استاد / قاری / معلم"
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">رابطہ نمبر</label>
          <input
            name="contactNumber"
            value={values.contactNumber || ""}
            onChange={onChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            لاگ اِن یوزر نام (اختیاری)
          </label>
          <input
            name="username"
            value={values.username || ""}
            onChange={onChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="مثال: ustad.ahmad"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            لاگ اِن پاس ورڈ (نیا / ری سیٹ)
          </label>
          <input
            type="password"
            name="password"
            value={values.password || ""}
            onChange={onChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="اگر خالی چھوڑیں تو پرانا پاس ورڈ برقرار رہے گا"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-700 mb-1">
            تفویض شدہ کلاسز
          </label>
          <div className="flex gap-2 mb-2 flex-col md:flex-row">
            <div className="flex gap-2">
              <select
                value={selectClassId}
                onChange={(e) => setSelectClassId(e.target.value)}
                className="rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">کلاس منتخب کریں</option>
                {classOptions.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addAssignedClassFromSelect}
                className="inline-flex items-center rounded bg-gray-800 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-900"
              >
                شامل کریں
              </button>
            </div>
            <input
              value={newClassInput}
              onChange={(e) => setNewClassInput(e.target.value)}
              placeholder="مثلاً: ح ف ز - کلاس A"
              className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addAssignedClass}
              className="inline-flex items-center rounded bg-gray-800 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-900"
            >
              شامل کریں
            </button>
          </div>
          {/* Pills */}
          <div className="flex gap-2 flex-wrap justify-end">
            {values.assignedClasses.map((c, idx) => (
              <span
                key={`${c}-${idx}`}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs"
              >
                {c}
                <button
                  type="button"
                  onClick={() => removeAssignedClass(idx)}
                  className="text-gray-500 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded bg-primary text-white px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
