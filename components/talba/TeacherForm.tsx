import { useEffect, useRef, useState } from "react";
import api from "@/utils/api";
import {
  User,
  Award,
  Phone,
  UserCircle,
  Lock,
  GraduationCap,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";

export interface TeacherFormValues {
  fullName: string;
  designation?: string;
  contactNumber?: string;
  departmentId: string;
  assignedClasses: string[];
  username?: string;
  password?: string;
  // For creating TeachingAssignment records on create
  classIds?: string[];
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
  const [assignedClasses, setAssignedClasses] = useState<string[]>(
    initial?.assignedClasses || []
  );
  const newClassInputRef = useRef<HTMLInputElement | null>(null);
  const [selectClassId, setSelectClassId] = useState<string>("");
  // Track selected class IDs (from dropdown) to create TeachingAssignment(s)
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
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
  }, [deptCode]);

  const addAssignedClass = () => {
    const value = newClassInputRef.current?.value?.trim();
    if (!value) return;
    setAssignedClasses((prev) => [...prev, value]);
    if (newClassInputRef.current) newClassInputRef.current.value = "";
  };

  const addAssignedClassFromSelect = () => {
    if (!selectClassId) return;
    const found = classOptions.find((c) => c._id === selectClassId);
    if (!found) return;
    setAssignedClasses((prev) => [...prev, found.label]);
    setSelectedClassIds((ids) =>
      ids.includes(found._id) ? ids : [...ids, found._id]
    );
    setSelectClassId("");
  };

  const removeAssignedClass = (idx: number) => {
    setAssignedClasses((prev) => {
      const label = prev[idx];
      if (label) {
        const match = classOptions.find((c) => c.label === label);
        if (match) {
          setSelectedClassIds((ids) => ids.filter((id) => id !== match._id));
        }
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = e.currentTarget;
      const data = new FormData(form);

      const fullName = String(data.get("fullName") || "").trim();
      const designation = String(data.get("designation") || "").trim();
      const contactNumber = String(data.get("contactNumber") || "").trim();
      const username = String(data.get("username") || "").trim();
      const password = String(data.get("password") || "");

      const payload: TeacherFormValues = {
        fullName,
        designation: designation || undefined,
        contactNumber: contactNumber || undefined,
        departmentId,
        assignedClasses,
        username: username || undefined,
        password: password || undefined,
        classIds: selectedClassIds,
      };

      await onSubmit(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    icon: Icon,
    label,
    name,
    type = "text",
    placeholder = "",
    required = false,
    defaultValue = "",
  }: any) => (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-600" />
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <form
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        onSubmit={submit}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white text-right flex items-center justify-end gap-3">
            <span>معلومات استاد</span>
            <Award className="w-7 h-7" />
          </h2>
          <p className="text-blue-50 text-sm mt-1 text-right">
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-100 text-right">
              ذاتی معلومات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={User}
                label="نام استاد"
                name="fullName"
                defaultValue={initial?.fullName || ""}
                required
              />
              <InputField
                icon={Award}
                label="عہدہ"
                name="designation"
                defaultValue={initial?.designation || ""}
                placeholder="استاد / قاری / معلم"
              />
              <InputField
                icon={Phone}
                label="رابطہ نمبر"
                name="contactNumber"
                defaultValue={initial?.contactNumber || ""}
              />
            </div>
          </div>

          {/* Login Credentials Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-100 text-right">
              لاگ اِن کی معلومات (اختیاری)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={UserCircle}
                label="یوزر نام"
                name="username"
                defaultValue={initial?.username || ""}
                placeholder="مثال: ustad.ahmad"
              />
              <InputField
                icon={Lock}
                label="پاس ورڈ (نیا / ری سیٹ)"
                name="password"
                type="password"
                defaultValue={""}
                placeholder="اگر خالی چھوڑیں تو پرانا برقرار رہے گا"
              />
            </div>
          </div>

          {/* Assigned Classes Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-100 text-right flex items-center justify-end gap-2">
              <span>تفویض شدہ کلاسز</span>
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </h3>

            {/* Add from Dropdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-gray-200">
              <p className="text-xs text-gray-600 mb-3 text-right">
                موجودہ کلاس سے منتخب کریں
              </p>
              <div className="flex gap-3 flex-col sm:flex-row">
                <select
                  value={selectClassId}
                  onChange={(e) => setSelectClassId(e.target.value)}
                  className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
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
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>شامل کریں</span>
                </button>
              </div>
            </div>

            {/* Add Custom Class */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-gray-200">
              <p className="text-xs text-gray-600 mb-3 text-right">
                یا نئی کلاس کا نام لکھیں
              </p>
              <div className="flex gap-3 flex-col sm:flex-row">
                <input
                  ref={newClassInputRef}
                  placeholder="مثلاً: حفظ - کلاس A"
                  className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={addAssignedClass}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-700 text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800 transition-all duration-200 hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>شامل کریں</span>
                </button>
              </div>
            </div>

            {/* Display Assigned Classes */}
            {assignedClasses.length > 0 ? (
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-3 text-right">
                  منتخب شدہ کلاسز ({assignedClasses.length})
                </p>
                <div className="flex gap-2 flex-wrap justify-end">
                  {assignedClasses.map((c, idx) => (
                    <span
                      key={`${c}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white border-2 border-blue-200 text-gray-700 px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => removeAssignedClass(idx)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span>{c}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  ابھی تک کوئی کلاس منتخب نہیں کی گئی
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex justify-end border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
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
      </form>
    </div>
  );
}
