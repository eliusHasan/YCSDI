import PDFDocument from "pdfkit";
import {
  BRAND,
  COLORS,
  drawSignature,
  formatDate,
  qrBuffer,
  uploadPdf,
} from "./shared.js";

export interface CertificateInput {
  serialNo: string;
  certificateNumber: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  instituteName: string;
  courseTitle: string;
  rollNo: string;
  registrationNo: string;
  session: string;
  cgpa?: number;
  letterGrade?: string;
  examDate: Date;
  issuedDate: Date;
  photoUrl?: string;
}

const GRADING_MARKS = ["4.00 = 80% & Above", "3.75 = 75% & Above", "3.50 = 70% & Above", "3.25 = 65% & Above"];

export async function render(input: CertificateInput): Promise<Buffer> {
  const qr = await qrBuffer(input.serialNo);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      const H = doc.page.height;

      // Background + decorative gold frame
      doc.rect(0, 0, W, H).fill(COLORS.white);
      doc.lineWidth(8).strokeColor(COLORS.gold).rect(20, 20, W - 40, H - 40).stroke();
      doc.lineWidth(2).strokeColor(COLORS.goldDark).rect(34, 34, W - 68, H - 68).stroke();
      doc.lineWidth(0.8).strokeColor(COLORS.navy).rect(40, 40, W - 80, H - 80).stroke();

      // Title band — laid out top-down so the (possibly two-line) brand name never overlaps.
      const titleW = W - 120;
      let cy = 56;
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(26);
      const nameH = doc.heightOfString(BRAND.name, { width: titleW, align: "center" });
      doc.text(BRAND.name, 60, cy, { width: titleW, align: "center" });
      cy += nameH + 4;
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10)
        .text(`${BRAND.website}  ·  ${BRAND.govtLine}`, 60, cy, { width: titleW, align: "center" });
      cy += 20;
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(44)
        .text("CERTIFICATE", 60, cy, { width: titleW, align: "center", characterSpacing: 4 });
      cy += 62;

      // Right meta: Reg No + Session
      const metaY = cy;
      const metaX = W - 300;
      doc.fillColor(COLORS.ink).font("Helvetica-Oblique").fontSize(12)
        .text(`Reg. No: ${input.registrationNo}`, metaX, metaY, { width: 240 });
      doc.text(`Session: ${input.session || "—"}`, metaX, metaY + 20, { width: 240 });

      // Left meta: Serial No + grading marks + QR
      doc.fillColor(COLORS.ink).font("Helvetica-Oblique").fontSize(12)
        .text(`Serial No: ${input.serialNo}`, 70, metaY);

      const qrY = metaY + 40;
      doc.image(qr, 70, qrY, { width: 92, height: 92 });
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(11).text("Grading Marks", 70, qrY + 102, { width: 130, align: "center" });
      doc.fillColor(COLORS.ink).font("Helvetica").fontSize(9.5);
      GRADING_MARKS.forEach((g, i) => doc.text(g, 70, qrY + 120 + i * 16, { width: 150 }));

      // Body text (right of the left meta column)
      const bx = 210;
      const bw = W - bx - 70;
      let by = qrY;
      const line = (label: string, value: string, tail?: string) => {
        doc.fillColor(COLORS.ink).font("Helvetica-Oblique").fontSize(13).text(label, bx, by, { continued: true });
        doc.font("Helvetica-BoldOblique").fontSize(14).fillColor(COLORS.navy).text(` ${value} `, { continued: !!tail });
        if (tail) doc.font("Helvetica-Oblique").fontSize(12).fillColor(COLORS.muted).text(tail);
        by += 30;
      };

      line("This is to certify that,", input.studentName);
      line("Son/Daughter of", input.fatherName, "(Father)");
      line("and", input.motherName, "(Mother)");
      line("of", input.instituteName);
      line("bearing Roll No.", input.rollNo, `duly passed the ${input.courseTitle} Examination`);

      doc.fillColor(COLORS.ink).font("Helvetica-Oblique").fontSize(13)
        .text("held in the month of ", bx, by, { continued: true });
      doc.font("Helvetica-BoldOblique").fontSize(13).fillColor(COLORS.navy)
        .text(formatDate(input.examDate), { continued: true });
      doc.font("Helvetica-Oblique").fontSize(13).fillColor(COLORS.ink)
        .text(`. He/She secured CGPA `, { continued: true });
      doc.font("Helvetica-BoldOblique").fontSize(13).fillColor(COLORS.navy)
        .text(`${(input.cgpa ?? 0).toFixed(2)}${input.letterGrade ? ` (${input.letterGrade})` : ""}`, { continued: true });
      doc.font("Helvetica-Oblique").fontSize(13).fillColor(COLORS.ink)
        .text(" on a scale of 4.00.", { continued: false });

      // Footer: publication date + signatures
      const footerY = H - 90;
      doc.fillColor(COLORS.ink).font("Helvetica-Oblique").fontSize(11)
        .text(`Date of Publication of Results: ${formatDate(input.issuedDate)}`, 70, footerY - 6, { width: 320 });

      drawSignature(doc, W / 2 - 60, footerY + 20, 130, "Exam Controller");
      drawSignature(doc, W - 230, footerY + 20, 160, "Chairman", undefined, "signature-2.png");

      doc.fillColor(COLORS.muted).font("Helvetica-Oblique").fontSize(8)
        .text(`Certificate No: ${input.certificateNumber}`, 0, H - 30, { align: "center", width: W });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateAndUploadCertificate(input: CertificateInput): Promise<string> {
  const buffer = await render(input);
  return uploadPdf(buffer, "ycsdi/certificates", input.serialNo);
}
