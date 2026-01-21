import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/schemas/User";
import { Jamia, IJamia } from "@/schemas/Jamia";
import { requireSuperAdminUnlocked, hashPassword } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const me = requireSuperAdminUnlocked(req, res);
  if (!me) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const admin = await User.findOne({ _id: id, role: "admin" })
      .select("-passwordHash")
      .lean();
    if (!admin) {
      return res.status(404).json({ message: "ایڈمن نہیں ملا" });
    }
    return res.status(200).json({ admin });
  }

  if (req.method === "PATCH") {
    const { status, password, jamiaId } = req.body as {
      status?: "active" | "disabled";
      password?: string;
      jamiaId?: string;
    };

    const update: any = {};
    if (status) update.status = status;
    if (password) update.passwordHash = hashPassword(password);
    if (jamiaId) {
      const jamia = (await Jamia.findById(jamiaId).lean()) as IJamia | null;
      if (!jamia || jamia.isDeleted) {
        return res.status(404).json({ message: "جامعہ نہیں ملا" });
      }
      update.jamiaId = jamia._id;
    }

    const updated = await User.findOneAndUpdate(
      { _id: id, role: "admin" },
      { $set: update },
      { new: true },
    )
      .select("-passwordHash")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "ایڈمن نہیں ملا" });
    }

    return res
      .status(200)
      .json({ message: "ایڈمن اپ ڈیٹ ہو گیا", admin: updated });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
