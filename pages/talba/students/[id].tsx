import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import StudentForm, { StudentFormValues } from "@/components/talba/StudentForm";

export default function TalbaStudentDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const dept =
    (router.query.dept as "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ") || "HIFZ";

  const [initial, setInitial] = useState<Partial<StudentFormValues> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState<{
    type: string;
    title: string;
    url: string;
  }>({ type: "birth_certificate", title: "", url: "" });

  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<any[]>([]);

  const [classes, setClasses] = useState<{ _id: string; label: string }[]>([]);
  const [sections, setSections] = useState<{ _id: string; label: string }[]>(
    []
  );
  const [halaqah, setHalaqah] = useState<{ _id: string; name: string }[]>([]);

  const [transferForm, setTransferForm] = useState<{
    type: "Promotion" | "SectionChange" | "HalaqahChange" | "TC";
    toClassId: string;
    toSectionId: string;
    toHalaqahId: string;
    effectiveDate: string;
    reason: string;
    tcUrl: string;
  }>({
    type: "Promotion",
    toClassId: "",
    toSectionId: "",
    toHalaqahId: "",
    effectiveDate: "",
    reason: "",
    tcUrl: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/api/students/${id}`);
        const s = res.data?.student;
        if (s) {
          setInitial({
            fullName: s.fullName,
            gender: s.gender,
            fatherName: s.fatherName,
            dateOfBirth: s.dateOfBirth ? s.dateOfBirth.substring(0, 10) : "",
            contactNumber: s.contactNumber,
            emergencyContact: s.emergencyContact,
            cnic: s.cnic || "",
            address: s.address,
            photoUrl: s.photoUrl,
            guardianName: s.guardianName,
            guardianRelation: s.guardianRelation,
            guardianCNIC: s.guardianCNIC,
            guardianPhone: s.guardianPhone,
            guardianAddress: s.guardianAddress,
            admissionNumber: s.admissionNumber,
            admissionDate: s.admissionDate
              ? s.admissionDate.substring(0, 10)
              : "",
            previousSchool: s.previousSchool,
            notes: s.notes,
            departmentId: s.departmentId || "",
            classId: s.classId || "",
            sectionId: s.sectionId || "",
            halaqahId: s.halaqahId || "",
            isHostel: Boolean(s.isHostel),
            isTransport: Boolean(s.isTransport),
            transportRouteId: s.transportRouteId || "",
            transportPickupNote: s.transportPickupNote || "",
            scholarshipType: s.scholarshipType || "none",
            scholarshipValue: Number(s.scholarshipValue || 0),
            scholarshipNote: s.scholarshipNote || "",
            status: s.status,
          });
          const params: any = { departmentId: s.departmentId };
          if (s.sectionId) params.sectionId = s.sectionId;
          else if (s.classId) params.classId = s.classId;
          const asg = await api.get("/api/teaching-assignments", { params });
          setTeachers(
            (asg.data?.assignments || []).map((a: any) => a.teacherId)
          );
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "ریکارڈ نہیں ملا");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const loadTransfers = async () => {
    if (!id) return;
    try {
      const res = await api.get("/api/admin/student-transfers", {
        params: { studentId: id },
      });
      setTransfers(res.data?.transfers || []);
    } catch {
      setTransfers([]);
    }
  };

  const loadEnrollmentOptions = async (
    departmentId?: string,
    classId?: string
  ) => {
    if (!departmentId) return;
    try {
      const [classesRes, halaqahRes] = await Promise.all([
        api.get("/api/classes", { params: { departmentId } }),
        api.get("/api/halaqah", { params: { departmentId } }).catch(() => null),
      ]);
      setClasses(
        (classesRes.data?.classes || []).map((c: any) => ({
          _id: c._id,
          label: c.className || c.title,
        }))
      );
      setHalaqah((halaqahRes as any)?.data?.halaqah || []);

      if (classId) {
        const secRes = await api.get("/api/sections", {
          params: { departmentId, classId },
        });
        setSections(
          (secRes.data?.sections || []).map((s: any) => ({
            _id: s._id,
            label: s.sectionName || s.name,
          }))
        );
      } else {
        setSections([]);
      }
    } catch {
      setClasses([]);
      setSections([]);
      setHalaqah([]);
    }
  };

  useEffect(() => {
    loadTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!initial?.departmentId) return;
    loadEnrollmentOptions(
      String(initial.departmentId),
      String(initial.classId || "")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.departmentId]);

  const loadDocs = async () => {
    if (!id) return;
    try {
      setDocsLoading(true);
      setDocsError(null);
      const res = await api.get("/api/admin/student-documents", {
        params: { studentId: id },
      });
      setDocuments(res.data?.documents || []);
    } catch (e: any) {
      setDocsError(e?.response?.data?.message || "دستاویزات لوڈ نہیں ہو سکیں۔");
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values: StudentFormValues) => {
    if (!id) return;
    await api.put(`/api/students/${id}`, {
      ...values,
      rollNumber: values.admissionNumber || "",
    });
    router.push({ pathname: "/talba/students", query: { dept } });
  };

  const submitTransfer = async () => {
    if (!id) return;
    try {
      setTransferLoading(true);
      setTransferError(null);
      await api.post("/api/admin/student-transfers", {
        studentId: id,
        type: transferForm.type,
        toClassId:
          transferForm.type === "Promotion"
            ? transferForm.toClassId
            : undefined,
        toSectionId:
          transferForm.type === "SectionChange" ||
          transferForm.type === "Promotion"
            ? transferForm.toSectionId
            : undefined,
        toHalaqahId:
          transferForm.type === "HalaqahChange"
            ? transferForm.toHalaqahId
            : undefined,
        effectiveDate: transferForm.effectiveDate || undefined,
        reason: transferForm.reason || undefined,
        tcUrl: transferForm.tcUrl || undefined,
        markLeft: transferForm.type === "TC",
      });

      // reload student + history
      const res = await api.get(`/api/students/${id}`);
      const s = res.data?.student;
      if (s) {
        setInitial((prev) => ({
          ...(prev || {}),
          classId: s.classId || "",
          sectionId: s.sectionId || "",
          halaqahId: s.halaqahId || "",
          status: s.status,
          isHostel: Boolean(s.isHostel),
          isTransport: Boolean(s.isTransport),
          transportRouteId: s.transportRouteId || "",
          transportPickupNote: s.transportPickupNote || "",
        }));
      }
      await loadTransfers();
      await loadEnrollmentOptions(
        String(s?.departmentId || initial?.departmentId || ""),
        String(s?.classId || initial?.classId || "")
      );
      setTransferForm((p) => ({
        ...p,
        toClassId: "",
        toSectionId: "",
        toHalaqahId: "",
        effectiveDate: "",
        reason: "",
        tcUrl: "",
      }));
    } catch (e: any) {
      setTransferError(
        e?.response?.data?.message || "محفوظ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setTransferLoading(false);
    }
  };

  const addDocument = async () => {
    if (!id) return;
    if (!newDoc.title.trim()) return;
    try {
      setDocsLoading(true);
      setDocsError(null);
      const res = await api.post("/api/admin/student-documents", {
        studentId: id,
        type: newDoc.type,
        title: newDoc.title.trim(),
        url: newDoc.url.trim() || undefined,
        verified: false,
      });
      const created = res.data?.document;
      if (created) setDocuments((prev) => [created, ...prev]);
      setNewDoc((p) => ({ ...p, title: "", url: "" }));
    } catch (e: any) {
      setDocsError(e?.response?.data?.message || "دستاویز محفوظ نہیں ہو سکی۔");
    } finally {
      setDocsLoading(false);
    }
  };

  const updateDocument = async (docId: string, patch: any) => {
    try {
      setDocsLoading(true);
      setDocsError(null);
      const res = await api.put(`/api/admin/student-documents/${docId}`, patch);
      const updated = res.data?.document;
      if (updated) {
        setDocuments((prev) =>
          prev.map((d) => (d._id === docId ? updated : d))
        );
      }
    } catch (e: any) {
      setDocsError(e?.response?.data?.message || "اپ ڈیٹ نہیں ہو سکا۔");
    } finally {
      setDocsLoading(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm("کیا آپ واقعی یہ دستاویز حذف کرنا چاہتے ہیں؟")) return;
    try {
      setDocsLoading(true);
      setDocsError(null);
      await api.delete(`/api/admin/student-documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
    } catch (e: any) {
      setDocsError(e?.response?.data?.message || "حذف نہیں ہو سکا۔");
    } finally {
      setDocsLoading(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    if (!confirm("کیا آپ واقعی اس طالب علم کو حذف کرنا چاہتے ہیں؟")) return;
    await api.delete(`/api/students/${id}`);
    router.push({ pathname: "/talba/students", query: { dept } });
  };

  return (
    <TalbaLayout title="طالب علم کی تفصیل / ترمیم">
      {loading && (
        <p className="text-xs text-gray-500 text-right">لوڈ ہو رہا ہے...</p>
      )}
      {error && (
        <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
          {error}
        </div>
      )}
      {initial && (
        <div className="space-y-6">
          <StudentForm
            deptCode={dept}
            initial={initial}
            onSubmit={onSubmit}
            submitLabel="اپ ڈیٹ کریں"
          />

          <div className="flex justify-end gap-2" dir="rtl">
            <a
              href={`/talba/students/admission-form/${id}`}
              className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              داخلہ فارم پرنٹ
            </a>
            <a
              href={`/talba/students/id-card/${id}`}
              className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              ID کارڈ پرنٹ
            </a>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-800 text-right">
                طالب علم کی دستاویزات
              </h2>
              <button
                onClick={loadDocs}
                className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
              >
                ریفریش
              </button>
            </div>

            {docsError && (
              <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right mb-3">
                {docsError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="text-right">
                <label className="block text-xs text-gray-600 mb-1">قسم</label>
                <select
                  value={newDoc.type}
                  onChange={(e) =>
                    setNewDoc((p) => ({ ...p, type: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2 text-xs bg-white"
                >
                  <option value="birth_certificate">Birth Certificate</option>
                  <option value="b_form">B-Form</option>
                  <option value="cnic">CNIC</option>
                  <option value="previous_school">Previous School</option>
                  <option value="photo">Photo</option>
                  <option value="admission_form">Admission Form</option>
                  <option value="character_certificate">
                    Character Certificate
                  </option>
                  <option value="id_card">ID Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="text-right">
                <label className="block text-xs text-gray-600 mb-1">
                  عنوان
                </label>
                <input
                  value={newDoc.title}
                  onChange={(e) =>
                    setNewDoc((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2 text-xs"
                  placeholder="مثال: برتھ سرٹیفیکیٹ"
                />
              </div>
              <div className="text-right md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">
                  لنک (URL)
                </label>
                <input
                  value={newDoc.url}
                  onChange={(e) =>
                    setNewDoc((p) => ({ ...p, url: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2 text-xs"
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button
                  disabled={docsLoading}
                  onClick={addDocument}
                  className="rounded bg-primary text-white px-5 py-2 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
                >
                  نیا ڈاکومنٹ شامل کریں
                </button>
              </div>
            </div>

            {docsLoading && documents.length === 0 && (
              <p className="text-xs text-gray-500 text-right">
                لوڈ ہو رہا ہے...
              </p>
            )}

            <div className="space-y-2">
              {documents.length === 0 && !docsLoading && (
                <p className="text-xs text-gray-500 text-right">
                  کوئی دستاویز موجود نہیں۔
                </p>
              )}
              {documents.map((d: any) => (
                <div
                  key={d._id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-right flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {d.title}
                      </div>
                      <div className="text-xs text-gray-600">{d.type}</div>
                      {d.pdfPath && (
                        <a
                          href={d.pdfPath}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-700 hover:underline break-all"
                        >
                          {d.pdfPath}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <label className="flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={Boolean(d.verified)}
                          onChange={(e) =>
                            updateDocument(d._id, {
                              verified: e.target.checked,
                            })
                          }
                        />
                        Verified
                      </label>
                      <button
                        onClick={() => deleteDocument(d._id)}
                        className="text-xs text-red-700 hover:underline"
                      >
                        حذف کریں
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    <div className="text-right">
                      <label className="block text-[11px] text-gray-600 mb-1">
                        عنوان
                      </label>
                      <input
                        defaultValue={d.title}
                        onBlur={(e) =>
                          updateDocument(d._id, { title: e.target.value })
                        }
                        className="w-full rounded border px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="text-right">
                      <label className="block text-[11px] text-gray-600 mb-1">
                        لنک (URL)
                      </label>
                      <input
                        defaultValue={d.pdfPath || ""}
                        onBlur={(e) =>
                          updateDocument(d._id, { url: e.target.value })
                        }
                        className="w-full rounded border px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            dir="rtl"
          >
            <div className="flex items-end justify-between gap-3 mb-3">
              <h2 className="text-base font-semibold text-gray-800 text-right">
                پروموشن / ٹرانسفر / TC
              </h2>
              <button
                onClick={loadTransfers}
                className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
              >
                ریفریش
              </button>
            </div>

            {transferError && (
              <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right mb-3">
                {transferError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="text-right">
                <label className="block text-xs text-gray-600 mb-1">عمل</label>
                <select
                  value={transferForm.type}
                  onChange={(e) =>
                    setTransferForm((p) => ({
                      ...p,
                      type: e.target.value as any,
                      toClassId: "",
                      toSectionId: "",
                      toHalaqahId: "",
                    }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm bg-white"
                >
                  <option value="Promotion">پروموشن (کلاس تبدیلی)</option>
                  <option value="SectionChange">سیکشن تبدیلی</option>
                  <option value="HalaqahChange">حلقہ تبدیلی</option>
                  <option value="TC">TC / Leaving</option>
                </select>
              </div>

              {(transferForm.type === "Promotion" ||
                transferForm.type === "SectionChange") && (
                <div className="text-right">
                  <label className="block text-xs text-gray-600 mb-1">
                    نیا سیکشن
                  </label>
                  <select
                    value={transferForm.toSectionId}
                    onChange={(e) =>
                      setTransferForm((p) => ({
                        ...p,
                        toSectionId: e.target.value,
                      }))
                    }
                    className="w-full rounded border px-3 py-2 text-sm bg-white"
                  >
                    <option value="">منتخب کریں</option>
                    {sections.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {transferForm.type === "Promotion" && (
                <div className="text-right">
                  <label className="block text-xs text-gray-600 mb-1">
                    نئی کلاس
                  </label>
                  <select
                    value={transferForm.toClassId}
                    onChange={async (e) => {
                      const toClassId = e.target.value;
                      setTransferForm((p) => ({
                        ...p,
                        toClassId,
                        toSectionId: "",
                      }));
                      if (initial?.departmentId && toClassId) {
                        try {
                          const secRes = await api.get("/api/sections", {
                            params: {
                              departmentId: initial.departmentId,
                              classId: toClassId,
                            },
                          });
                          setSections(
                            (secRes.data?.sections || []).map((s: any) => ({
                              _id: s._id,
                              label: s.sectionName || s.name,
                            }))
                          );
                        } catch {
                          setSections([]);
                        }
                      }
                    }}
                    className="w-full rounded border px-3 py-2 text-sm bg-white"
                  >
                    <option value="">منتخب کریں</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {transferForm.type === "HalaqahChange" && (
                <div className="text-right">
                  <label className="block text-xs text-gray-600 mb-1">
                    نیا حلقہ
                  </label>
                  <select
                    value={transferForm.toHalaqahId}
                    onChange={(e) =>
                      setTransferForm((p) => ({
                        ...p,
                        toHalaqahId: e.target.value,
                      }))
                    }
                    className="w-full rounded border px-3 py-2 text-sm bg-white"
                  >
                    <option value="">منتخب کریں</option>
                    {halaqah.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="text-right">
                <label className="block text-xs text-gray-600 mb-1">
                  موثر تاریخ
                </label>
                <input
                  type="date"
                  value={transferForm.effectiveDate}
                  onChange={(e) =>
                    setTransferForm((p) => ({
                      ...p,
                      effectiveDate: e.target.value,
                    }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="text-right md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">
                  وجہ / نوٹ
                </label>
                <input
                  value={transferForm.reason}
                  onChange={(e) =>
                    setTransferForm((p) => ({ ...p, reason: e.target.value }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              {transferForm.type === "TC" && (
                <div className="text-right md:col-span-3">
                  <label className="block text-xs text-gray-600 mb-1">
                    TC URL (اختیاری)
                  </label>
                  <input
                    value={transferForm.tcUrl}
                    onChange={(e) =>
                      setTransferForm((p) => ({ ...p, tcUrl: e.target.value }))
                    }
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="md:col-span-3 flex justify-end">
                <button
                  disabled={transferLoading}
                  onClick={submitTransfer}
                  className="rounded bg-gray-900 text-white px-6 py-2 text-sm font-semibold hover:bg-black disabled:opacity-60"
                >
                  {transferLoading ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-800 text-right mb-2">
                ہسٹری
              </h3>
              <div className="rounded border border-gray-100 overflow-hidden bg-white">
                <table className="min-w-full text-xs text-right">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        قسم
                      </th>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        تاریخ
                      </th>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        نوٹ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-4 text-center text-gray-400"
                        >
                          کوئی ہسٹری موجود نہیں۔
                        </td>
                      </tr>
                    )}
                    {transfers.map((t: any) => (
                      <tr key={t._id} className="border-t">
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {t.type}
                        </td>
                        <td className="px-3 py-2">
                          {t.effectiveDate
                            ? new Date(t.effectiveDate).toLocaleDateString(
                                "ur-PK"
                              )
                            : t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString("ur-PK")
                            : "—"}
                        </td>
                        <td className="px-3 py-2">{t.reason || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-800 mb-3 text-right">
              اس کلاس/سیکشن کے اساتذہ
            </h2>
            {teachers.length === 0 && (
              <p className="text-xs text-gray-500 text-right">
                کوئی ریکارڈ موجود نہیں۔
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teachers.map((t: any, idx: number) => (
                <div
                  key={`${t?._id || idx}`}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-right"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {t?.fullName}
                  </div>
                  {t?.designation && (
                    <div className="text-xs text-gray-600">{t.designation}</div>
                  )}
                  {t?.contactNumber && (
                    <div className="text-xs text-gray-500">
                      {t.contactNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onDelete}
              className="inline-flex items-center rounded bg-red-600 text-white px-6 py-2 text-sm font-semibold hover:bg-red-700"
            >
              حذف کریں
            </button>
          </div>
        </div>
      )}
    </TalbaLayout>
  );
}
