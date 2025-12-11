import { useEffect, useState } from "react";
import api from "@/utils/api";

export interface TeacherAdminFormValues {
  fullName: string;
  designation?: string;
  contactNumber?: string;
  departmentIds: string[];
  // Optional login fields (admin may leave empty to skip login creation)
  username?: string;
  password?: string;
}

interface TeacherAdminFormProps {
  initial?: Partial<TeacherAdminFormValues>;
  onSubmit: (values: TeacherAdminFormValues) => Promise<void>;
  submitLabel?: string;
}

export default function TeacherFormAdmin({
  initial,
  onSubmit,
  submitLabel = "محفوظ کریں",
}: TeacherAdminFormProps) {
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);
  const [values, setValues] = useState<TeacherAdminFormValues>({
    fullName: initial?.fullName || "",
    designation: initial?.designation || "",
    contactNumber: initial?.contactNumber || "",
    departmentIds: initial?.departmentIds || [],
    username: initial?.username || "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDepts = async () => {
      const res = await api.get("/api/departments");
      setDepartments(res.data?.departments || []);
    };
    loadDepts();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const toggleDept = (id: string) => {
    setValues((v) => ({
      ...v,
      departmentIds: v.departmentIds.includes(id)
        ? v.departmentIds.filter((d) => d !== id)
        : [...v.departmentIds, id],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
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
          <label className="block text-xs text-gray-700 mb-1">شعبہ جات</label>
          <div className="flex flex-wrap gap-2 justify-end">
            {departments.map((d) => {
              const checked = values.departmentIds.includes(d._id);
              return (
                <label
                  key={d._id}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border cursor-pointer ${
                    checked
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() => toggleDept(d._id)}
                  />
                  {d.name}
                </label>
              );
            })}
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
