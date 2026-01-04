import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { FinanceLayout } from "@/components/layout/FinanceLayout";

export default function FinanceDuesPage() {
  const [departmentId, setDepartmentId] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [departments, setDepartments] = useState<any[]>([]);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/finance/dues", {
        params: {
          departmentId: departmentId || undefined,
          q: q || undefined,
        },
      });
      setItems(res.data?.dues || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "لوڈ کرنے میں مسئلہ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const d = await api.get("/api/departments");
      setDepartments(d.data?.departments || []);
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalDue = useMemo(
    () => items.reduce((s, x) => s + Number(x.due || 0), 0),
    [items]
  );

  const csv = useMemo(() => {
    const header = [
      "invoiceNo",
      "student",
      "rollNumber",
      "period",
      "total",
      "paid",
      "due",
    ];
    const rows = items.map((r) => [
      r.invoiceNo,
      r.studentName,
      r.rollNumber,
      r.period || "",
      r.total || 0,
      r.paid || 0,
      r.due || 0,
    ]);
    const esc = (v: any) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  }, [items]);

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dues.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <FinanceLayout title="بقایا (Dues)">
      <div className="space-y-4" dir="rtl">
        {error && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="text-right">
              <label className="block text-xs text-gray-600 mb-1">شعبہ</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm bg-white"
              >
                <option value="">تمام</option>
                {departments.map((d: any) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Search</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Invoice No / Student"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={downloadCsv}
                className="rounded border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-gray-50"
              >
                CSV
              </button>
              <button
                onClick={load}
                className="rounded bg-primary text-white px-4 py-2 text-xs font-semibold"
              >
                لوڈ
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-500 text-right">کل بقایا</div>
          <div className="text-2xl font-bold text-right">
            {totalDue.toLocaleString("en-US")}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full text-sm text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2">انوائس</th>
                <th className="px-3 py-2">طالب علم</th>
                <th className="px-3 py-2">پیریڈ</th>
                <th className="px-3 py-2">کل</th>
                <th className="px-3 py-2">ادا</th>
                <th className="px-3 py-2">بقایا</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    لوڈ ہو رہا ہے...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    کوئی ریکارڈ نہیں
                  </td>
                </tr>
              )}
              {items.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="px-3 py-2 font-mono">{r.invoiceNo}</td>
                  <td className="px-3 py-2">
                    {r.studentName}{" "}
                    <span className="text-xs text-gray-400">
                      ({r.rollNumber})
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">{r.period || "—"}</td>
                  <td className="px-3 py-2">
                    {Number(r.total || 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2">
                    {Number(r.paid || 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2 font-semibold text-red-700">
                    {Number(r.due || 0).toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FinanceLayout>
  );
}
