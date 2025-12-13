import { useEffect, useState } from "react";
import api from "@/utils/api";
import {
  User,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Image,
  Hash,
  GraduationCap,
  Users,
  AlertCircle,
} from "lucide-react";

interface Option {
  _id: string;
  label: string;
}

export interface StudentFormValues {
  fullName: string;
  fatherName?: string;
  dateOfBirth?: string;
  contactNumber?: string;
  cnic?: string;
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
    cnic: (initial as any)?.cnic || "",
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
          setClasses(cls);
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

  const submit = async (e: React.MouseEvent) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(e as any);
    }
  };

  const InputField = ({
    icon: Icon,
    label,
    name,
    type = "text",
    placeholder = "",
    required = false,
    value,
    onChange,
  }: any) => (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-emerald-600" />
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        onKeyPress={handleKeyPress}
        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300"
      />
    </div>
  );

  const SelectField = ({
    icon: Icon,
    label,
    name,
    value,
    onChange,
    options,
    placeholder = "منتخب کریں",
  }: any) => (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-emerald-600" />
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt: any) => (
          <option key={opt._id || opt.value} value={opt._id || opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white text-right">
            معلومات طالب علم
          </h2>
          <p className="text-emerald-50 text-sm mt-1 text-right">
            براہ کرم تمام ضروری معلومات درج کریں
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6 rounded-lg bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="p-8 space-y-8">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-emerald-100 text-right">
              ذاتی معلومات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={User}
                label="نام طالب علم"
                name="fullName"
                value={values.fullName}
                onChange={onChange}
                required
              />
              <InputField
                icon={User}
                label="والد کا نام"
                name="fatherName"
                value={values.fatherName || ""}
                onChange={onChange}
              />
              <InputField
                icon={Calendar}
                label="تاریخ پیدائش"
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth || ""}
                onChange={onChange}
              />
              <InputField
                icon={Phone}
                label="رابطہ نمبر"
                name="contactNumber"
                value={values.contactNumber || ""}
                onChange={onChange}
              />
              <InputField
                icon={CreditCard}
                label="شناختی کارڈ نمبر"
                name="cnic"
                value={values.cnic || ""}
                onChange={onChange}
                placeholder="مثال: 12345-1234567-1"
              />
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  پتہ
                </label>
                <textarea
                  name="address"
                  value={values.address || ""}
                  onChange={onChange}
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-emerald-100 text-right">
              تعلیمی معلومات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={Image}
                label="طالب علم کی تصویر (URL)"
                name="photoUrl"
                value={values.photoUrl || ""}
                onChange={onChange}
                placeholder="https://..."
              />
              <InputField
                icon={Hash}
                label="داخلہ نمبر"
                name="admissionNumber"
                value={values.admissionNumber || ""}
                onChange={onChange}
              />
              <InputField
                icon={Calendar}
                label="داخلہ کی تاریخ"
                name="admissionDate"
                type="date"
                value={values.admissionDate || ""}
                onChange={onChange}
              />
              <SelectField
                icon={GraduationCap}
                label="کلاس"
                name="classId"
                value={values.classId || ""}
                onChange={handleClassChange}
                options={classes}
              />
              <SelectField
                icon={Users}
                label="سیکشن"
                name="sectionId"
                value={values.sectionId || ""}
                onChange={onChange}
                options={sections}
              />
              <SelectField
                icon={AlertCircle}
                label="حیثیت"
                name="status"
                value={values.status || "Active"}
                onChange={onChange}
                options={[
                  { value: "Active", label: "فعال" },
                  { value: "Left", label: "نکل چکے" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex justify-end border-t border-gray-200">
          <button
            onClick={submit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>محفوظ ہو رہا ہے...</span>
              </>
            ) : (
              <>
                <span>{submitLabel}</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
