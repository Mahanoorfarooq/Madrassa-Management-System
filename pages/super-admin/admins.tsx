import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

interface JamiaOption {
  _id: string;
  name: string;
}

interface AdminRow {
  _id: string;
  fullName: string;
  username: string;
  status: "active" | "disabled";
  jamiaId?: string;
}

export default function SuperAdminAdminsPage() {
  const router = useRouter();
  const [jamias, setJamias] = useState<JamiaOption[]>([]);
  const [items, setItems] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterJamiaId, setFilterJamiaId] = useState<string>("");

  const [creating, setCreating] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newJamiaId, setNewJamiaId] = useState<string>("");
  const [newStatus, setNewStatus] = useState<"active" | "disabled">("active");

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("madrassa_token")
        : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const loadJamias = async () => {
    try {
      const res = await api.get("/api/super-admin/jamias");
      setJamias(res.data?.jamias || []);
    } catch (e) {
      // ignore for now, handled via error on admins load
    }
  };

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/super-admin/admins", {
        params: {
          jamiaId: filterJamiaId || undefined,
        },
      });
      setItems(res.data?.admins || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "ایڈمنز لوڈ کرنے میں مسئلہ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJamias();
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterJamiaId]);

  const jamiaNameById = useMemo(() => {
    const map: Record<string, string> = {};
    jamias.forEach((j) => {
      map[j._id] = j.name;
    });
    return map;
  }, [jamias]);

  const createAdmin = async () => {
    if (!newFullName.trim() || !newUsername.trim() || !newPassword.trim()) {
      return;
    }
    if (!newJamiaId) {
      setError("براہ کرم جامعہ منتخب کریں");
      return;
    }
    try {
      setCreating(true);
      setError(null);
      await api.post("/api/super-admin/admins", {
        fullName: newFullName.trim(),
        username: newUsername.trim(),
        password: newPassword,
        jamiaId: newJamiaId,
        status: newStatus,
      });
      setNewFullName("");
      setNewUsername("");
      setNewPassword("");
      setNewJamiaId("");
      setNewStatus("active");
      await loadAdmins();
    } catch (e: any) {
      setError(e?.response?.data?.message || "نیا ایڈمن بنانے میں مسئلہ");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (admin: AdminRow) => {
    try {
      setError(null);
      await api.patch(`/api/super-admin/admins/${admin._id}`, {
        status: admin.status === "active" ? "disabled" : "active",
      });
      await loadAdmins();
    } catch (e: any) {
      setError(e?.response?.data?.message || "اسٹیٹس تبدیل کرنے میں مسئلہ");
    }
  };

  const resetPassword = async (admin: AdminRow) => {
    const pwd = window.prompt("نیا پاس ورڈ درج کریں:");
    if (!pwd) return;
    try {
      setError(null);
      await api.patch(`/api/super-admin/admins/${admin._id}`, {
        password: pwd,
      });
      await loadAdmins();
    } catch (e: any) {
      setError(e?.response?.data?.message || "پاس ورڈ ری سیٹ کرنے میں مسئلہ");
    }
  };

  return (
    <div className="min-h-screen bg-lightBg p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-right">
        ایڈمن اکاؤنٹ مینجمنٹ
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm text-right">
          {error}
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <h2 className="text-lg font-semibold text-right">
          نیا ایڈمن شامل کریں
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-right">
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="نام"
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="یوزر نام"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input
            type="password"
            className="border rounded px-3 py-2 text-sm text-right"
            placeholder="پاس ورڈ"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2 text-sm text-right bg-white"
            value={newJamiaId}
            onChange={(e) => setNewJamiaId(e.target.value)}
          >
            <option value="">جامعہ منتخب کریں</option>
            {jamias.map((j) => (
              <option key={j._id} value={j._id}>
                {j.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded px-3 py-2 text-sm text-right bg-white"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as any)}
          >
            <option value="active">فعال</option>
            <option value="disabled">غیر فعال</option>
          </select>
        </div>
        <div className="flex justify-end mt-2">
          <button
            onClick={createAdmin}
            disabled={creating}
            className="px-4 py-2 rounded bg-primary text-white text-sm disabled:opacity-60"
          >
            {creating ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-right flex-1">
            تمام ایڈمنز
          </h2>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-gray-600">جامعہ فلٹر:</span>
            <select
              className="border rounded px-2 py-1 text-xs text-right bg-white"
              value={filterJamiaId}
              onChange={(e) => setFilterJamiaId(e.target.value)}
            >
              <option value="">سب</option>
              {jamias.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.name}
                </option>
              ))}
            </select>
            {loading && (
              <span className="text-xs text-gray-500">لوڈ ہو رہا ہے...</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2">نام</th>
                <th className="px-3 py-2">یوزر نام</th>
                <th className="px-3 py-2">جامعہ</th>
                <th className="px-3 py-2">اسٹیٹس</th>
                <th className="px-3 py-2">ایکشن</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="px-3 py-2">{a.fullName}</td>
                  <td className="px-3 py-2">{a.username}</td>
                  <td className="px-3 py-2">
                    {a.jamiaId ? jamiaNameById[a.jamiaId] || a.jamiaId : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {a.status === "active" ? (
                      <span className="text-xs text-green-600">فعال</span>
                    ) : (
                      <span className="text-xs text-red-600">غیر فعال</span>
                    )}
                  </td>
                  <td className="px-3 py-2 space-x-2 space-x-reverse">
                    <button
                      onClick={() => toggleActive(a)}
                      className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                    >
                      {a.status === "active" ? "غیر فعال کریں" : "فعال کریں"}
                    </button>
                    <button
                      onClick={() => resetPassword(a)}
                      className="px-2 py-1 text-xs rounded bg-amber-600 text-white"
                    >
                      پاس ورڈ ری سیٹ
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-gray-500"
                  >
                    کوئی ایڈمن موجود نہیں۔
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
