import PDFDocument from "pdfkit";
import {
  BRAND,
  COLORS,
  drawBadge,
  drawFrame,
  drawLogo,
  drawSignature,
  drawWatermark,
  fetchImageBuffer,
  qrBuffer,
  uploadPdf,
} from "./shared.js";

export interface RegistrationCardInput {
  serialNo: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  gender: string;
  instituteName: string;
  postOffice: string;
  upazilla: string;
  district: string;
  courseTitle: string;
  courseCode: string;
  registrationNo: string;
  rollNo: string;
  session: string;
  photoUrl?: string;
}

export async function render(input: RegistrationCardInput): Promise<Buffer> {
  const photo = await fetchImageBuffer(input.photoUrl);
  const qr = await qrBuffer(input.serialNo);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 0 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      drawFrame(doc);
      drawWatermark(doc, BRAND.shortName);

      // Header
      drawLogo(doc, 48, 46, 58);
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(17)
        .text(BRAND.name, 120, 52, { width: W - 175 });
      doc.fillColor(COLORS.gold).font("Helvetica-Bold").fontSize(9)
        .text(BRAND.regLine, 120, 86, { width: W - 175, characterSpacing: 1 });

      // Badge
      drawBadge(doc, W / 2 - 80, 118, "Registration Card");

      // Photo (top right)
      const photoX = W - 150;
      const photoY = 150;
      const photoW = 100;
      const photoH = 118;
      doc.lineWidth(1).strokeColor(COLORS.line).rect(photoX, photoY, photoW, photoH).stroke();
      if (photo) {
        try {
          doc.image(photo, photoX + 1, photoY + 1, { fit: [photoW - 2, photoH - 2], align: "center", valign: "center" });
        } catch {
          /* ignore */
        }
      }

      // Serial + QR
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(13)
        .text(`Serial No: ${input.serialNo}`, 55, 165);
      doc.image(qr, photoX, photoY + photoH + 14, { width: 86, height: 86 });

      // Field rows
      const labelX = 55;
      const valueX = 215;
      const valueW = photoX - valueX - 12;
      let y = 210;
      const rowGap = 30;

      const row = (label: string, value: string, bold = false) => {
        doc.fillColor(COLORS.muted).font("Helvetica").fontSize(12).text(label, labelX, y, { width: valueX - labelX - 8 });
        doc.fillColor(COLORS.ink).font("Helvetica").fontSize(11).text(":", valueX - 8, y);
        doc.fillColor(COLORS.ink).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(12)
          .text(value || "—", valueX, y, { width: valueW });
        y += rowGap;
      };

      row("Name of the student", input.studentName, true);
      row("Father's Name", input.fatherName);
      row("Mother's Name", input.motherName);
      row("Gender", input.gender);
      row("Name of the institute", input.instituteName, true);
      row("Post Office", input.postOffice);
      row("Upazila/Thana", input.upazilla);
      row("District", input.district);
      row("Trade Name and Code", `${input.courseTitle}${input.courseCode ? ` (${input.courseCode})` : ""}`, true);

      row("Registration Number", input.registrationNo, true);
      row("Roll No", input.rollNo, true);
      row("Session", input.session);

      // Signatures
      const sigY = doc.page.height - 90;
      drawSignature(doc, 55, sigY, 150, "Signature of Student");
      drawSignature(doc, W / 2 - 90, sigY, 180, "Signature of Head of the institute");
      drawSignature(doc, W - 205, sigY, 150, "Deputy Secretary", "(Registration)");

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateAndUploadRegistrationCard(input: RegistrationCardInput): Promise<string> {
  const buffer = await render(input);
  return uploadPdf(buffer, "ycsdi/registration-cards", input.serialNo);
}
