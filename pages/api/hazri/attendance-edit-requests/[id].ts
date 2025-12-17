import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { AttendanceEditRequest } from "@/schemas/AttendanceEditRequest";
import { Attendance } from "@/schemas/Attendance";
import { ActivityLog } from "@/schemas/ActivityLog";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin", "staff"]);
  if (!me) return;

  const ok = await requirePermission(req, res, me, "manage_attendance");
  if (!ok) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const doc = await AttendanceEditRequest.findById(id)
      .populate({ path: "requestedBy", select: "fullName username role" })
      .populate({ path: "reviewedBy", select: "fullName username" })
      .lean();
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    return res.status(200).json({ request: doc });
  }

  if (req.method === "PUT") {
    const { action, reviewNote } = req.body as any;
    if (!action || !["approve", "reject"].includes(String(action))) {
      return res.status(400).json({ message: "action درکار ہے" });
    }

    const doc = await AttendanceEditRequest.findById(id);
    if (!doc) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
    if (doc.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "یہ ریکویسٹ پہلے ہی پروسیس ہو چکی ہے" });
    }

    if (action === "reject") {
      doc.status = "Rejected";
      doc.reviewedBy = me.id as any;
      doc.reviewedAt = new Date();
      doc.reviewNote = reviewNote || undefined;
      await doc.save();

      await ActivityLog.create({
        actorUserId: me.id,
        action: "attendance_edit_request_rejected",
        entityType: "AttendanceEditRequest",
        entityId: doc._id,
        meta: { reviewNote: reviewNote || undefined },
      });

      return res.status(200).json({ message: "ریجیکٹ ہو گیا", request: doc });
    }

    // Approve: apply changes to Attendance
    const day = new Date(doc.date);
    day.setHours(0, 0, 0, 0);

    const beforeRows: any[] = [];
    const afterRows: any[] = [];

    for (const ch of doc.changes as any[]) {
      const existing = (await Attendance.findOne({
        student: ch.studentId,
        classId: doc.classId,
        sectionId: doc.sectionId,
        date: day,
        ...(doc.lecture ? { lecture: doc.lecture } : {}),
      }).lean()) as { status?: string; remark?: string } | null;

      beforeRows.push({
        studentId: String(ch.studentId),
        status: existing?.status || null,
        remark: existing?.remark || null,
      });

      const updated = (await Attendance.findOneAndUpdate(
        {
          student: ch.studentId,
          classId: doc.classId,
          sectionId: doc.sectionId,
          date: day,
          ...(doc.lecture ? { lecture: doc.lecture } : {}),
        },
        {
          $set: {
            student: ch.studentId,
            classId: doc.classId,
            sectionId: doc.sectionId,
            date: day,
            lecture: doc.lecture || undefined,
            status: ch.toStatus,
            remark: ch.toRemark || undefined,
            markedBy: doc.requestedBy,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean()) as { status?: string; remark?: string } | null;

      afterRows.push({
        studentId: String(ch.studentId),
        status: updated?.status || null,
        remark: updated?.remark || null,
      });
    }

    doc.status = "Approved";
    doc.reviewedBy = me.id as any;
    doc.reviewedAt = new Date();
    doc.reviewNote = reviewNote || undefined;
    await doc.save();

    await ActivityLog.create({
      actorUserId: me.id,
      action: "attendance_edit_request_approved",
      entityType: "AttendanceEditRequest",
      entityId: doc._id,
      before: beforeRows,
      after: afterRows,
      meta: { reviewNote: reviewNote || undefined },
    });

    return res.status(200).json({ message: "اپروو ہو گیا", request: doc });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
