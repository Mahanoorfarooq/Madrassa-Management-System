import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/schemas/User";
import { Jamia, IJamia } from "@/schemas/Jamia";
import { requireAuth, hashPassword } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["super_admin"]);
  if (!me) return;

  await connectDB();

  if (req.method === "GET") {
    const { jamiaId, status } = req.query as {
      jamiaId?: string;
      status?: "active" | "disabled";
    };

    const filter: any = { role: "admin" };
    if (jamiaId) filter.jamiaId = jamiaId;
    if (status) filter.status = status;

    const admins = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.status(200).json({ admins });
  }

  if (req.method === "POST") {
    const { fullName, username, password, jamiaId, status } = req.body as {
      fullName: string;
      username: string;
      password: string;
      jamiaId?: string;
      status?: "active" | "disabled";
    };

    if (!fullName || !username || !password || !jamiaId) {
      return res.status(400).json({
        message: "نام، یوزر نام، پاس ورڈ اور جامعہ درکار ہیں",
      });
    }

    const exists = await User.findOne({ username }).lean();
    if (exists) {
      return res.status(409).json({ message: "یہ یوزر نام پہلے سے موجود ہے" });
    }

    const jamia = (await Jamia.findById(jamiaId).lean()) as IJamia | null;
    if (!jamia || jamia.isDeleted) {
      return res.status(404).json({ message: "جامعہ نہیں ملا" });
    }

    const created = await User.create({
      fullName,
      username,
      passwordHash: hashPassword(password),
      role: "admin",
      jamiaId: jamia._id,
      status: status || "active",
      permissions: [],
    });

    const safe = {
      id: created._id,
      fullName: created.fullName,
      username: created.username,
      role: created.role,
      status: created.status,
      jamiaId: created.jamiaId,
    };

    return res
      .status(201)
      .json({ message: "ایڈمن اکاؤنٹ بنا دیا گیا", admin: safe });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
