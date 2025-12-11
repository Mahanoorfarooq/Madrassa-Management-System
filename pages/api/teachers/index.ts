import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Teacher } from "@/schemas/Teacher";
import { User } from "@/schemas/User";
import { requireAuth, hashPassword } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher", "staff"]);
  if (!user) return;

  await connectDB();

  if (req.method === "GET") {
    const { departmentId, q } = req.query as {
      departmentId?: string;
      q?: string;
    };
    const filter: any = {};
    if (departmentId) filter.departmentIds = departmentId;
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ fullName: regex }, { designation: regex }];
    }
    const teachers = await Teacher.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);
    return res.status(200).json({ teachers });
  }

  if (req.method === "POST") {
    const {
      fullName,
      designation,
      contactNumber,
      departmentId,
      departmentIds,
      assignedClasses,
      username,
      password,
    } = req.body as any;
    if (!fullName) {
      return res.status(400).json({ message: "استاد کا نام درکار ہے۔" });
    }
    try {
      // If admin provided only one of username/password, treat as invalid
      if ((username && !password) || (!username && password)) {
        return res.status(400).json({
          message: "یوزر نام اور پاس ورڈ دونوں دیں یا دونوں خالی چھوڑیں۔",
        });
      }

      // Check username uniqueness before creating teacher record
      if (username && password) {
        const existing = await User.findOne({ username });
        if (existing) {
          return res
            .status(400)
            .json({ message: "یہ یوزر نام پہلے سے موجود ہے۔" });
        }
      }

      const teacher = await Teacher.create({
        fullName,
        designation,
        contactNumber,
        departmentIds: Array.isArray(departmentIds)
          ? departmentIds
          : departmentId
          ? [departmentId]
          : [],
        assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : [],
      });

      // Optionally create linked User account for this teacher
      if (username && password) {
        const passwordHash = hashPassword(password);
        await User.create({
          fullName,
          username,
          passwordHash,
          role: "teacher",
          linkedTeacherId: teacher._id,
          linkedId: teacher._id,
        });
      }

      return res.status(201).json({ message: "استاد محفوظ ہو گیا۔", teacher });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "استاد محفوظ کرنے میں مسئلہ پیش آیا۔" });
    }
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
