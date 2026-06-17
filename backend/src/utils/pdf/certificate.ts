import PDFDocument from "pdfkit";
import { loadAsset, qrBuffer, uploadPdf } from "./shared.js";

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
  /** Institute code printed in the "Center Code" slot. */
  centerCode?: string;
  /** Course length (e.g. "Six Months") printed in the "Course of" slot. */
  courseDuration?: string;
}

/**
 * Layout replicated 1:1 from the reference YCSDT certificate artwork
 * (vector PDF supplied by the institute's designer). All coordinates are in
 * PDF points on an A4 landscape page (841.89 x 595.28), `y` is a text
 * baseline measured from the top edge. `sx`/`sy` are the horizontal/vertical
 * font scales the artwork uses (several faces are anamorphically squeezed).
 */
const INK = "#2C2E35";
const GREEN = "#144C44";
const RED = "#F8281A";

/** Font slots: asset file in assets/documents/fonts/ + built-in fallback. */
const FONTS = {
  latin: { file: "fonts/latin-wide.otf", fallback: "Helvetica-Bold" },
  rounded: { file: "fonts/arial-rounded-bold.otf", fallback: "Helvetica-Bold" },
  // Blackletter face for the "Certificate" heading (UnifrakturCook, OFL).
  blackletter: { file: "fonts/cert-blackletter.ttf", fallback: "Times-Bold" },
  corsiva: { file: "fonts/monotype-corsiva.otf", fallback: "Times-Italic" },
  birgine: { file: "fonts/birgine.otf", fallback: "Times-Roman" },
  narrow: { file: "fonts/arial-narrow.otf", fallback: "Helvetica" },
  myriad: { file: "fonts/myriad-pro.otf", fallback: "Helvetica" },
  italic: { file: "fonts/arial-italic.otf", fallback: "Helvetica-Oblique" },
  // Dynamic fill-in values. The artwork uses Coronet LT Std (commercial);
  // MonteCarlo (OFL) is its free revival. Drop fonts/coronet.otf in to use
  // the licensed original.
  script: { file: "fonts/montecarlo.ttf", fallback: "Times-Italic", override: "fonts/coronet.otf" },
} as const;

type FontKey = keyof typeof FONTS;

interface TextItem {
  f: FontKey;
  x: number;
  y: number;
  sx: number;
  sy: number;
  str: string;
  /** Total run width in the reference artwork (pt) — calibrates word gaps. */
  w?: number;
  color?: string;
}

/** Every static text run, verbatim from the reference artwork. */
const STATIC_TEXT: TextItem[] = [
  { f: "latin", x: 50.76, y: 87.98, sx: 14.486, sy: 64.376, w: 740.1, str: "YOUTH CAREER & SKILLS DEVELOPMENT TRAINING" },
  { f: "narrow", x: 427.43, y: 173.08, sx: 8.253, sy: 6.854, w: 63.82, str: "www.ycsdi.netlify.app" },
  { f: "birgine", x: 260.31, y: 197.12, sx: 16.256, sy: 13.5, w: 370.4, str: "Approved By Govt. of The People's Republic of Bangladesh" },
  // "Certificate" heading is drawn separately in render() with the blackletter face.

  // Incorporation panel (left sidebar, top box)
  { f: "myriad", x: 72.29, y: 151.67, sx: 10.338, sy: 10.338, w: 116.08, str: "Certificate of Incorporation" },
  { f: "myriad", x: 78.37, y: 164.08, sx: 10.338, sy: 10.338, w: 103.94, str: "(under Act XVIII of 1994)" },
  { f: "myriad", x: 110.42, y: 183.75, sx: 10.338, sy: 10.338, w: 40.99, str: "C-166149" },
  { f: "myriad", x: 68.83, y: 194.05, sx: 5, sy: 5, str: "I" },
  { f: "myriad", x: 74.32, y: 194.05, sx: 5, sy: 5, str: "hereby" },
  { f: "myriad", x: 93.17, y: 194.05, sx: 5, sy: 5, str: "certify" },
  { f: "myriad", x: 110.57, y: 194.05, sx: 5, sy: 5, str: "that" },
  { f: "myriad", x: 123.11, y: 194.05, sx: 5, sy: 5, str: "Y.C.S.D" },
  { f: "myriad", x: 141.23, y: 194.05, sx: 5, sy: 5, str: "Training" },
  { f: "myriad", x: 162.48, y: 194.05, sx: 5, sy: 5, str: "Cell" },
  { f: "myriad", x: 174.46, y: 194.05, sx: 5, sy: 5, str: "Ltd." },
  { f: "myriad", x: 186.13, y: 194.05, sx: 5, sy: 5, str: "was" },
  { f: "myriad", x: 68.83, y: 201.05, sx: 5, sy: 5, w: 125.34, str: "incorporated on this day under the Companies Act, 1994 (Act" },
  { f: "myriad", x: 68.83, y: 208.05, sx: 5, sy: 5, w: 119.73, str: "XVIII of 1994), and that the company is a limited company." },
  { f: "myriad", x: 68.83, y: 222.05, sx: 5, sy: 5, w: 125.32, str: "Given under my hand at Rajshahi on this Eighteenth day of" },
  { f: "myriad", x: 68.83, y: 229.05, sx: 5, sy: 5, w: 76.25, str: "May, Two Thousand and Twenty-Five." },
  { f: "myriad", x: 155.58, y: 268.45, sx: 3.61, sy: 4, w: 16.4, str: "By order of" },
  { f: "myriad", x: 157.5, y: 273.45, sx: 3.61, sy: 4, w: 13.33, str: "Registrar" },
  { f: "myriad", x: 150.01, y: 288.45, sx: 3.61, sy: 4, w: 27.54, str: "Assistant Registrar" },
  { f: "myriad", x: 132.27, y: 293.45, sx: 3.61, sy: 4, w: 63.8, str: "Registrar of Joint Stock Companies & Firms" },
  { f: "myriad", x: 155.37, y: 298.45, sx: 3.61, sy: 4, w: 17.59, str: "Bangladesh" },
  { f: "myriad", x: 68.33, y: 308.84, sx: 4, sy: 4, w: 118.83, str: "This certificate is digitally generated. Please find the soft copy and verify" },
  { f: "myriad", x: 68.33, y: 313.64, sx: 4, sy: 4, w: 22.88, str: "the signature." },

  // Grading panel (left sidebar, bottom box)
  { f: "birgine", x: 100.4, y: 338.64, sx: 13.568, sy: 11.368, w: 77.87, str: "Grading Marks" },
  { f: "birgine", x: 86.73, y: 356.82, sx: 12, sy: 12, w: 13.55, str: "A+" },
  { f: "birgine", x: 103.35, y: 356.83, sx: 12, sy: 12, w: 70.97, str: "=80% & Above" },
  { f: "birgine", x: 89.96, y: 372.82, sx: 12, sy: 12, w: 7.09, str: "A" },
  { f: "birgine", x: 103.71, y: 372.83, sx: 12, sy: 12, w: 70.26, str: "=70% & Above" },
  { f: "birgine", x: 88.01, y: 388.81, sx: 12, sy: 12, w: 10.98, str: "A-" },
  { f: "birgine", x: 103.28, y: 388.82, sx: 12, sy: 12, w: 71.11, str: "=60% & Above" },
  { f: "birgine", x: 90.2, y: 404.81, sx: 12, sy: 12, w: 6.6, str: "B" },
  { f: "birgine", x: 103.33, y: 404.82, sx: 12, sy: 12, w: 71.02, str: "=50% & Above" },
  { f: "birgine", x: 89.86, y: 420.8, sx: 12, sy: 12, w: 7.26, str: "C" },
  { f: "birgine", x: 103.36, y: 420.82, sx: 12, sy: 12, w: 70.96, str: "=40% & Above" },
  { f: "myriad", x: 95.98, y: 515.4, sx: 8.665, sy: 8.073, w: 71.31, str: "Scan for Verification" },

  // Footer
  { f: "myriad", x: 297.8, y: 540, sx: 12, sy: 12, w: 79.76, str: "Exam Controller" },
  { f: "myriad", x: 677.75, y: 540, sx: 12, sy: 12, w: 48.6, str: "Chairman" },
  // "certiﬁcate" uses U+FB01: the embedded subset only carries the fi ligature glyph, not a standalone "f".
  { f: "italic", x: 441.83, y: 558.03, sx: 6.091, sy: 6.091, w: 174.68, str: "Note: This certiﬁcate is issued without any alternation or erasure.", color: RED },
];

/**
 * Fill-in body lines (Monotype Corsiva labels with dotted leaders). Dynamic
 * values are centred over the dot runs at render time, so they sit on the
 * leader exactly like the reference artwork.
 */
const BODY_LINES: Array<{ x: number; y: number; w: number; str: string }> = [
  { x: 222.63, y: 262.77, w: 56.65, str: "Serial No :" },
  { x: 620.45, y: 262.77, w: 157.13, str: "Roll No: ................................." },
  { x: 620.45, y: 280.66, w: 158.33, str: "Reg No: .................................." },
  { x: 224, y: 309.82, w: 550.22, str: "This is to certify that ...................................................................................................................................." },
  { x: 224, y: 334.82, w: 551.18, str: "Son/daughter of ............................................................................................................................................" },
  { x: 224, y: 359.83, w: 551.27, str: "and ................................................................................................................................................................" },
  { x: 224, y: 384.83, w: 550.97, str: "on .................................................................................................................................................................." },
  { x: 224, y: 409.84, w: 548.9, str: "has successfully completed the Course of .......................................................... from the technical training" },
  { x: 224, y: 434.84, w: 552.74, str: "Center .............................................................................................................. Center Code.........................." },
  { x: 224, y: 459.85, w: 545.78, str: "in the session .......................................................................................................conducted by the YCSDT" },
  { x: 224, y: 484.85, w: 253.26, str: "He/She was awarded .............................. Grade." },
];
const BODY_FONT_SIZE = 15;
const CORSIVA_SMALL = 14.908; // serial/roll/reg row

/**
 * Script (Coronet-style) values: the reference draws Coronet at 19.09pt;
 * MonteCarlo's optical size runs ~10% larger, so it is drawn slightly smaller
 * to match the artwork's value height.
 */
const SCRIPT_SIZE = 17.3;
const SCRIPT_HSCALE = 20.025 / 19.09;

function registerFonts(doc: PDFKit.PDFDocument): Record<FontKey, string> {
  const resolved = {} as Record<FontKey, string>;
  for (const key of Object.keys(FONTS) as FontKey[]) {
    const spec = FONTS[key];
    const buf =
      ("override" in spec ? loadAsset(spec.override) : null) ?? loadAsset(spec.file);
    if (buf) {
      try {
        doc.registerFont(`cert-${key}`, buf);
        resolved[key] = `cert-${key}`;
        continue;
      } catch {
        /* corrupt/unsupported file — fall back below */
      }
    }
    resolved[key] = spec.fallback;
  }
  return resolved;
}

/** Draws one space-free token at its baseline, applying the artwork's squeeze. */
function drawToken(
  doc: PDFKit.PDFDocument,
  font: string,
  item: { x: number; y: number; sx: number; sy: number; str: string; color?: string },
): void {
  doc.font(font).fontSize(item.sy).fillColor(item.color ?? INK);
  const squeeze = item.sx / item.sy;
  if (Math.abs(squeeze - 1) < 0.001) {
    doc.text(item.str, item.x, item.y, { baseline: "alphabetic", lineBreak: false });
    return;
  }
  doc.save();
  doc.scale(squeeze, 1, { origin: [item.x, item.y] });
  doc.text(item.str, item.x, item.y, { baseline: "alphabetic", lineBreak: false });
  doc.restore();
}

/**
 * Word-by-word layout of one reference run. The subset fonts carry no space
 * glyph (the artwork positions words individually), so spaces are never drawn:
 * each word is placed at a computed offset, and the inter-word gap is
 * calibrated so the run's total width matches the artwork (`w`). Returns the
 * x-spans of any dotted leaders (3+ dots), used to centre fill-in values.
 */
function drawRun(doc: PDFKit.PDFDocument, font: string, item: TextItem): Array<[number, number]> {
  const words = item.str.split(" ").filter((t) => t.length > 0);
  const squeeze = item.sx / item.sy;
  doc.font(font).fontSize(item.sy);
  const widths = words.map((word) => doc.widthOfString(word) * squeeze);
  const totalWords = widths.reduce((a, b) => a + b, 0);
  const gaps = words.length - 1;
  const refW = item.w ?? totalWords + gaps * doc.widthOfString("n") * squeeze * 0.55;
  const gapW = gaps > 0 ? Math.max(0, (refW - totalWords) / gaps) : 0;

  const spans: Array<[number, number]> = [];
  let x = item.x;
  words.forEach((word, i) => {
    drawToken(doc, font, { ...item, x, str: word });
    const dots = /\.{3,}/.exec(word);
    if (dots) {
      const before = doc.widthOfString(word.slice(0, dots.index)) * squeeze;
      const run = doc.widthOfString(dots[0]) * squeeze;
      spans.push([x + before, x + before + run]);
    }
    x += widths[i] + gapW;
  });
  return spans;
}

/** Centres a script value over [start, end], shrinking the font when needed. */
function drawValue(
  doc: PDFKit.PDFDocument,
  font: string,
  value: string,
  span: [number, number] | undefined,
  baseline: number,
): void {
  if (!value || !span) return;
  const maxW = span[1] - span[0] + 14; // values may slightly overhang the dots
  let size = SCRIPT_SIZE;
  doc.font(font).fontSize(size);
  let w = doc.widthOfString(value) * SCRIPT_HSCALE;
  if (w > maxW) {
    size = (size * maxW) / w;
    doc.fontSize(size);
    w = doc.widthOfString(value) * SCRIPT_HSCALE;
  }
  const x = (span[0] + span[1]) / 2 - w / 2;
  drawToken(doc, font, { x, y: baseline, sx: size * SCRIPT_HSCALE, sy: size, str: value });
}

function formatExamDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
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
      const fonts = registerFonts(doc);

      // Full-page ornamental guilloche border (same artwork as the reference).
      doc.rect(0, 0, W, H).fill("#FFFFFF");
      const border = loadAsset("certificate-border.png");
      if (border) {
        try {
          doc.image(border, 0, 0, { width: W, height: H });
        } catch {
          /* keep generating on a plain page if the asset is unreadable */
        }
      }

      // Faint centred logo watermark (drawn over the border's white field, under
      // all text), matching the other documents.
      const watermark = loadAsset("logo.png");
      if (watermark) {
        const wmW = 250;
        const wmH = wmW * (2088 / 2461);
        doc.save();
        doc.opacity(0.06);
        try {
          doc.image(watermark, (W - wmW) / 2, (H - wmH) / 2, { width: wmW, height: wmH });
        } catch {
          /* optional */
        }
        doc.restore();
        doc.opacity(1);
      }

      // Header artwork: institute logo + govt emblem.
      const logo = loadAsset("cert-logo.png");
      if (logo) {
        try {
          doc.image(logo, 413, 91.5, { width: 92 });
        } catch {
          /* optional */
        }
      }
      const emblem = loadAsset("cert-govt-emblem.png");
      if (emblem) {
        try {
          doc.image(emblem, 112.5, 103.6, { width: 38.5 });
        } catch {
          /* optional */
        }
      }

      // Left sidebar panels.
      doc.lineWidth(1.1).strokeColor(INK);
      doc.roundedRect(59.9, 102.1, 140, 216, 8).stroke();
      doc.roundedRect(59.9, 324.1, 140, 194.8, 8).stroke();
      // Official incorporation QR (govt registration) in the registrar-stamp slot
      // of the incorporation panel; falls back to a solid placeholder box.
      const incorpQr = loadAsset("incorporation-qr.png");
      if (incorpQr) {
        try {
          doc.image(incorpQr, 73, 241, { width: 53, height: 53 });
        } catch {
          doc.rect(74, 239.5, 50, 57.5).fill(INK);
        }
      } else {
        doc.rect(74, 239.5, 50, 57.5).fill(INK);
      }
      // Divider under "Grading Marks".
      doc.lineWidth(1.8).strokeColor(INK).moveTo(93.5, 344.6).lineTo(186, 344.6).stroke();
      // Signature rules.
      doc.lineWidth(1.2).strokeColor(INK);
      doc.moveTo(292, 528.1).lineTo(383, 528.1).stroke();
      doc.moveTo(655, 528.1).lineTo(746, 528.1).stroke();

      // Exam Controller (examiner) signature above the left rule (kept small so
      // it clears the "awarded ... Grade" line above).
      const examinerSign = loadAsset("examiner-sign.png");
      if (examinerSign) {
        try {
          const sw = 68;
          const sh = sw * (748 / 1572);
          doc.image(examinerSign, (292 + 383) / 2 - sw / 2, 527 - sh, { width: sw });
        } catch {
          /* optional */
        }
      }

      // Chairman's signature, centred just above the right rule.
      const chairmanSign = loadAsset("chairman-sign.png");
      if (chairmanSign) {
        try {
          const sw = 88;
          const sh = sw * (252 / 658);
          doc.image(chairmanSign, (655 + 746) / 2 - sw / 2, 527 - sh, { width: sw });
        } catch {
          /* optional */
        }
      }

      // QR code, centred in the "Scan for Verification" slot (kept compact).
      {
        const qrSize = 54;
        const qrCenterX = 129.9; // centre of the left panel
        doc.image(qr, qrCenterX - qrSize / 2, 444, { width: qrSize, height: qrSize });
      }

      // Static text, verbatim from the artwork.
      for (const item of STATIC_TEXT) drawRun(doc, fonts[item.f], item);

      // "Certificate" heading in the blackletter face (user-specified), centred
      // where the original CERTIFICATE word sat in the artwork.
      {
        const text = "Certificate";
        const centerX = 458.42;
        const baseline = 238;
        const targetW = 212;
        doc.font(fonts.blackletter).fontSize(100);
        const size = Math.min(52, (100 * targetW) / doc.widthOfString(text));
        doc.fontSize(size);
        const w = doc.widthOfString(text);
        drawToken(doc, fonts.blackletter, { x: centerX - w / 2, y: baseline, sx: size, sy: size, str: text, color: GREEN });
      }

      // Corsiva fill-in labels with their dotted leaders; capture dot spans.
      const lineSpans = BODY_LINES.map((line) => {
        const size = line.y < 300 ? CORSIVA_SMALL : BODY_FONT_SIZE;
        return drawRun(doc, fonts.corsiva, { f: "corsiva", x: line.x, y: line.y, sx: size, sy: size, w: line.w, str: line.str });
      });

      // Dynamic values (script face), centred over each line's dotted run.
      const sc = fonts.script;
      // Serial has no dots — left-aligned beside its label, like the reference.
      drawToken(doc, sc, { x: 287.93, y: 263.88, sx: SCRIPT_SIZE * SCRIPT_HSCALE, sy: SCRIPT_SIZE, str: input.serialNo });
      drawValue(doc, sc, input.rollNo, lineSpans[1][0], 255.55);
      drawValue(doc, sc, input.registrationNo, lineSpans[2][0], 275.55);
      drawValue(doc, sc, input.studentName, lineSpans[3][0], 305.55);
      drawValue(doc, sc, input.fatherName, lineSpans[4][0], 330.34);
      drawValue(doc, sc, input.motherName, lineSpans[5][0], 355.13);
      drawValue(doc, sc, formatExamDate(input.examDate), lineSpans[6][0], 379.91);
      drawValue(doc, sc, input.courseDuration || input.courseTitle, lineSpans[7][0], 404.7);
      drawValue(doc, sc, input.instituteName, lineSpans[8][0], 429.49);
      drawValue(doc, sc, input.centerCode ?? "", lineSpans[8][1], 429.55);
      drawValue(doc, sc, input.session, lineSpans[9][0], 454.27);
      drawValue(doc, sc, input.letterGrade ?? "", lineSpans[10][0], 479.06);

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
