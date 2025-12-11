import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { MessRegistration } from "@/schemas/MessRegistration";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "staff"]);
  if (!user) return;
  await connectDB();

  if (req.method === "GET") {
    const { studentId, kitchenId, active } = req.query as any;
    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (kitchenId) filter.kitchenId = kitchenId;
    if (active) filter.isActive = active === "true";
    const list = await MessRegistration.find(filter)
      .populate({ path: "studentId", select: "fullName rollNumber" })
      .populate({ path: "kitchenId", select: "name" })
      .sort({ createdAt: -1 })
      .limit(500);
    return res.status(200).json({ registrations: list });
  }

  if (req.method === "POST") {
    const body = req.body as any;
    if (!body.studentId || !body.kitchenId || !body.fromDate) {
      return res.status(400).json({
        message: "طالب علم، کچن اور از تاریخ لازمی ہیں۔",
      });
    }

    // Ensure a student cannot have more than one active mess registration
    const existing = await MessRegistration.findOne({
      studentId: body.studentId,
      isActive: true,
    });
    if (existing) {
      return res.status(400).json({
        message: "اس طالب علم کی میس رجسٹریشن پہلے ہی فعال ہے۔",
      });
    }

    try {
      const created = await MessRegistration.create({
        studentId: body.studentId,
        kitchenId: body.kitchenId,
        fromDate: new Date(body.fromDate),
        toDate: body.toDate ? new Date(body.toDate) : undefined,
        isActive: body.isActive !== false,
      });
      return res
        .status(201)
        .json({ message: "رجسٹریشن محفوظ ہو گئی", registration: created });
    } catch (e: any) {
      // Handle unique index race conditions gracefully
      if (e?.code === 11000) {
        return res.status(400).json({
          message: "اس طالب علم کی میس رجسٹریشن پہلے ہی فعال ہے۔",
        });
      }
      return res
        .status(500)
        .json({
          message: e?.message || "رجسٹریشن محفوظ کرنے میں مسئلہ پیش آیا۔",
        });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
