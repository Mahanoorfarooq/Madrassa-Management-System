import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Teacher } from "@/schemas/Teacher";
import { TeachingAssignment } from "@/schemas/TeachingAssignment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin"]);
  if (!me) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const teacher = await Teacher.findById(id);
    if (!teacher) return res.status(404).json({ message: "استاد نہیں ملا" });

    const assignments = await TeachingAssignment.find({ teacherId: id })
      .populate({ path: "departmentId", select: "name code" })
      .populate({ path: "classId", select: "className" })
      .populate({ path: "sectionId", select: "sectionName" })
      .lean();

    return res.status(200).json({ teacher, assignments });
  }

  if (req.method === "PUT") {
    const {
      fullName,
      specialization,
      phone,
      contactNumber,
      designation,
      departmentIds,
      subjects,
      assignments,
      cnic,
      email,
      address,
      status,
      photoUrl,
    } = req.body as any;
    try {
      const updated = await Teacher.findByIdAndUpdate(
        id,
        {
          ...(fullName !== undefined ? { fullName } : {}),
          ...(specialization !== undefined ? { specialization } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(contactNumber !== undefined ? { contactNumber } : {}),
          ...(designation !== undefined ? { designation } : {}),
          ...(Array.isArray(departmentIds) ? { departmentIds } : {}),
          ...(Array.isArray(subjects) ? { subjects } : {}),
          ...(cnic !== undefined ? { cnic } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(address !== undefined ? { address } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(photoUrl !== undefined ? { photoUrl } : {}),
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "استاد نہیں ملا" });

      // Optional: replace assignments if provided
      if (Array.isArray(assignments)) {
        await TeachingAssignment.deleteMany({ teacherId: id });
        const docs: any[] = [];
        for (const a of assignments) {
          const sectionIds =
            Array.isArray(a.sectionIds) && a.sectionIds.length
              ? a.sectionIds
              : [undefined];
          for (const sid of sectionIds) {
            docs.push({
              teacherId: id,
              departmentId: a.departmentId,
              classId: a.classId || undefined,
              sectionId: sid || undefined,
              subject: a.subject || undefined,
            });
          }
        }
        if (docs.length)
          await TeachingAssignment.insertMany(docs, { ordered: false });
      }

      return res
        .status(200)
        .json({ message: "اپ ڈیٹ ہو گیا", teacher: updated });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "اپ ڈیٹ میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
