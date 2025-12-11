import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { BedAllocation } from "@/schemas/BedAllocation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const { hostelId, roomId, studentId, active } = req.query as any;
    const filter: any = {};
    if (hostelId) filter.hostelId = hostelId;
    if (roomId) filter.roomId = roomId;
    if (studentId) filter.studentId = studentId;
    if (active) filter.isActive = active === "true";
    const list = await BedAllocation.find(filter)
      .populate({ path: "studentId", select: "fullName rollNumber" })
      .populate({ path: "hostelId", select: "name" })
      .populate({ path: "roomId", select: "roomNo" })
      .sort({ createdAt: -1 })
      .limit(500);
    return res.status(200).json({ allocations: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    const created = await BedAllocation.create({
      hostelId: body.hostelId,
      roomId: body.roomId,
      studentId: body.studentId,
      bedNo: body.bedNo,
      fromDate: new Date(body.fromDate),
      toDate: body.toDate ? new Date(body.toDate) : undefined,
      isActive: body.isActive !== false,
    });
    return res
      .status(201)
      .json({ message: "الوکیشن محفوظ ہو گئی", allocation: created });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
