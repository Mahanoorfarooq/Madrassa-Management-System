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

  if (req.method === "GET") {
    const { q, departmentId } = req.query as {
      q?: string;
      departmentId?: string;
    };
    const filter: any = {};
    if (q) {
      const r = new RegExp(q, "i");
      filter.$or = [{ fullName: r }, { specialization: r }, { designation: r }];
    }
    if (departmentId) {
      filter.departmentIds = departmentId;
    }

    const teachers = await Teacher.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Optionally attach assignment counts
    const ids = teachers.map((t) => t._id);
    const assigns = await TeachingAssignment.aggregate([
      { $match: { teacherId: { $in: ids } } },
      { $group: { _id: "$teacherId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(assigns.map((a: any) => [String(a._id), a.count]));
    const data = teachers.map((t: any) => ({
      ...t,
      assignmentCount: countMap.get(String(t._id)) || 0,
    }));

    return res.status(200).json({ teachers: data });
  }

  if (req.method === "POST") {
    // Create Teacher and (optionally) create assignments in bulk
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

    if (!fullName) return res.status(400).json({ message: "نام درکار ہے" });

    try {
      const teacher = await Teacher.create({
        fullName,
        specialization: specialization || undefined,
        phone: phone || undefined,
        contactNumber: contactNumber || undefined,
        designation: designation || undefined,
        departmentIds: Array.isArray(departmentIds) ? departmentIds : undefined,
        subjects: Array.isArray(subjects) ? subjects : undefined,
        cnic: cnic || undefined,
        email: email || undefined,
        address: address || undefined,
        status: status || undefined,
        photoUrl: photoUrl || undefined,
      });

      // assignments: Array<{ departmentId, classId, sectionIds[], subject? }>
      if (Array.isArray(assignments) && assignments.length) {
        const docs: any[] = [];
        for (const a of assignments) {
          const sectionIds =
            Array.isArray(a.sectionIds) && a.sectionIds.length
              ? a.sectionIds
              : [undefined];
          for (const sid of sectionIds) {
            docs.push({
              teacherId: teacher._id,
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

      return res.status(201).json({ message: "استاد بنا دیا گیا", teacher });
    } catch (e: any) {
      return res
        .status(500)
        .json({ message: e?.message || "استاد بنانے میں مسئلہ" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
