import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";

interface Option {
  _id: string;
  label: string;
}

export interface StudentFormValues {
  fullName: string;
  fatherName?: string;
  dateOfBirth?: string;
  contactNumber?: string;
  address?: string;
  photoUrl?: string;
  admissionNumber?: string;
  admissionDate?: string;
  departmentId: string;
  classId?: string;
  sectionId?: string;
  status?: "Active" | "Left";
}

interface StudentFormProps {
  deptCode: "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ";
  initial?: Partial<StudentFormValues>;
  onSubmit: (values: StudentFormValues) => Promise<void>;
  submitLabel?: string;
}

export default function StudentForm({
  deptCode,
  initial,
  onSubmit,
  submitLabel = "محفوظ کریں",
}: StudentFormProps) {
  const [departmentId, setDepartmentId] = useState<string>(
    initial?.departmentId || ""
  );
  const [classes, setClasses] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<StudentFormValues>({
    fullName: initial?.fullName || "",
    fatherName: initial?.fatherName || "",
    dateOfBirth: initial?.dateOfBirth || "",
    contactNumber: initial?.contactNumber || "",
    address: initial?.address || "",
    photoUrl: initial?.photoUrl || "",
    admissionNumber: initial?.admissionNumber || "",
    admissionDate: initial?.admissionDate || "",
    departmentId: initial?.departmentId || "",
    classId: initial?.classId || "",
    sectionId: initial?.sectionId || "",
    status: (initial?.status as any) || "Active",
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setError(null);
        // Resolve department by code, ensure it exists
        const deptRes = await api.get("/api/departments", {
          params: { code: deptCode, ensure: "true" },
        });
        const dept = deptRes.data?.department;
        if (dept?._id) {
          setDepartmentId(dept._id);
          setValues((v) => ({ ...v, departmentId: dept._id }));
          // Load classes for this department
          const classesRes = await api.get("/api/classes", {
            params: { departmentId: dept._id },
          });
          const cls = (classesRes.data?.classes || []).map((c: any) => ({
            _id: c._id,
            label: c.className || c.title,
          }));
          setClasses(cls);
          // If initial classId given, load sections
          const classId = initial?.classId || values.classId;
          if (classId) {
            const sectionsRes = await api.get("/api/sections", {
              params: { departmentId: dept._id, classId },
            });
            const secs = (sectionsRes.data?.sections || []).map((s: any) => ({
              _id: s._id,
              label: s.sectionName || s.name,
            }));
            setSections(secs);
          }
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "مسئلہ درپیش ہے۔");
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptCode]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setValues((v) => ({ ...v, classId, sectionId: "" }));
    if (classId && departmentId) {
      const sectionsRes = await api.get("/api/sections", {
        params: { departmentId, classId },
      });
      const secs = (sectionsRes.data?.sections || []).map((s: any) => ({
        _id: s._id,
        label: s.sectionName || s.name,
      }));
      setSections(secs);
    } else {
      setSections([]);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ ...values, departmentId });
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا۔");
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
          <label className="block text-xs text-gray-700 mb-1">
            نام طالب علم
          </label>
          <input
            name="fullName"
            value={values.fullName}
            onChange={onChange}
            required
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            والد کا نام
          </label>
          <input
            name="fatherName"
            value={values.fatherName || ""}
            onChange={onChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            تاریخ پیدائش
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={values.dateOfBirth || ""}
            onChange={onChange}
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
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-700 mb-1">پتہ</label>
          <textarea
            name="address"
            value={values.address || ""}
            onChange={onChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            طالب علم کی تصویر (URL)
          </label>
          <input
            name="photoUrl"
            value={values.photoUrl || ""}
            onChange={onChange}
            placeholder="https://..."
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">داخلہ نمبر</label>
          <input
            name="admissionNumber"
            value={values.admissionNumber || ""}
            onChange={onChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            داخلہ کی تاریخ
          </label>
          <input
            type="date"
            name="admissionDate"
            value={values.admissionDate || ""}
            onChange={onChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">کلاس</label>
          <select
            name="classId"
            value={values.classId || ""}
            onChange={handleClassChange}
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
          <label className="block text-xs text-gray-700 mb-1">سیکشن</label>
          <select
            name="sectionId"
            value={values.sectionId || ""}
            onChange={onChange}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">منتخب کریں</option>
            {sections.map((s) => (
              <option key={s._id} value={s._id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">حیثیت</label>
          <select
            name="status"
            value={values.status || "Active"}
            onChange={onChange}
            className="w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Active">فعال</option>
            <option value="Left">نکل چکے</option>
          </select>
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
