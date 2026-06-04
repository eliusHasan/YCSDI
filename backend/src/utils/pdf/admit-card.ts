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
  formatDate,
  uploadPdf,
} from "./shared.js";

export interface AdmitCardInput {
  serialNo: string;
  instituteName: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: Date;
  session: string;
  subjectName: string;
  rollNo: string;
  registrationNo: string;
  sex: string;
  photoUrl?: string;
}

export async function render(input: AdmitCardInput): Promise<Buffer> {
  const photo = await fetchImageBuffer(input.photoUrl);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      const H = doc.page.height;
      drawFrame(doc);
      drawWatermark(doc, BRAND.shortName);

      // Header
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(13)
        .text(BRAND.govtLine, 0, 48, { align: "center" });
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(20)
        .text(BRAND.name, 0, 70, { align: "center" });

      drawLogo(doc, 55, 110, 72);
      drawBadge(doc, W / 2 - 60, 122, "Admit Card");

      // Photo (top right)
      const photoX = W - 165;
      const photoY = 108;
      const photoW = 110;
      const photoH = 128;
      doc.lineWidth(1).strokeColor(COLORS.line).rect(photoX, photoY, photoW, photoH).stroke();
      if (photo) {
        try {
          doc.image(photo, photoX + 1, photoY + 1, { fit: [photoW - 2, photoH - 2], align: "center", valign: "center" });
        } catch {
          /* ignore */
        }
      }

      // Serial No
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(11).text("Serial No.", 55, 200);
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(12).text(input.serialNo, 115, 200);

      // Left column fields
      const labelX = 55;
      const valueX = 215;
      let y = 235;
      const rowGap = 28;
      const row = (label: string, value: string, bold = false) => {
        doc.fillColor(COLORS.muted).font("Helvetica").fontSize(11.5).text(label, labelX, y, { width: valueX - labelX - 6 });
        doc.fillColor(COLORS.ink).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(11.5)
          .text(`: ${value || "—"}`, valueX, y, { width: 320 });
        y += rowGap;
      };

      row("Name of the Institute", input.instituteName, true);
      row("Name of the Student", input.studentName, true);
      row("Father's Name", input.fatherName);
      row("Mother's Name", input.motherName);
      row("Date of Birth", formatDate(input.dateOfBirth));
      row("Session", input.session);
      row("Subject Name", input.subjectName, true);

      // Right column: Roll / Reg boxes + Sex
      const rx = W - 320;
      let ry = 250;
      const boxW = 160;
      const labelW = 70;
      const fieldRow = (label: string, value: string) => {
        doc.fillColor(COLORS.ink).font("Helvetica").fontSize(12).text(label, rx, ry + 6);
        doc.lineWidth(1).strokeColor(COLORS.navy).rect(rx + labelW, ry, boxW, 28).stroke();
        doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(13)
          .text(value || "—", rx + labelW, ry + 7, { width: boxW, align: "center" });
        ry += 48;
      };
      fieldRow("Roll No:", input.rollNo);
      fieldRow("Reg. No:", input.registrationNo);
      doc.fillColor(COLORS.ink).font("Helvetica").fontSize(12).text("Sex", rx, ry + 2);
      doc.fillColor(COLORS.ink).font("Helvetica").fontSize(12).text(`:  ${input.sex || "—"}`, rx + labelW, ry + 2);

      // Directions
      const dirY = H - 100;
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(10).text("Directions:", 55, dirY);
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8.5)
        .text("1. The Examinee must bring the Registration Card along with the Admit Card in the examination hall.", 55, dirY + 14, { width: 460 })
        .text("2. The Examinee must sign the attendance sheet otherwise examinee will be treated as absent.", 55, dirY + 26, { width: 460 });

      // Signature
      drawSignature(doc, W - 240, H - 70, 185, "Controller of Examinations", BRAND.shortName);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateAndUploadAdmitCard(input: AdmitCardInput): Promise<string> {
  const buffer = await render(input);
  return uploadPdf(buffer, "ycsdi/admit-cards", input.serialNo);
}
