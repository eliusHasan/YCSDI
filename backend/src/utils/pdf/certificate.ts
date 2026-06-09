import PDFDocument from "pdfkit";
import {
  BRAND,
  COLORS,
  drawLogo,
  drawSignature,
  formatDate,
  loadAsset,
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
const NOTE_RED = "#B23B3B";

/**
 * Certificate frame. Uses the ornamental `certificate-border.png` full-page
 * artwork when present (drop-in via the assets folder); otherwise falls back to
 * the drawn gold chevron frame so generation never breaks if the asset is gone.
 */
function drawBorder(doc: PDFKit.PDFDocument, W: number, H: number) {
  doc.rect(0, 0, W, H).fill(COLORS.white);

  const border = loadAsset("certificate-border.png");
  if (border) {
    try {
      doc.image(border, 0, 0, { width: W, height: H });
      return;
    } catch {
      /* fall through to drawn frame */
    }
  }

  doc.lineWidth(8).strokeColor(COLORS.gold).rect(16, 16, W - 32, H - 32).stroke();

  // Chevron zig-zag band running just inside the outer line on all four edges.
  doc.save();
  doc.lineWidth(1.6).strokeColor(COLORS.goldDark);
  const amp = 5;
  const step = 13;
  const zig = (pts: Array<[number, number]>) => {
    doc.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i += 1) doc.lineTo(pts[i][0], pts[i][1]);
    doc.stroke();
  };
  for (const yc of [30, H - 30]) {
    const pts: Array<[number, number]> = [];
    let up = true;
    for (let x = 30; x <= W - 30; x += step) {
      pts.push([x, yc + (up ? -amp : amp)]);
      up = !up;
    }
    zig(pts);
  }
  for (const xc of [30, W - 30]) {
    const pts: Array<[number, number]> = [];
    let left = true;
    for (let y = 30; y <= H - 30; y += step) {
      pts.push([xc + (left ? -amp : amp), y]);
      left = !left;
    }
    zig(pts);
  }
  doc.restore();

  doc.lineWidth(1.5).strokeColor(COLORS.gold).rect(40, 40, W - 80, H - 80).stroke();
  doc.lineWidth(0.8).strokeColor(COLORS.navy).rect(46, 46, W - 92, H - 92).stroke();
}

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

      drawBorder(doc, W, H);

      // Title block
      const titleW = W - 160;
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(25)
        .text(BRAND.name, 80, 56, { width: titleW, align: "center" });
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9.5)
        .text(`${BRAND.website}   ·   ${BRAND.govtLine}`, 80, 88, { width: titleW, align: "center" });
      drawLogo(doc, W / 2 - 22, 98, 44);
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(40)
        .text("CERTIFICATE", 80, 152, { width: titleW, align: "center", characterSpacing: 5 });

      // Meta row: Serial (left) · Reg + Session (right) — sits above the body.
      const metaY = 212;
      doc.fillColor(COLORS.ink).font("Helvetica-Oblique").fontSize(12)
        .text(`Serial No: ${input.serialNo}`, 70, metaY);
      doc.font("Helvetica-Oblique").fontSize(12)
        .text(`Reg. No: ${input.registrationNo}`, W - 320, metaY, { width: 250, align: "left" });
      doc.text(`Session: ${input.session || "—"}`, W - 320, metaY + 18, { width: 250, align: "left" });

      // Left column: QR + Grading Marks
      const qrY = metaY + 42;
      doc.image(qr, 70, qrY, { width: 92, height: 92 });
      doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(11)
        .text("Grading Marks", 60, qrY + 102, { width: 116, align: "center" });
      doc.fillColor(COLORS.ink).font("Helvetica").fontSize(9.5);
      GRADING_MARKS.forEach((g, i) => doc.text(g, 70, qrY + 120 + i * 16, { width: 150 }));

      // Body — full-width fill-in lines with dotted leaders.
      const bx = 235;
      const rightX = W - 70;
      type Seg = { t: string; b?: boolean; sm?: boolean };
      const bodyLine = (by: number, parts: Seg[]) => {
        let x = bx;
        for (const p of parts) {
          doc.font(p.b ? "Helvetica-BoldOblique" : "Helvetica-Oblique").fontSize(p.sm ? 11 : 13)
            .fillColor(p.b ? COLORS.navy : p.sm ? COLORS.muted : COLORS.ink)
            .text(p.t, x, by, { lineBreak: false });
          x += doc.widthOfString(p.t);
        }
        doc.save();
        doc.dash(1.5, { space: 3 }).lineWidth(0.7).strokeColor(COLORS.line);
        doc.moveTo(Math.min(x + 8, rightX), by + 14).lineTo(rightX, by + 14).stroke();
        doc.undash();
        doc.restore();
      };

      const cgpaText = `${(input.cgpa ?? 0).toFixed(2)}${input.letterGrade ? ` (${input.letterGrade})` : ""}`;
      let by = 262;
      const gap = 30;
      bodyLine(by, [{ t: "This is to certify that,  " }, { t: input.studentName, b: true }]); by += gap;
      bodyLine(by, [{ t: "Son/Daughter of  " }, { t: input.fatherName, b: true }, { t: "   (Father)", sm: true }]); by += gap;
      bodyLine(by, [{ t: "and  " }, { t: input.motherName, b: true }, { t: "   (Mother)", sm: true }]); by += gap;
      bodyLine(by, [{ t: "of  " }, { t: input.instituteName, b: true }]); by += gap;
      bodyLine(by, [{ t: "bearing Roll No.  " }, { t: input.rollNo, b: true }, { t: "  duly passed the  " }, { t: input.courseTitle, b: true }, { t: "  Examination" }]); by += gap;
      bodyLine(by, [{ t: "held in the month of  " }, { t: formatDate(input.examDate), b: true }, { t: ".  He/She secured CGPA  " }, { t: cgpaText, b: true }, { t: "  on a scale of 4.00," }]); by += gap;
      bodyLine(by, [{ t: "under the Skill Development Training Program of  " }, { t: BRAND.shortName, b: true }, { t: "." }]);

      // Footer: publication date + signatures
      const footerY = H - 96;
      doc.fillColor(COLORS.ink).font("Helvetica-Oblique").fontSize(11)
        .text(`Date of Publication of Results: ${formatDate(input.issuedDate)}`, 70, footerY, { width: 320, lineBreak: false });
      drawSignature(doc, W / 2 - 75, footerY + 26, 150, "Exam Controller");
      drawSignature(doc, W - 235, footerY + 26, 165, "Chairman", undefined, "signature-2.png");

      // Bottom note + tiny identifiers — kept inside the ornamental border.
      doc.fillColor(NOTE_RED).font("Helvetica-Oblique").fontSize(8.5)
        .text("Note: This certificate is issued without any alteration or erasure.", 0, H - 52, { align: "center", width: W });
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7)
        .text(`Certificate No: ${input.certificateNumber}`, 70, H - 50, { lineBreak: false });

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
