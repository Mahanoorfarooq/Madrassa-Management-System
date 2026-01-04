import { useEffect, useState } from "react";
import api from "@/utils/api";
import {
  User,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Image as ImageIcon,
  Hash,
  GraduationCap,
  BookOpen,
  Users,
  AlertCircle,
  HeartPulse,
  Home,
} from "lucide-react";

interface Option {
  _id: string;
  label: string;
}

interface NamedOption {
  _id: string;
  name: string;
}

export interface StudentFormValues {
  fullName: string;
  gender?: "male" | "female" | "other";
  fatherName?: string;
  dateOfBirth?: string;
  contactNumber?: string;
  emergencyContact?: string;
  cnic?: string;
  address?: string;
  photoUrl?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianCNIC?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  admissionNumber?: string;
  admissionDate?: string;
  previousSchool?: string;
  notes?: string;
  departmentId: string;
  classId?: string;
  sectionId?: string;
  halaqahId?: string;
  isHostel?: boolean;
  isTransport?: boolean;
  transportRouteId?: string;
  transportPickupNote?: string;
  scholarshipType?: "none" | "percent" | "fixed";
  scholarshipValue?: number;
  scholarshipNote?: string;
  status?: "Active" | "Left";
  createPortalAccount?: boolean;
  portalUsername?: string;
  portalPassword?: string;
}

interface StudentFormProps {
  deptCode: "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ";
  initial?: Partial<StudentFormValues>;
  onSubmit: (values: StudentFormValues) => Promise<void>;
  submitLabel?: string;
  showPortalAccount?: boolean;
}

const InputField = ({
  icon: Icon,
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  value,
  onChange,
  onKeyPress,
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
      onKeyPress={onKeyPress}
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

export default function StudentForm({
  deptCode,
  initial,
  onSubmit,
  submitLabel = "محفوظ کریں",
  showPortalAccount = false,
}: StudentFormProps) {
  const [departmentId, setDepartmentId] = useState<string>(
    initial?.departmentId || ""
  );
  const [classes, setClasses] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [halaqah, setHalaqah] = useState<NamedOption[]>([]);
  const [routes, setRoutes] = useState<NamedOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<StudentFormValues>({
    fullName: initial?.fullName || "",
    gender: (initial as any)?.gender || "male",
    fatherName: initial?.fatherName || "",
    dateOfBirth: initial?.dateOfBirth || "",
    contactNumber: initial?.contactNumber || "",
    emergencyContact: (initial as any)?.emergencyContact || "",
    cnic: (initial as any)?.cnic || "",
    address: initial?.address || "",
    photoUrl: initial?.photoUrl || "",
    guardianName: (initial as any)?.guardianName || "",
    guardianRelation: (initial as any)?.guardianRelation || "",
    guardianCNIC: (initial as any)?.guardianCNIC || "",
    guardianPhone: (initial as any)?.guardianPhone || "",
    guardianAddress: (initial as any)?.guardianAddress || "",
    admissionNumber: initial?.admissionNumber || "",
    admissionDate: initial?.admissionDate || "",
    previousSchool: (initial as any)?.previousSchool || "",
    notes: (initial as any)?.notes || "",
    departmentId: initial?.departmentId || "",
    classId: initial?.classId || "",
    sectionId: initial?.sectionId || "",
    halaqahId: (initial as any)?.halaqahId || "",
    status: (initial?.status as any) || "Active",
    isHostel: Boolean((initial as any)?.isHostel),
    isTransport: Boolean((initial as any)?.isTransport),
    transportRouteId: (initial as any)?.transportRouteId || "",
    transportPickupNote: (initial as any)?.transportPickupNote || "",
    scholarshipType: (initial as any)?.scholarshipType || "none",
    scholarshipValue: Number((initial as any)?.scholarshipValue || 0),
    scholarshipNote: (initial as any)?.scholarshipNote || "",
    createPortalAccount: false,
    portalUsername: "",
    portalPassword: "",
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

          const halaqahRes = await api
            .get("/api/halaqah", { params: { departmentId: dept._id } })
            .catch(() => null);
          setHalaqah((halaqahRes as any)?.data?.halaqah || []);

          const routesRes = await api
            .get("/api/transport-routes")
            .catch(() => null);
          setRoutes((routesRes as any)?.data?.routes || []);
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

  useEffect(() => {
    const loadHalaqah = async () => {
      if (!departmentId) return;
      const res = await api
        .get("/api/halaqah", { params: { departmentId } })
        .catch(() => null);
      setHalaqah((res as any)?.data?.halaqah || []);
    };
    loadHalaqah();
  }, [departmentId]);

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

  // Local image upload -> base64 into values.photoUrl
  const [photoError, setPhotoError] = useState<string | null>(null);
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Only image files are allowed");
      return;
    }
    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image size must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setValues((v) => ({ ...v, photoUrl: String(reader.result || "") }));
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };

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
                onKeyPress={handleKeyPress}
                required
              />
              <InputField
                icon={User}
                label="والد کا نام"
                name="fatherName"
                value={values.fatherName || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <InputField
                icon={Calendar}
                label="تاریخ پیدائش"
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <SelectField
                icon={Users}
                label="جنس"
                name="gender"
                value={(values.gender as any) || "male"}
                onChange={onChange}
                options={[
                  { value: "male", label: "مرد" },
                  { value: "female", label: "خاتون" },
                  { value: "other", label: "دیگر" },
                ]}
              />
              <InputField
                icon={Phone}
                label="رابطہ نمبر"
                name="contactNumber"
                value={values.contactNumber || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <InputField
                icon={HeartPulse}
                label="ہنگامی رابطہ"
                name="emergencyContact"
                value={values.emergencyContact || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <InputField
                icon={CreditCard}
                label="شناختی کارڈ نمبر"
                name="cnic"
                value={values.cnic || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
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

          {/* Hostel / Transport Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-emerald-100 text-right">
              رہائش / ٹرانسپورٹ (اختیاری)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between rounded-lg border-2 border-gray-200 px-4 py-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">ہاسٹل</div>
                  <div className="text-xs text-gray-500">
                    اگر طالب علم ہاسٹل میں ہے
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(values.isHostel)}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, isHostel: e.target.checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border-2 border-gray-200 px-4 py-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    ٹرانسپورٹ
                  </div>
                  <div className="text-xs text-gray-500">
                    اگر طالب علم ٹرانسپورٹ استعمال کرتا ہے
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(values.isTransport)}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      isTransport: e.target.checked,
                      transportRouteId: e.target.checked
                        ? v.transportRouteId
                        : "",
                    }))
                  }
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  ٹرانسپورٹ روٹ
                </label>
                <select
                  name="transportRouteId"
                  value={values.transportRouteId || ""}
                  onChange={onChange}
                  disabled={!values.isTransport}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 bg-white disabled:bg-gray-100"
                >
                  <option value="">منتخب کریں</option>
                  {routes.map((r: any) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                icon={MapPin}
                label="Pickup Note"
                name="transportPickupNote"
                value={values.transportPickupNote || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
                placeholder="مثال: مین گیٹ / فلاں جگہ"
              />
            </div>
          </div>

          {/* Guardian Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-emerald-100 text-right">
              سرپرست کی معلومات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={User}
                label="سرپرست کا نام"
                name="guardianName"
                value={values.guardianName || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <InputField
                icon={Users}
                label="رشتہ"
                name="guardianRelation"
                value={values.guardianRelation || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
                placeholder="والد/والدہ/چچا..."
              />
              <InputField
                icon={CreditCard}
                label="سرپرست CNIC"
                name="guardianCNIC"
                value={values.guardianCNIC || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <InputField
                icon={Phone}
                label="سرپرست فون"
                name="guardianPhone"
                value={values.guardianPhone || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <div className="group md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4 text-emerald-600" />
                  سرپرست کا پتہ
                </label>
                <textarea
                  name="guardianAddress"
                  value={values.guardianAddress || ""}
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
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  طالب علم کی تصویر
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="photoUrl"
                    value={values.photoUrl || ""}
                    onChange={onChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-2.5 text-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                  />
                </div>
                {photoError && (
                  <p className="mt-2 text-xs text-red-600 text-right">
                    {photoError}
                  </p>
                )}
              </div>
              <InputField
                icon={Hash}
                label="داخلہ نمبر"
                name="admissionNumber"
                value={values.admissionNumber || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <InputField
                icon={Calendar}
                label="داخلہ کی تاریخ"
                name="admissionDate"
                type="date"
                value={values.admissionDate || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
              />
              <InputField
                icon={BookOpen}
                label="سابقہ ادارہ"
                name="previousSchool"
                value={values.previousSchool || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
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
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  حلقہ
                </label>
                <select
                  name="halaqahId"
                  value={values.halaqahId || ""}
                  onChange={onChange}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 bg-white"
                >
                  <option value="">منتخب کریں</option>
                  {halaqah.map((h: any) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
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
              <SelectField
                icon={CreditCard}
                label="اسکالرشپ / رعایت"
                name="scholarshipType"
                value={(values as any).scholarshipType || "none"}
                onChange={onChange}
                options={[
                  { value: "none", label: "کوئی نہیں" },
                  { value: "percent", label: "فیصد" },
                  { value: "fixed", label: "فکسڈ رقم" },
                ]}
              />
              <InputField
                icon={CreditCard}
                label="اسکالرشپ ویلیو"
                name="scholarshipValue"
                type="number"
                value={(values as any).scholarshipValue ?? 0}
                onChange={onChange}
                onKeyPress={handleKeyPress}
                placeholder="0"
              />
              <InputField
                icon={AlertCircle}
                label="اسکالرشپ نوٹ"
                name="scholarshipNote"
                value={(values as any).scholarshipNote || ""}
                onChange={onChange}
                onKeyPress={handleKeyPress}
                placeholder="اختیاری"
              />
              <div className="group md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-600" />
                  نوٹس
                </label>
                <textarea
                  name="notes"
                  value={values.notes || ""}
                  onChange={onChange}
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 resize-none"
                />
              </div>
            </div>
          </div>

          {showPortalAccount && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-emerald-100 text-right">
                پورٹل اکاؤنٹ (اختیاری)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      طالب علم کے لیے لاگ اِن اکاؤنٹ بنائیں
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      اگر آپ چاہتے ہیں کہ طالب علم اپنا پورٹل استعمال کرے تو اس
                      آپشن کو فعال کریں۔
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setValues((v) => ({
                        ...v,
                        createPortalAccount: !v.createPortalAccount,
                      }))
                    }
                    className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none ${
                      values.createPortalAccount
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        values.createPortalAccount
                          ? "translate-x-7"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {values.createPortalAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600" />
                        یوزر نام
                      </label>
                      <input
                        type="text"
                        name="portalUsername"
                        value={values.portalUsername || ""}
                        onChange={onChange}
                        placeholder="مثال: رول نمبر یا منفرد یوزر نام"
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 hover:border-gray-300"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-emerald-600" />
                        پاس ورڈ
                      </label>
                      <input
                        type="password"
                        name="portalPassword"
                        value={values.portalPassword || ""}
                        onChange={onChange}
                        placeholder="کم از کم 6 حروف کا پاس ورڈ"
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 hover:border-gray-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
