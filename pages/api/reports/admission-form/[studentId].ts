import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import axios from "axios";
import { connectDB } from "@/lib/db";
import { requireAuth, requirePermission } from "@/lib/auth";
import { getJamiaForUser } from "@/lib/jamia";
import { Student } from "@/schemas/Student";
import { Jamia } from "@/schemas/Jamia";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const me = requireAuth(req, res, ["admin", "teacher", "staff", "student"]);
  if (!me) return;

  if (me.role !== "student") {
    const ok = await requirePermission(req, res, me, "manage_students");
    if (!ok) return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ message: "غیر مجاز میتھڈ" });
    return;
  }

  await connectDB();

  const { studentId } = req.query as { studentId?: string };
  if (!studentId) {
    res.status(400).json({ message: "طالب علم شناخت درکار ہے" });
    return;
  }

  const jamia = await getJamiaForUser(me);

  const student: any = await Student.findById(studentId)
    .populate({ path: "departmentId", select: "name code" })
    .populate({ path: "classId", select: "className" })
    .populate({ path: "sectionId", select: "sectionName" })
    .lean();

  if (!student) {
    res.status(404).json({ message: "طالب علم نہیں ملا" });
    return;
  }

  if (
    jamia &&
    student.jamiaId &&
    String(student.jamiaId) !== String(jamia._id)
  ) {
    res.status(403).json({ message: "اس طالب علم کی اجازت نہیں" });
    return;
  }

  // If the requester is a student, enforce self-access only
  if (me.role === "student") {
    if (!student.userId || String(student.userId) !== String(me.id)) {
      res.status(403).json({ message: "آپ کو صرف اپنے فارم تک رسائی حاصل ہے" });
      return;
    }
  }

  const jamiaDoc: any = jamia ? await Jamia.findById(jamia._id).lean() : null;

  let logoImage: string | Buffer | null = null;
  if (jamiaDoc?.logo) {
    try {
      const logoVal = String(jamiaDoc.logo);
      if (logoVal.startsWith("http")) {
        const resp = await axios.get(logoVal, { responseType: "arraybuffer" });
        logoImage = Buffer.from(resp.data);
      } else {
        const logoPath = path.join(
          process.cwd(),
          "public",
          logoVal.replace(/^\/+/, "")
        );
        if (fs.existsSync(logoPath)) {
          logoImage = logoPath;
        }
      }
    } catch {
      logoImage = null;
    }
  }

  let studentPhoto: string | Buffer | null = null;
  if (student.photoUrl) {
    try {
      const photoVal = String(student.photoUrl);
      if (photoVal.startsWith("http")) {
        const resp = await axios.get(photoVal, {
          responseType: "arraybuffer",
        });
        studentPhoto = Buffer.from(resp.data);
      } else {
        const photoPath = path.join(
          process.cwd(),
          "public",
          photoVal.replace(/^\/+/, "")
        );
        if (fs.existsSync(photoPath)) {
          studentPhoto = photoPath;
        }
      }
    } catch {
      studentPhoto = null;
    }
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: false, // Disable buffering to prevent extra pages
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=admission-form-${
      student.rollNumber || student._id
    }.pdf`
  );

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "alqalam-taj-nastaleeq",
    "AlQalam Taj Nastaleeq Regular.ttf"
  );

  const hasFont = fs.existsSync(fontPath);
  if (hasFont) {
    doc.registerFont("Urdu", fontPath);
  }

  doc.pipe(res);

  const titleFont = hasFont ? "Urdu" : "Helvetica-Bold";
  const normalFont = hasFont ? "Urdu" : "Helvetica";

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let y = 50;

  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2).stroke();

  const photoWidth = 85;
  const photoHeight = 100;
  const photoX = margin + 10;
  const photoY = 50;

  doc.rect(photoX, photoY, photoWidth, photoHeight).stroke();

  if (studentPhoto) {
    try {
      doc.image(studentPhoto as any, photoX + 2, photoY + 2, {
        fit: [photoWidth - 4, photoHeight - 4],
      });
    } catch {
      doc
        .fontSize(8)
        .font(normalFont)
        .text("تصویر", photoX, photoY + photoHeight / 2 - 4, {
          width: photoWidth,
          align: "center",
        });
    }
  } else {
    doc
      .fontSize(8)
      .font(normalFont)
      .text("تصویر", photoX, photoY + photoHeight / 2 - 4, {
        width: photoWidth,
        align: "center",
      });
  }

  // Institution name and address (right of photo in RTL)
  const headerWidth = contentWidth - photoWidth - 20;
  const headerX = margin + photoWidth + 20;

  doc
    .fontSize(16)
    .font(titleFont)
    .text(jamiaDoc?.name || "Central Jamia", headerX, y, {
      width: headerWidth,
      align: "center",
    });

  if (jamiaDoc?.address) {
    doc
      .fontSize(9)
      .font(normalFont)
      .text(jamiaDoc.address, headerX, y + 22, {
        width: headerWidth,
        align: "center",
      });
  }

  // Horizontal line after header
  y = photoY + photoHeight + 5;
  doc
    .moveTo(margin, y)
    .lineTo(pageWidth - margin, y)
    .stroke();

  y += 3;
  doc
    .moveTo(margin, y)
    .lineTo(pageWidth - margin, y)
    .stroke();

  // ==================== FORM TITLE ====================
  y += 8;
  const titleBoxWidth = 180;
  const titleBoxHeight = 25;
  const titleBoxX = margin + (contentWidth - titleBoxWidth) / 2;

  doc
    .rect(titleBoxX, y, titleBoxWidth, titleBoxHeight)
    .fillAndStroke("black", "black");
  doc
    .fillColor("white")
    .fontSize(14)
    .font(titleFont)
    .text("داخلہ فارم", titleBoxX, y + 5, {
      width: titleBoxWidth,
      align: "center",
    });
  doc.fillColor("black");

  y += titleBoxHeight + 12;

  // ==================== SECTION 1: STUDENT INFO ====================
  const sectionHeaderHeight = 22;
  const rowHeight = 22;
  const labelWidth = contentWidth * 0.3;
  const valueWidth = contentWidth - labelWidth;

  // Section header
  doc.rect(margin, y, contentWidth, sectionHeaderHeight).fill("#e8e8e8");
  doc
    .fillColor("black")
    .fontSize(11)
    .font(titleFont)
    .text("طالب علم کی معلومات", margin + 10, y + 5, {
      width: contentWidth - 20,
      align: "right",
    });

  y += sectionHeaderHeight;

  // Helper function to draw field row without text wrapping issues
  const drawRow = (label: string, value: string) => {
    // In RTL, label box on the right, value box on the left
    const labelX = margin + contentWidth - labelWidth;
    const valueX = margin;

    // Draw borders
    doc.rect(labelX, y, labelWidth, rowHeight).stroke();
    doc.rect(valueX, y, valueWidth, rowHeight).stroke();

    // Draw label (right aligned inside right box)
    doc
      .fontSize(9)
      .font(normalFont)
      .fillColor("black")
      .text(label, labelX + 5, y + 6, {
        width: labelWidth - 10,
        align: "right",
        lineBreak: false,
      });

    // Draw value (right aligned inside left box so it lines up near the middle)
    const displayValue = value || "________________";
    doc
      .fontSize(9)
      .font(normalFont)
      .text(displayValue, valueX + 5, y + 6, {
        width: valueWidth - 10,
        align: "right",
        lineBreak: false,
      });

    y += rowHeight;
  };

  // Student information rows
  drawRow("نام", student.fullName || "");
  drawRow("والد کا نام", student.fatherName || student.guardianName || "");
  drawRow(
    "تاریخ پیدائش",
    student.dateOfBirth
      ? new Date(student.dateOfBirth).toLocaleDateString("ur-PK")
      : ""
  );
  drawRow("شناختی کارڈ نمبر", student.cnic || "");
  drawRow("نمبر", student.contactNumber || student.guardianPhone || "");
  drawRow("پتہ", student.address || "");

  y += 8;

  // ==================== SECTION 2: ACADEMIC INFO ====================
  doc.rect(margin, y, contentWidth, sectionHeaderHeight).fill("#e8e8e8");
  doc
    .fillColor("black")
    .fontSize(11)
    .font(titleFont)
    .text("تعلیمی معلومات", margin + 10, y + 5, {
      width: contentWidth - 20,
      align: "right",
    });

  y += sectionHeaderHeight;

  drawRow("کلاس / شعبہ", student.classId?.className || student.className || "");
  drawRow("داخلہ نمبر", student.admissionNumber || student.rollNumber || "");
  drawRow("رول نمبر", student.rollNumber || "");
  drawRow(
    "تاریخ داخلہ",
    student.admissionDate
      ? new Date(student.admissionDate).toLocaleDateString("ur-PK")
      : ""
  );
  drawRow("سابقہ مدرسہ", student.previousSchool || "");

  y += 8;

  // ==================== SECTION 3: HOSTEL & FEE ====================
  doc.rect(margin, y, contentWidth, sectionHeaderHeight).fill("#e8e8e8");
  doc
    .fillColor("black")
    .fontSize(11)
    .font(titleFont)
    .text("رہائش اور فیس کی معلومات", margin + 10, y + 5, {
      width: contentWidth - 20,
      align: "right",
    });

  y += sectionHeaderHeight;

  drawRow("ہاسٹل", student.isHostel ? "ہاں" : "نہیں");

  let feeInfo = "عام";
  if (student.scholarshipType && student.scholarshipType !== "none") {
    if (student.scholarshipType === "percent") {
      feeInfo = `اسکالرشپ ${student.scholarshipValue || 0}٪`;
    } else if (student.scholarshipType === "fixed") {
      feeInfo = `اسکالرشپ فکس ${student.scholarshipValue || 0}`;
    }
  }
  drawRow("فیس", feeInfo);

  y += 10;

  // ==================== DECLARATION ====================
  doc.rect(margin, y, contentWidth, sectionHeaderHeight).fill("#e8e8e8");
  doc
    .fillColor("black")
    .fontSize(11)
    .font(titleFont)
    .text("اعلانیہ", margin + 10, y + 5, {
      width: contentWidth - 20,
      align: "right",
    });

  y += sectionHeaderHeight + 8;

  const declarationText =
    "میں تصدیق کرتا/کرتی ہوں کہ فراہم کردہ تمام معلومات درست ہیں اور جامعہ کے اصول و ضوابط کو تسلیم کرتا/کرتی ہوں۔";

  doc
    .fontSize(9)
    .font(normalFont)
    .text(declarationText, margin + 10, y, {
      width: contentWidth - 20,
      align: "right",
      lineBreak: true,
    });

  y += 35;

  // ==================== SIGNATURE BOXES ====================
  const sigBoxWidth = (contentWidth - 40) / 3;
  const sigBoxHeight = 55;
  const sigGap = 10;

  // Draw three signature boxes in RTL (right to left)
  const sigRightX = margin + contentWidth - sigGap - sigBoxWidth;
  const sigMiddleX = sigRightX - sigGap - sigBoxWidth;
  const sigLeftX = sigMiddleX - sigGap - sigBoxWidth;

  doc.rect(sigRightX, y, sigBoxWidth, sigBoxHeight).stroke();
  doc.rect(sigMiddleX, y, sigBoxWidth, sigBoxHeight).stroke();
  doc.rect(sigLeftX, y, sigBoxWidth, sigBoxHeight).stroke();

  // Labels (RTL ordering)
  doc
    .fontSize(9)
    .font(normalFont)
    .text("سرپرست کے دستخط", sigRightX, y + sigBoxHeight - 18, {
      width: sigBoxWidth,
      align: "center",
      lineBreak: false,
    });

  doc
    .fontSize(9)
    .font(normalFont)
    .text("دفتر کے دستخط", sigMiddleX, y + sigBoxHeight - 18, {
      width: sigBoxWidth,
      align: "center",
      lineBreak: false,
    });

  doc
    .fontSize(9)
    .font(normalFont)
    .text("تاریخ", sigLeftX, y + sigBoxHeight - 18, {
      width: sigBoxWidth,
      align: "center",
      lineBreak: false,
    });

  // ==================== FOOTER ====================
  const footerY = pageHeight - margin - 20;

  doc
    .moveTo(margin, footerY - 10)
    .lineTo(pageWidth - margin, footerY - 10)
    .stroke();

  doc
    .fontSize(7)
    .font(normalFont)
    .text(
      `تاریخِ پرنٹ: ${new Date().toLocaleDateString("ur-PK")}`,
      margin + 10,
      footerY,
      { width: contentWidth / 2, align: "right", lineBreak: false }
    );

  doc
    .fontSize(7)
    .font("Helvetica")
    .text("Jamia Management System", margin + 10, footerY, {
      width: contentWidth / 2,
      align: "left",
      lineBreak: false,
    });

  doc.end();
}
