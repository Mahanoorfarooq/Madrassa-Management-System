import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Student } from "@/schemas/Student";
import { ClassModel } from "@/schemas/Class";
import { Exam } from "@/schemas/Exam";
import { Result } from "@/schemas/Result";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["student"]);
  if (!user) return;

  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "غیر مجاز میتھڈ" });
  }

  try {
    const me: any = await Student.findOne({ userId: user.id })
      .select("_id fullName rollNumber classId className")
      .lean();

    if (!me?._id) {
      return res.status(404).json({ message: "طالب علم کا ریکارڈ نہیں ملا۔" });
    }

    let className: string | undefined = me.className;
    if (!className && me.classId) {
      const cls: any = await ClassModel.findById(me.classId)
        .select("className")
        .lean();
      className = cls?.className;
    }

    let exams: any[] = [];
    if (className) {
      exams = await Exam.find({ className })
        .sort({ examDate: 1 })
        .limit(200)
        .lean();
    }

    const results = await Result.find({ student: me._id })
      .populate({ path: "exam", select: "title term className examDate" })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Compute latest exam ranking/position among class candidates if possible
    let latestRank: { position: number; total: number } | null = null;
    if (results && results.length > 0 && results[0]?.exam?._id) {
      const latestExamId = results[0].exam._id;
      try {
        const cohort = await Result.find({ exam: latestExamId })
          .select("student totalObtained")
          .lean();
        const sorted = cohort
          .map((r: any) => ({
            sid: String(r.student),
            tot: Number(r.totalObtained || 0),
          }))
          .sort((a, b) => b.tot - a.tot);
        const pos = sorted.findIndex((r) => r.sid === String(me._id));
        if (pos >= 0) {
          latestRank = { position: pos + 1, total: sorted.length };
        }
      } catch {}
    }

    return res.status(200).json({ exams, results, latestRank });
  } catch (e: any) {
    return res.status(500).json({
      message: e?.message || "امتحانات کے ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا۔",
    });
  }
}
