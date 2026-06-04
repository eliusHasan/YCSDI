import PDFDocument from "pdfkit";
import { GRADING_SYSTEM } from "../../models/Enrollment.js";
import {
  BRAND,
  COLORS,
  drawBadge,
  drawFrame,
  drawLogo,
  drawSignature,
  drawWatermark,
  qrBuffer,
  uploadPdf,
} from "./shared.js";

export interface MarksheetSubject {
  name: string;
  fullMark: number;
  obtainedMark: number;
  letterGrade: string;
  gradePoint: number;
}

export interface MarksheetInput {
  serialNo: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  rollNo: string;
  registrationNo: string;
  instituteName: string;
  courseTitle: string;
  courseDuration: string;
  session: string;
  subjects: MarksheetSubject[];
  totalFull: number;
  totalObtained: number;
  letterGrade: string;
  cgpa: number;
}

function gradingRowLabel(index: number): string {
  const min = GRADING_SYSTEM[index][0];
  if (index === 0) return `${min} or Above`;
  const prevMin = GRADING_SYSTEM[index - 1][0];
  if (min === 0) return `Below ${prevMin}`;
  return `${min} - Below ${prevMin}`;
}

export async function render(input: MarksheetInput): Promise<Buffer> {
  const qr = await qrBuffer(input.serialNo);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 0 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      const H = doc.page.height;
      drawFrame(doc);
      drawWatermark(doc, BRAND.shortName);

      // Header
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(11)
        .text(BRAND.govtLine, 0, 44, { align: "center" });
      drawLogo(doc, 48, 58, 56);
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(17)
        .text(BRAND.name, 0, 64, { align: "center", width: W });
      drawBadge(doc, W / 2 - 95, 100, "Academic Transcript");

      // Serial No
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(12)
        .text(`Serial No: ${input.serialNo}`, 55, 150);

      // Grading system table (top right)
      const gx = W - 230;
      const gy = 145;
      const gw = 185;
      const colA = 110;
      const colB = 35;
      const gRowH = 14;
      doc.lineWidth(1).strokeColor(COLORS.navy).rect(gx, gy, gw, gRowH).stroke();
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(8.5)
        .text("Grading System", gx, gy + 3.5, { width: gw, align: "center" });
      let gry = gy + gRowH;
      GRADING_SYSTEM.forEach((band, i) => {
        doc.lineWidth(0.5).strokeColor(COLORS.line);
        doc.rect(gx, gry, colA, gRowH).stroke();
        doc.rect(gx + colA, gry, colB, gRowH).stroke();
        doc.rect(gx + colA + colB, gry, gw - colA - colB, gRowH).stroke();
        doc.fillColor(COLORS.ink).font("Helvetica").fontSize(7)
          .text(gradingRowLabel(i), gx + 4, gry + 3.5, { width: colA - 6 });
        doc.font("Helvetica").fontSize(7).text(band[1], gx + colA, gry + 3.5, { width: colB, align: "center" });
        doc.text(band[2].toFixed(2), gx + colA + colB, gry + 3.5, { width: gw - colA - colB, align: "center" });
        gry += gRowH;
      });

      // Left column fields
      const labelX = 55;
      const valueX = 195;
      let y = 195;
      const rowGap = 23;
      const row = (label: string, value: string, bold = false) => {
        doc.fillColor(COLORS.muted).font("Helvetica").fontSize(11).text(label, labelX, y, { width: valueX - labelX - 6 });
        doc.fillColor(COLORS.ink).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(11)
          .text(`: ${value || "—"}`, valueX, y, { width: gx - valueX - 10 });
        y += rowGap;
      };

      row("Name of the student", input.studentName, true);
      row("Father's Name", input.fatherName);
      row("Mother's Name", input.motherName);
      row("Roll No", input.rollNo, true);
      row("Registration No", input.registrationNo, true);
      row("Institution", input.instituteName, true);
      row("Technology", input.courseTitle, true);
      row("Course Duration", input.courseDuration);
      row("Session", input.session);

      // Final Results badge + per-subject table
      y = Math.max(y, gry) + 14;
      drawBadge(doc, W / 2 - 55, y, "Final Results");
      y += 46;

      const cols = [
        { key: "name", label: "Subject", w: 215, align: "left" as const },
        { key: "full", label: "Full Mark", w: 75, align: "center" as const },
        { key: "obt", label: "Obtained", w: 75, align: "center" as const },
        { key: "grade", label: "Grade", w: 60, align: "center" as const },
        { key: "gp", label: "GP", w: 60, align: "center" as const },
      ];
      const tableX = 55;
      const tableW = cols.reduce((a, c) => a + c.w, 0);
      const thH = 24;
      const rowH = Math.max(18, Math.min(24, Math.floor((H - 150 - y) / (input.subjects.length + 2))));

      const drawRow = (cells: string[], topY: number, h: number, opts: { header?: boolean; bold?: boolean } = {}) => {
        let cx = tableX;
        cols.forEach((c, i) => {
          if (opts.header) doc.rect(cx, topY, c.w, h).fillAndStroke("#EEF2F6", COLORS.navy);
          else doc.lineWidth(0.6).strokeColor(COLORS.navy).rect(cx, topY, c.w, h).stroke();
          doc.fillColor(opts.header ? COLORS.navy : COLORS.ink)
            .font(opts.header || opts.bold ? "Helvetica-Bold" : "Helvetica")
            .fontSize(opts.header ? 9.5 : 9.5)
            .text(cells[i], cx + (c.align === "left" ? 6 : 0), topY + h / 2 - 5, {
              width: c.align === "left" ? c.w - 10 : c.w,
              align: c.align,
            });
          cx += c.w;
        });
      };

      drawRow(["Subject", "Full Mark", "Obtained", "Grade", "GP"], y, thH, { header: true });
      let ty = y + thH;
      input.subjects.forEach((s) => {
        drawRow([s.name, s.fullMark.toFixed(0), s.obtainedMark.toFixed(0), s.letterGrade, s.gradePoint.toFixed(2)], ty, rowH);
        ty += rowH;
      });
      // Totals row — shade first, then draw bordered cells + bold text on top.
      doc.rect(tableX, ty, tableW, thH).fillOpacity(0.1).fill(COLORS.gold);
      doc.fillOpacity(1);
      drawRow(
        ["TOTAL / CGPA", input.totalFull.toFixed(0), input.totalObtained.toFixed(0), input.letterGrade, input.cgpa.toFixed(2)],
        ty,
        thH,
        { bold: true },
      );

      // QR (bottom left) + signatures
      doc.image(qr, 55, H - 125, { width: 84, height: 84 });
      drawSignature(doc, W / 2 - 40, H - 58, 110, "Prepared by");
      drawSignature(doc, W - 230, H - 58, 175, "Controller of Examinations");

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateAndUploadMarksheet(input: MarksheetInput): Promise<string> {
  const buffer = await render(input);
  return uploadPdf(buffer, "ycsdi/marksheets", input.serialNo);
}
