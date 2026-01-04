import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";
import { requireAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "DELETE") {
    await TeachingAssignment.findByIdAndDelete(id);
    return res.status(200).json({ message: "تفویض حذف ہو گیا" });
  }

  if (req.method === "GET") {
    const item = await TeachingAssignment.findById(id)
      .populate({
        path: "teacherId",
        select: "fullName designation contactNumber",
      })
      .populate({ path: "classId", select: "className" })
      .populate({ path: "sectionId", select: "sectionName" });
    if (!item) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ assignment: item });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
