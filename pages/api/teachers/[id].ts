import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Teacher } from "@/schemas/Teacher";
import { User } from "@/schemas/User";
import { requireAuth, hashPassword } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = requireAuth(req, res, ["admin", "teacher"]);
  if (!user) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const teacher = await Teacher.findById(id);
    if (!teacher) return res.status(404).json({ message: "استاد نہیں ملا" });
    return res.status(200).json({ teacher });
  }

  if (req.method === "PUT") {
    try {
      const body = req.body as any;
      const updated = await Teacher.findByIdAndUpdate(
        id,
        {
          fullName: body.fullName,
          designation: body.designation,
          contactNumber: body.contactNumber,
          departmentIds: Array.isArray(body.departmentIds)
            ? body.departmentIds
            : body.departmentId
            ? [body.departmentId]
            : [],
          assignedClasses: Array.isArray(body.assignedClasses)
            ? body.assignedClasses
            : [],
        },
        { new: true }
      );

      // Optionally sync login details to a linked User (role=teacher)
      const { username, password } = body as {
        username?: string;
        password?: string;
      };

      // Find any existing teacher user linked to this teacher record
      let teacherUser = await User.findOne({
        role: "teacher",
        $or: [{ linkedTeacherId: id }, { linkedId: id }],
      });

      // If a username is provided, update or create the User record
      if (username) {
        const existingWithUsername = await User.findOne({
          username,
          _id: { $ne: teacherUser?._id },
        });
        if (existingWithUsername) {
          return res
            .status(400)
            .json({ message: "یہ یوزر نام پہلے سے موجود ہے۔" });
        }

        if (!teacherUser) {
          if (!password) {
            return res.status(400).json({
              message:
                "نئے یوزر کے لیے پاس ورڈ بھی ضروری ہے، یا یوزر نام خالی چھوڑیں۔",
            });
          }
          const passwordHash = hashPassword(password);
          teacherUser = await User.create({
            fullName: body.fullName || updated?.fullName,
            username,
            passwordHash,
            role: "teacher",
            linkedTeacherId: id,
            linkedId: id,
          });
        } else {
          teacherUser.username = username;
        }
      }

      // If password alone is provided (or together with username), update hash
      if (password && teacherUser) {
        teacherUser.passwordHash = hashPassword(password);
      }

      if (teacherUser) {
        // Keep name and linking in sync
        if (body.fullName) {
          teacherUser.fullName = body.fullName;
        }
        if (!teacherUser.linkedTeacherId)
          teacherUser.linkedTeacherId = id as any;
        if (!teacherUser.linkedId) teacherUser.linkedId = id as any;
        await teacherUser.save();
      }

      return res
        .status(200)
        .json({ message: "ریکارڈ اپ ڈیٹ ہو گیا", teacher: updated });
    } catch (e) {
      return res.status(500).json({ message: "اپ ڈیٹ کرنے میں مسئلہ پیش آیا" });
    }
  }

  if (req.method === "DELETE") {
    await Teacher.findByIdAndDelete(id);
    return res.status(200).json({ message: "استاد حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ۔" });
}
