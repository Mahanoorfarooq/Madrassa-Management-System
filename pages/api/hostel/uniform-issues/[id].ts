import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { UniformItem } from "@/schemas/UniformItem";
import { UniformIssue } from "@/schemas/UniformIssue";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin", "staff"]);
  if (!me) return;

  await connectDB();

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const body = req.body as any;
    if (body.action === "return") {
      const issue = await UniformIssue.findById(id);
      if (!issue) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });
      if (issue.status === "Returned") {
        return res.status(400).json({ message: "پہلے ہی واپس ہو چکا ہے" });
      }

      const item = await UniformItem.findById(issue.itemId);
      if (item) {
        item.availableQty = item.availableQty + (issue.quantity || 0);
        await item.save();
      }

      issue.status = "Returned";
      issue.returnDate = new Date();
      await issue.save();

      return res.status(200).json({ message: "واپس ہو گیا", issue });
    }

    return res.status(400).json({ message: "غلط action" });
  }

  if (req.method === "DELETE") {
    const issue = await UniformIssue.findById(id);
    if (!issue) return res.status(404).json({ message: "ریکارڈ نہیں ملا" });

    if (issue.status === "Issued") {
      const item = await UniformItem.findById(issue.itemId);
      if (item) {
        item.availableQty = item.availableQty + (issue.quantity || 0);
        await item.save();
      }
    }

    await UniformIssue.findByIdAndDelete(id);
    return res.status(200).json({ message: "ریکارڈ حذف ہو گیا" });
  }

  return res.status(405).json({ message: "غیر مجاز میتھڈ" });
}
