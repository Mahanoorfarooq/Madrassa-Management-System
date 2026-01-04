"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";

interface JamiaDoc {
  _id: string;
  name: string;
  logo?: string;
  address?: string;
  isActive: boolean;
  isDeleted: boolean;
  settings?: { feeCurrency?: string; academicYear?: string };
  modules?: {
    admissions: boolean;
    attendance: boolean;
    exams: boolean;
    fees: boolean;
    hostel: boolean;
    library: boolean;
    donations: boolean;
  };
}

export default function JamiaEditPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [doc, setDoc] = useState<JamiaDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/super-admin/jamias/${id}`);
        setDoc(res.data?.jamia || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || "ریکارڈ لوڈ کرنے میں مسئلہ");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const updateField = (k: keyof JamiaDoc, v: any) =>
    setDoc((d) => (d ? { ...d, [k]: v } : d));
  const updateSetting = (k: keyof NonNullable<JamiaDoc["settings"]>, v: any) =>
    setDoc((d) =>
      d ? { ...d, settings: { ...(d.settings || {}), [k]: v } } : d
    );
  const toggleModule = (k: keyof NonNullable<JamiaDoc["modules"]>) =>
    setDoc((d) =>
      d
        ? {
            ...d,
            modules: { ...(d.modules || ({} as any)), [k]: !d.modules?.[k] },
          }
        : d
    );

  const save = async () => {
    if (!doc) return;
    try {
      setSaving(true);
      setError(null);
      await api.put(`/api/super-admin/jamias/${doc._id}`, {
        name: doc.name,
        logo: doc.logo || undefined,
        address: doc.address || undefined,
        isActive: doc.isActive,
        modules: doc.modules,
        settings: doc.settings,
      });
      router.push("/super-admin/jamias");
    } catch (e: any) {
      setError(e?.response?.data?.message || "محفوظ کرنے میں مسئلہ");
    } finally {
      setSaving(false);
    }
  };

  const softDelete = async () => {
    if (!doc) return;
    if (!confirm("کیا آپ واقعی اس جامعہ کو مستقل غیر فعال کرنا چاہتے ہیں؟"))
      return;
    try {
      await api.delete(`/api/super-admin/jamias/${doc._id}`);
      router.push("/super-admin/jamias");
    } catch (e: any) {
      setError(e?.response?.data?.message || "جامعہ غیر فعال کرنے میں مسئلہ");
    }
  };

  if (loading || !doc) return <p className="text-sm">لوڈ ہو رہا ہے…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-right">جامعہ ترمیم</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={softDelete}
            className="px-3 py-2 rounded bg-red-600 text-white text-sm"
          >
            مستقل غیر فعال
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm text-right">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="جامعہ کا نام"
            value={doc.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="لوگو (URL)"
            value={doc.logo || ""}
            onChange={(e) => updateField("logo", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="پتہ"
            value={doc.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
          />
          <label className="flex items-center justify-end gap-2 text-sm">
            <input
              type="checkbox"
              checked={doc.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
            />
            <span>فعال</span>
          </label>
        </div>

        <div>
          <div className="font-medium mb-2 text-right">ماڈیولز</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-right">
            {Object.entries(doc.modules || {}).map(([k, v]) => (
              <label
                key={k}
                className="flex items-center justify-end gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={Boolean(v)}
                  onChange={() => toggleModule(k as any)}
                />
                <span>{labelFor(k)}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="font-medium mb-2 text-right">سیٹنگز</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border rounded px-3 py-2 text-sm text-right"
              placeholder="فیس کرنسی"
              value={doc.settings?.feeCurrency || ""}
              onChange={(e) => updateSetting("feeCurrency", e.target.value)}
            />
            <input
              className="border rounded px-3 py-2 text-sm text-right"
              placeholder="اکیڈمک سال"
              value={doc.settings?.academicYear || ""}
              onChange={(e) => updateSetting("academicYear", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => history.back()}
            className="px-4 py-2 rounded border"
          >
            واپس
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
          >
            {saving ? "محفوظ ہو رہا ہے…" : "محفوظ کریں"}
          </button>
        </div>
      </div>
    </div>
  );
}

function labelFor(k: string) {
  switch (k) {
    case "admissions":
      return "داخلے";
    case "attendance":
      return "حاضری";
    case "exams":
      return "امتحانات";
    case "fees":
      return "فیس";
    case "hostel":
      return "ہاسٹل";
    case "library":
      return "کتب خانہ";
    case "donations":
      return "عطیات";
    default:
      return k;
  }
}
