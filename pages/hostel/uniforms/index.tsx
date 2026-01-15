import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { HostelLayout } from "@/components/layout/HostelLayout";

interface UniformItem {
  _id: string;
  title: string;
  size?: string;
  gender?: string;
  hostelId?: any;
  totalQty: number;
  availableQty: number;
}

interface Student {
  _id: string;
  fullName: string;
  rollNumber?: string;
}

export default function HostelUniformsPage() {
  const [items, setItems] = useState<UniformItem[]>([]);
  const [issues, setIssues] = useState<any[]>([]);

  const [hostels, setHostels] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [hostelId, setHostelId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"Issued" | "Returned">(
    "Issued"
  );

  const [itemTitle, setItemTitle] = useState("");
  const [itemSize, setItemSize] = useState("");
  const [itemGender, setItemGender] = useState<string>("");
  const [itemQty, setItemQty] = useState<string>("");

  const [issueItemId, setIssueItemId] = useState<string>("");
  const [issueStudentId, setIssueStudentId] = useState<string>("");
  const [issueQty, setIssueQty] = useState<string>("1");
  const [issueError, setIssueError] = useState<string | null>(null);

  const loadItems = async () => {
    const res = await api.get("/api/hostel/uniform-items", {
      params: { hostelId: hostelId || undefined },
    });
    setItems(res.data?.items || []);
  };

  const loadIssues = async () => {
    const res = await api.get("/api/hostel/uniform-issues", {
      params: { hostelId: hostelId || undefined, status: statusFilter },
    });
    setIssues(res.data?.issues || []);
  };

  useEffect(() => {
    const boot = async () => {
      const [h, s] = await Promise.all([
        api.get("/api/hostel/hostels"),
        api.get("/api/students"),
      ]);
      setHostels(h.data?.hostels || []);
      setStudents(s.data?.students || []);
      await loadItems();
      await loadIssues();
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadItems();
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostelId, statusFilter]);

  const totalStock = useMemo(
    () => items.reduce((s, x) => s + Number(x.totalQty || 0), 0),
    [items]
  );
  const totalAvailable = useMemo(
    () => items.reduce((s, x) => s + Number(x.availableQty || 0), 0),
    [items]
  );

  const issuesCsv = useMemo(() => {
    const header = [
      "issueDate",
      "studentName",
      "rollNumber",
      "item",
      "size",
      "quantity",
      "status",
    ];
    const rows = issues.map((r) => [
      r.issueDate ? new Date(r.issueDate).toISOString().substring(0, 10) : "",
      r.studentId?.fullName || "",
      r.studentId?.rollNumber || "",
      r.itemId?.title || "",
      r.itemId?.size || "",
      r.quantity || 0,
      r.status || "",
    ]);
    const esc = (v: any) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  }, [issues]);

  const downloadIssuesCsv = () => {
    if (!issuesCsv) return;
    const blob = new Blob([issuesCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uniform_issues.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const createItem = async () => {
    setIssueError(null);
    const total = Number(itemQty || 0);
    if (!itemTitle.trim() || !total) {
      setIssueError("نام اور تعداد درکار ہیں");
      return;
    }
    await api.post("/api/hostel/uniform-items", {
      title: itemTitle,
      size: itemSize || undefined,
      gender: itemGender || undefined,
      hostelId: hostelId || undefined,
      totalQty: total,
    });
    setItemTitle("");
    setItemSize("");
    setItemGender("");
    setItemQty("");
    await loadItems();
  };

  const issueUniform = async () => {
    setIssueError(null);
    const qty = Number(issueQty || 0);
    if (!issueItemId || !issueStudentId || !qty) {
      setIssueError("آئٹم، طالب علم اور مقدار منتخب کریں");
      return;
    }
    await api.post("/api/hostel/uniform-issues", {
      itemId: issueItemId,
      studentId: issueStudentId,
      hostelId: hostelId || undefined,
      quantity: qty,
    });
    setIssueItemId("");
    setIssueStudentId("");
    setIssueQty("1");
    await loadItems();
    await loadIssues();
  };

  const returnIssue = async (id: string) => {
    await api.put(`/api/hostel/uniform-issues/${id}`, { action: "return" });
    await loadItems();
    await loadIssues();
  };

  return (
    <HostelLayout title="یونیفارم انوینٹری">
      <div className="space-y-4" dir="rtl">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="text-right">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ہاسٹل
              </label>
              <select
                value={hostelId}
                onChange={(e) => setHostelId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">تمام ہاسٹلز</option>
                {hostels.map((h: any) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ایشو حیثیت
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="Issued">جاری شدہ</option>
                <option value="Returned">واپس شدہ</option>
              </select>
            </div>
            <div className="text-right text-xs text-gray-500">
              یہاں سے آپ یونیفارم کا اسٹاک منیج کر سکتے ہیں اور طلبہ کو یونیفارم
              جاری / واپس کا ریکارڈ رکھ سکتے ہیں۔
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-right">
            <div className="text-xs text-gray-500">کل آئٹمز</div>
            <div className="text-2xl font-bold">{items.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-right">
            <div className="text-xs text-gray-500">کل اسٹاک</div>
            <div className="text-2xl font-bold">
              {totalStock.toLocaleString("en-US")}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-right">
            <div className="text-xs text-gray-500">دستیاب</div>
            <div className="text-2xl font-bold text-emerald-600">
              {totalAvailable.toLocaleString("en-US")}
            </div>
          </div>
        </div>

        {issueError && (
          <div className="rounded bg-red-100 text-red-700 text-xs px-3 py-2 text-right">
            {issueError}
          </div>
        )}

        {/* Create Item + Issue */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Item */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gray-800 text-right">
                نیا یونیفارم آئٹم
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-right">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    نام
                  </label>
                  <input
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="مثال: شرٹ، شلوار"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    سائز
                  </label>
                  <input
                    value={itemSize}
                    onChange={(e) => setItemSize(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="S/M/L/XL"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    تعداد
                  </label>
                  <input
                    type="number"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-right focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={createItem}
                  className="rounded bg-primary text-white px-4 py-2 text-xs font-semibold"
                >
                  آئٹم محفوظ کریں
                </button>
              </div>
            </div>

            {/* Issue */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gray-800 text-right">
                یونیفارم جاری کریں
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-right">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    آئٹم
                  </label>
                  <select
                    value={issueItemId}
                    onChange={(e) => setIssueItemId(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">منتخب کریں</option>
                    {items.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.title}
                        {i.size ? ` (${i.size})` : ""} - {i.availableQty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    طالب علم
                  </label>
                  <select
                    value={issueStudentId}
                    onChange={(e) => setIssueStudentId(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">منتخب کریں</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.fullName}
                        {s.rollNumber ? ` (${s.rollNumber})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    مقدار
                  </label>
                  <input
                    type="number"
                    value={issueQty}
                    onChange={(e) => setIssueQty(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-right focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={issueUniform}
                  className="rounded bg-primary text-white px-4 py-2 text-xs font-semibold"
                >
                  جاری کریں
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="min-w-full text-xs text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2">آئٹم</th>
                <th className="px-3 py-2">سائز</th>
                <th className="px-3 py-2">کل</th>
                <th className="px-3 py-2">دستیاب</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    کوئی آئٹم نہیں
                  </td>
                </tr>
              )}
              {items.map((i) => (
                <tr key={i._id} className="border-b">
                  <td className="px-3 py-2">{i.title}</td>
                  <td className="px-3 py-2">{i.size || "—"}</td>
                  <td className="px-3 py-2">
                    {Number(i.totalQty || 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2">
                    {Number(i.availableQty || 0).toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="flex justify-end px-3 pt-3 pb-1">
            <button
              onClick={downloadIssuesCsv}
              className="rounded border border-gray-200 px-4 py-1.5 text-[11px] font-semibold hover:bg-gray-50"
            >
              CSV
            </button>
          </div>
          <table className="min-w-full text-xs text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2">تاریخ</th>
                <th className="px-3 py-2">طالب علم</th>
                <th className="px-3 py-2">آئٹم</th>
                <th className="px-3 py-2">مقدار</th>
                <th className="px-3 py-2">حیثیت</th>
                <th className="px-3 py-2">عمل</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    کوئی ریکارڈ نہیں
                  </td>
                </tr>
              )}
              {issues.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="px-3 py-2">
                    {r.issueDate
                      ? new Date(r.issueDate).toLocaleDateString("ur-PK")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.studentId?.fullName || "—"}
                    {r.studentId?.rollNumber && (
                      <span className="text-[10px] text-gray-400">
                        ({r.studentId.rollNumber})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {r.itemId?.title} {r.itemId?.size && `(${r.itemId.size})`}
                  </td>
                  <td className="px-3 py-2">
                    {Number(r.quantity || 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2">
                    {r.status === "Issued" ? "جاری شدہ" : "واپس شدہ"}
                  </td>
                  <td className="px-3 py-2 text-left">
                    {r.status === "Issued" ? (
                      <button
                        onClick={() => returnIssue(r._id)}
                        className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px] hover:bg-emerald-700"
                      >
                        واپس کریں
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </HostelLayout>
  );
}
