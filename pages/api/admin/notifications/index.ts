import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Notification } from "@/schemas/Notification";
import { sendNotification } from "@/utils/notifications";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin"]);
  if (!me) return;

  await connectDB();

  if (req.method === "GET") {
    const { role, channel } = req.query as any;
    const filter: any = {};
    if (role) filter.role = role;
    if (channel) filter.channel = channel;

    const list = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.status(200).json({ notifications: list });
  }

  if (req.method === "POST") {
    const { role, title, message, channel } = req.body as any;
    if (!title || !message || !channel) {
      return res
        .status(400)
        .json({ message: "عنوان، پیغام اور چینل درکار ہیں" });
    }

    const doc = await Notification.create({
      role: role || undefined,
      title,
      message,
      channel,
      sent: false,
    });

    // Mock send
    await sendNotification(doc as any);
    doc.sent = true;
    await doc.save();

    return res
      .status(201)
      .json({ message: "نوٹیفکیشن بن گیا", notification: doc });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
