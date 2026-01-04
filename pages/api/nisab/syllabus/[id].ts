import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Syllabus } from "@/schemas/Syllabus";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff", "teacher"]);
  if (!user) return;
  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await Syllabus.findById(id)
      .populate({ path: "departmentId", select: "name code" })
      .populate({ path: "teacherId", select: "name" })
      .populate({ path: "classId", select: "name" });
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ syllabus: doc });
  }

  if (req.method === "PUT") {
    const body = req.body as any;
    const updated = await Syllabus.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description || undefined,
        teacherId: body.teacherId || undefined,
        classId: body.classId || undefined,
        progress: body.progress ? Number(body.progress) : 0,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "اپ ڈیٹ ہو گیا", syllabus: updated });
  }

  if (req.method === "DELETE") {
    await Syllabus.findByIdAndDelete(id);
    return res.status(200).json({ message: "حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
