import { FormEvent, useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import api from "@/utils/api";

interface MessageItem {
  id: number;
  from: string;
  subject: string;
  body: string;
  date: string;
}

interface NotificationItem {
  id: string;
  channel: string;
  title: string;
  date: string;
}

interface TicketItem {
  id: string;
  category: string;
  subject: string;
  status: "Open" | "InProgress" | "Resolved";
  createdAt: string;
}

export default function StudentCommunication() {
  const [messages] = useState<MessageItem[]>([
    {
      id: 1,
      from: "کلاس استاد",
      subject: "ہوم ورک کی یاد دہانی",
      body: "براہ کرم کل تک فقہ کا ہوم ورک مکمل کر کے لائیں۔",
      date: "2025-12-05",
    },
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [category, setCategory] = useState<string>("IT");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, nRes] = await Promise.all([
          api.get("/api/student/tickets"),
          api.get("/api/student/notifications"),
        ]);

        const tList = (tRes.data?.tickets || []) as any[];
        const mappedTickets: TicketItem[] = tList.map((t) => ({
          id: String(t._id),
          category: t.category,
          subject: t.subject,
          status: t.status as TicketItem["status"],
          createdAt: t.createdAt,
        }));
        setTickets(mappedTickets);

        const nList = (nRes.data?.notifications || []) as any[];
        const mappedNotifs: NotificationItem[] = nList.map((n) => ({
          id: String(n._id),
          channel: n.channel || "in_app",
          title: n.title,
          date: n.createdAt,
        }));
        setNotifications(mappedNotifs);
      } catch {
        // ignore; page still works with empty data
      }
    };

    load();
  }, []);

  const submitTicket = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    try {
      setTicketSubmitting(true);
      setTicketError(null);
      const res = await api.post("/api/student/tickets", {
        category,
        subject,
        description,
      });
      const created = res.data?.ticket as any;
      if (created) {
        const next: TicketItem = {
          id: String(created._id),
          category: created.category,
          subject: created.subject,
          status: created.status,
          createdAt: created.createdAt,
        };
        setTickets((prev) => [next, ...prev]);
      }
      setSubject("");
      setDescription("");
    } catch (e: any) {
      setTicketError(
        e?.response?.data?.message || "ٹکٹ محفوظ کرنے میں مسئلہ پیش آیا۔"
      );
    } finally {
      setTicketSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-4" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right text-xs space-y-3">
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              اندرونی پیغامات
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-gray-800">
                      {m.subject}
                    </span>
                    <span className="text-[10px] text-gray-500">{m.from}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-1">
                    {new Date(m.date).toLocaleDateString("ur-PK")}
                  </div>
                  <p className="text-[11px] text-gray-700">{m.body}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-[11px] text-gray-500">
                  اس وقت کوئی پیغام موجود نہیں۔
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right text-xs space-y-3">
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              نوٹیفکیشن لاگ
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2 flex items-center justify-between"
                >
                  <div className="text-right">
                    <div className="text-[11px] font-semibold text-gray-800">
                      {n.title}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {new Date(n.date).toLocaleDateString("ur-PK")}
                    </div>
                  </div>
                  <span className="text-[10px] text-primary">{n.channel}</span>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-[11px] text-gray-500">
                  اس وقت کوئی نوٹیفکیشن لاگ نہیں ہے۔
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-right text-xs space-y-3">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            شکایت / ہیلپ ڈیسک ٹکٹ
          </h2>
          <form onSubmit={submitTicket} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-1">
                <label className="block mb-1 text-[11px] text-gray-600">
                  کیٹیگری
                </label>
                <select
                  className="w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="IT">IT / پورٹل</option>
                  <option value="Fees">فیس / مالیات</option>
                  <option value="Hostel">ہاسٹل</option>
                  <option value="Other">دیگر</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-[11px] text-gray-600">
                  عنوان
                </label>
                <input
                  className="w-full rounded border px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="شکایت یا درخواست کا مختصر عنوان"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-600">
                تفصیل
              </label>
              <textarea
                className="w-full rounded border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مسئلے کی مکمل تفصیل لکھیں"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              disabled={
                !subject.trim() || !description.trim() || ticketSubmitting
              }
            >
              ٹکٹ جمع کریں
            </button>
          </form>
          {ticketError && (
            <p className="text-[11px] text-red-600 mt-2">{ticketError}</p>
          )}

          {tickets.length > 0 && (
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                میری ٹکٹس
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 flex items-center justify-between"
                  >
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-gray-800">
                        {t.subject}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        کیٹیگری: {t.category} | تاریخ:{" "}
                        {new Date(t.createdAt).toLocaleDateString("ur-PK")}
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700">
                      {t.status === "Open"
                        ? "کھلا ہوا"
                        : t.status === "InProgress"
                        ? "جاری"
                        : "حل شدہ"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
