import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Fee } from "@/schemas/Fee";
import { Student } from "@/schemas/Student";
import { requireAuth } from "@/lib/auth";
import { ensureModuleEnabled, getJamiaForUser } from "@/lib/jamia";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff", "student"]);
  if (!user) return;

  // Enforce per-jamia module toggle (fees module)
  const moduleOk = await ensureModuleEnabled(req, res, user, "fees");
  if (!moduleOk) return;

  await connectDB();

  if (req.method === "GET") {
    const { studentId } = req.query as { studentId?: string };
    const filter: any = {};

    if (user.role === "student") {
      const me: any = await Student.findOne({ userId: user.id })
        .select("_id")
        .lean();
      if (!me?._id) {
        return res
          .status(404)
          .json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
      }
      filter.student = me._id;
    } else if (studentId) {
      // For admin/staff, respect jamia boundaries if configured
      const jamia = await getJamiaForUser(user);
      const stu: any = await Student.findById(studentId)
        .select("_id jamiaId")
        .lean();
      if (!stu?._id) {
        return res
          .status(404)
          .json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
      }
      if (jamia && stu.jamiaId && String(stu.jamiaId) !== String(jamia._id)) {
        return res
          .status(403)
          .json({ message: "یہ طالب علم اس جامعہ سے تعلق نہیں رکھتا۔" });
      }
      filter.student = stu._id;
    } else if (user.role === "admin" || user.role === "staff") {
      // When no specific student is requested, and jamia is configured,
      // limit results to students of this jamia. If no jamia is linked yet,
      // fall back to legacy behavior (all fees).
      const jamia = await getJamiaForUser(user);
      if (jamia) {
        const students = await Student.find({ jamiaId: jamia._id })
          .select("_id")
          .lean();
        const ids = students.map((s: any) => s._id);
        if (ids.length > 0) {
          filter.student = { $in: ids };
        } else {
          // No students for this jamia => no fees
          return res.status(200).json({ fees: [] });
        }
      }
    }

    const fees = await Fee.find(filter).limit(100);
    return res.status(200).json({ fees });
  }

  if (req.method === "POST") {
    const { student, amount, paidAmount, dueAmount, dueDate, status } =
      req.body;
    if (!student || !amount) {
      return res
        .status(400)
        .json({ message: "طالب علم اور کل فیس درکار ہیں۔" });
    }
    try {
      // Ensure that the target student belongs to the same jamia (if any)
      const jamia = await getJamiaForUser(user);
      if (jamia) {
        const stu: any = await Student.findById(student)
          .select("_id jamiaId")
          .lean();
        if (!stu?._id) {
          return res
            .status(404)
            .json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
        }
        if (stu.jamiaId && String(stu.jamiaId) !== String(jamia._id)) {
          return res
            .status(403)
            .json({ message: "یہ طالب علم اس جامعہ سے تعلق نہیں رکھتا۔" });
        }
      }

      const fee = await Fee.create({
        student,
        amount,
        paidAmount,
        dueAmount,
        dueDate,
        status,
      });
      return res.status(201).json({ message: "فیس ریکارڈ محفوظ ہو گیا۔", fee });
    } catch {
      return res
        .status(500)
        .json({ message: "فیس ریکارڈ محفوظ کرنے میں مسئلہ ہوا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
