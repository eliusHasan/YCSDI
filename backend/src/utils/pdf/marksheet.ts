import PDFDocument from "pdfkit";
import { loadAsset, qrBuffer, uploadPdf } from "./shared.js";
import {
  DOC_GREEN,
  DOC_INK,
  drawBadge,
  drawDocFrame,
  drawDocHeader,
  drawDocLogo,
  drawToken,
  registerDocFonts,
  type DocFonts,
} from "./doc-common.js";

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

const ROW_LABELS: Array<[string, (i: MarksheetInput) => string]> = [
  ["Name of the student", (i) => i.studentName],
  ["Father's Name", (i) => i.fatherName],
  ["Mother's Name", (i) => i.motherName],
  ["Roll No", (i) => i.rollNo],
  ["Registration No", (i) => i.registrationNo],
  ["Institution", (i) => i.instituteName],
  ["Course Name", (i) => i.courseTitle],
  ["Course Duration", (i) => i.courseDuration],
  ["Session", (i) => i.session],
  ["Final GPA", (i) => (Number.isFinite(i.cgpa) ? i.cgpa.toFixed(2) : "")],
  ["Letter Grade", (i) => i.letterGrade],
];
const ROW_Y = [189, 207.96, 226.96, 245.95, 264.95, 283.94, 302.94, 321.94, 340.93, 359.93, 378.92];
const LABEL_X = 56.48;
const COLON_X = 195;
const VALUE_X = 217.49;
const VALUE_MAX = 470;
const ROW_SIZE = 12;

const GRADING_ROWS: Array<[string, string, string]> = [
  ["80 or Above", "A+", "4.00"],
  ["75-Below 80", "A", "3.75"],
  ["70-Below 75", "A-", "3.50"],
  ["65-Below 70.", "B+", "3.25"],
  ["60-Below 65", "B", "3.00"],
  ["55-Below 60.", "B-", "2.75"],
  ["50- Below 55", "C+", "2.50"],
  ["45-Below 50", "C", "2.25"],
  ["40-Below 45", "D", "2.00"],
  ["Below 40", "F", "0.00"],
];

interface Col {
  label: string;
  w: number;
  align: "left" | "center";
}
const TABLE_COLS: Col[] = [
  { label: "Subject", w: 204, align: "left" },
  { label: "Full Mark", w: 75, align: "center" },
  { label: "Obtained", w: 75, align: "center" },
  { label: "Grade", w: 65, align: "center" },
  { label: "CGPA", w: 65, align: "center" },
];
const TABLE_X = 55.5;
const TABLE_TOP = 426;
const TABLE_BOTTOM = 700; // keep clear of the photo box + footer

/** Per-subject marks table (green header), drawn below the Final Results badge. */
function drawSubjectsTable(doc: PDFKit.PDFDocument, fonts: DocFonts, input: MarksheetInput): void {
  const n = input.subjects.length;
  const headH = 22;
  const totalH = 22;
  const rowH = Math.max(15, Math.min(20, (TABLE_BOTTOM - TABLE_TOP - headH - totalH) / Math.max(1, n)));
  const tableW = TABLE_COLS.reduce((a, c) => a + c.w, 0);

  const cell = (text: string, colX: number, col: Col, topY: number, h: number, font: string, color: string, size = 9.5) => {
    doc.font(font).fontSize(size);
    const baseline = topY + h / 2 + size * 0.34;
    if (col.align === "left") {
      drawToken(doc, font, { x: colX + 6, y: baseline, size, str: text, color });
    } else {
      const tw = doc.widthOfString(text);
      drawToken(doc, font, { x: colX + (col.w - tw) / 2, y: baseline, size, str: text, color });
    }
  };

  // Header row (green fill, white text).
  doc.rect(TABLE_X, TABLE_TOP, tableW, headH).fill(DOC_GREEN);
  let cx = TABLE_X;
  for (const col of TABLE_COLS) {
    cell(col.label, cx, col, TABLE_TOP, headH, fonts.calibriBold, "#FFFFFF");
    cx += col.w;
  }

  // Subject rows.
  let ty = TABLE_TOP + headH;
  doc.lineWidth(0.6).strokeColor(DOC_INK);
  for (const s of input.subjects) {
    const cells = [s.name, s.fullMark.toFixed(0), s.obtainedMark.toFixed(0), s.letterGrade, s.gradePoint.toFixed(2)];
    cx = TABLE_X;
    TABLE_COLS.forEach((col, i) => {
      doc.rect(cx, ty, col.w, rowH).stroke();
      cell(cells[i], cx, col, ty, rowH, i === 0 ? fonts.calibri : fonts.calibriBold, DOC_INK, 9);
      cx += col.w;
    });
    ty += rowH;
  }

  // Total / CGPA row (faint green tint, bold).
  doc.save();
  doc.fillOpacity(0.08).rect(TABLE_X, ty, tableW, totalH).fill(DOC_GREEN);
  doc.restore();
  doc.fillOpacity(1);
  const totals = ["Total / CGPA", input.totalFull.toFixed(0), input.totalObtained.toFixed(0), input.letterGrade, input.cgpa.toFixed(2)];
  cx = TABLE_X;
  doc.lineWidth(0.8).strokeColor(DOC_INK);
  TABLE_COLS.forEach((col, i) => {
    doc.rect(cx, ty, col.w, totalH).stroke();
    cell(totals[i], cx, col, ty, totalH, fonts.calibriBold, DOC_INK, 9.5);
    cx += col.w;
  });
}

function drawValue(doc: PDFKit.PDFDocument, font: string, str: string, x: number, y: number, maxW: number): void {
  let size = ROW_SIZE;
  doc.font(font).fontSize(size);
  const w = doc.widthOfString(str);
  if (w > maxW) size = Math.max(7, (size * maxW) / w);
  drawToken(doc, font, { x, y, size, str: str || "—", color: DOC_INK });
}

function drawGradingTable(doc: PDFKit.PDFDocument, fonts: DocFonts): void {
  const X = 481.5;
  const RIGHT = 555;
  const TOP = 91.5;
  const TITLE_BOTTOM = 103.5;
  const BOTTOM = 193.5;
  const COL1 = 517.7; // range | grade
  const COL2 = 537.5; // grade | gpa
  const rowH = (BOTTOM - TITLE_BOTTOM) / GRADING_ROWS.length;

  doc.lineWidth(0.9).strokeColor(DOC_INK);
  doc.rect(X, TOP, RIGHT - X, BOTTOM - TOP).stroke();
  doc.moveTo(X, TITLE_BOTTOM).lineTo(RIGHT, TITLE_BOTTOM).stroke();
  for (let r = 1; r < GRADING_ROWS.length; r++) {
    const y = TITLE_BOTTOM + r * rowH;
    doc.moveTo(X, y).lineTo(RIGHT, y).stroke();
  }
  doc.moveTo(COL1, TITLE_BOTTOM).lineTo(COL1, BOTTOM).stroke();
  doc.moveTo(COL2, TITLE_BOTTOM).lineTo(COL2, BOTTOM).stroke();

  // Title (Californian FB Bold), centred across the table.
  doc.font(fonts.californian).fontSize(9.308);
  const tw = doc.widthOfString("Grading System");
  drawToken(doc, fonts.californian, {
    x: (X + RIGHT) / 2 - tw / 2,
    y: 99.97,
    size: 9.308,
    str: "Grading System",
    color: DOC_INK,
  });

  // Cells (Calisto MT).
  GRADING_ROWS.forEach(([range, grade, gpa], i) => {
    const y = 109.45 + i * (190.42 - 109.45) / 9;
    drawToken(doc, fonts.calisto, { x: 484.55, y, size: 5.52, str: range, color: DOC_INK });
    drawToken(doc, fonts.calisto, { x: 524.67, y, size: 5.52, str: grade, color: DOC_INK });
    drawToken(doc, fonts.calisto, { x: 540.49, y, size: 5.52, str: gpa, color: DOC_INK });
  });
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
      const fonts = registerDocFonts(doc);
      drawDocFrame(doc, "marksheet-border.png");

      // Header: govt line, title, and a logo vertically centred on the title line.
      drawDocHeader(
        doc,
        fonts,
        { x: 96.4, y: 73.84, size: 32.951, hScale: 9.053 / 32.951, refWidth: 462.53 },
        { x: 95.29, y: 42.62, size: 13.5, hScale: 20.344 / 13.5, refWidth: 463.55 },
      );
      drawDocLogo(doc, 36, 31, 56);

      drawBadge(doc, fonts.resBadge, {
        text: "Academic Transcript",
        size: 17.371,
        hScale: 14.333 / 17.371,
        centerX: W / 2,
        top: 95,
        height: 24,
        padX: 16,
        radius: 4,
      });

      drawGradingTable(doc, fonts);

      drawToken(doc, fonts.arial, { x: 55.67, y: 155.05, size: 13, str: `Serial No: ${input.serialNo}`, color: DOC_INK });

      ROW_LABELS.forEach(([label, get], idx) => {
        const y = ROW_Y[idx];
        // Rows below the grading table can use the full width; the top row stays
        // clear of the table's bottom-left corner.
        const rightEdge = y > 200 ? 560 : VALUE_MAX;
        drawToken(doc, fonts.calibriBold, { x: LABEL_X, y, size: ROW_SIZE, str: label, color: DOC_INK });
        drawToken(doc, fonts.calibriBold, { x: COLON_X, y, size: ROW_SIZE, str: ":", color: DOC_INK });
        drawValue(doc, fonts.calibriBold, get(input), VALUE_X, y, rightEdge - VALUE_X);
      });

      // Final Results badge (sharp green box) + per-subject marks table.
      drawBadge(doc, fonts.resFinal, {
        text: "Final Results",
        size: 14.086,
        hScale: 1,
        centerX: W / 2,
        top: 395,
        height: 22,
        padX: 14,
        radius: 2,
      });
      if (input.subjects.length > 0) drawSubjectsTable(doc, fonts, input);

      // Verification QR code (bottom left).
      doc.image(qr, 55.5, 725.5, { width: 74.5, height: 74.5 });

      // Signatures, centred just above each rule.
      const sign = (asset: string, cx: number, w: number, ratio: number) => {
        const buf = loadAsset(asset);
        if (!buf) return;
        try {
          const h = w * ratio;
          doc.image(buf, cx - w / 2, 782 - h - 2, { width: w });
        } catch {
          /* optional */
        }
      };
      sign("prepared-sign.png", (210 + 352) / 2, 120, 456 / 1885);
      sign("examiner-sign.png", (430 + 574) / 2, 104, 748 / 1572);

      // Signature lines + captions.
      doc.lineWidth(1).strokeColor(DOC_INK);
      doc.moveTo(210, 782).lineTo(352, 782).stroke();
      doc.moveTo(430, 782).lineTo(574, 782).stroke();
      drawToken(doc, fonts.calibriBold, { x: 266.09, y: 795.91, size: 11, hScale: 9.124 / 11, str: "Prepared by", color: DOC_INK });
      drawToken(doc, fonts.calibriBold, { x: 442.62, y: 795.25, size: 11, hScale: 9.124 / 11, str: "Controller of Examinations", color: DOC_INK });

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
