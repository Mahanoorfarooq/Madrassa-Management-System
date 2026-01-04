import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { StudyMaterial } from "@/schemas/StudyMaterial";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["student"]);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  await connectDB();

  try {
    const me: any = await Student.findOne({ userId: user.id })
      .select("_id departmentId classId sectionId className section")
      .lean();

    if (!me?._id) {
      return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
    }

    const filter: any = {};
    if (me.departmentId) filter.departmentId = me.departmentId;
    if (me.sectionId) filter.sectionId = me.sectionId;
    else if (me.classId) filter.classId = me.classId;

    const materials = await StudyMaterial.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const items = materials.map((m: any) => ({
      id: String(m._id),
      subject: m.subject || "",
      title: m.title,
      description: m.description || "",
      url: m.url,
      createdAt: m.createdAt,
    }));

    return res.status(200).json({ materials: items });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "مواد لوڈ کرنے میں مسئلہ" });
  }
}
