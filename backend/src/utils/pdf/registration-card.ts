import PDFDocument from "pdfkit";
import { fetchImageBuffer, qrBuffer, uploadPdf } from "./shared.js";
import {
  DOC_INK,
  drawBadge,
  drawDocFrame,
  drawDocHeader,
  drawDocLogo,
  drawToken,
  registerDocFonts,
  type DocFonts,
} from "./doc-common.js";

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
  courseDuration?: string;
  registrationNo: string;
  rollNo: string;
  session: string;
  photoUrl?: string;
}

const capWord = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");

const ROW_LABELS: Array<[string, (i: RegistrationCardInput) => string]> = [
  ["Name of the student", (i) => i.studentName],
  ["Father's Name", (i) => i.fatherName],
  ["Mother's Name", (i) => i.motherName],
  ["Gender", (i) => capWord(i.gender)],
  ["Name of the institute", (i) => i.instituteName],
  ["Post Office", (i) => i.postOffice],
  ["Upazila/Thana", (i) => i.upazilla],
  ["District", (i) => i.district],
  ["Course Name", (i) => i.courseTitle],
  ["Course Duration", (i) => i.courseDuration ?? ""],
  ["Registration Number", (i) => i.registrationNo],
  ["Roll No", (i) => i.rollNo],
  ["Session", (i) => i.session],
];
const ROW_Y = [302.69, 331.68, 360.68, 389.67, 418.66, 447.66, 476.65, 505.65, 534.64, 563.63, 592.63, 621.62, 650.55];

const LABEL_X = 62.1;
const COLON_X = 205.11;
const VALUE_X = 220.11;
// The first row sits beside the photo/QR column (kept narrow); every row below
// it can run the full width to the inner border.
const VALUE_MAX_TOP = 478;
const VALUE_MAX_FULL = 558;
const ROW_SIZE = 14;

/** Draws a value, shrinking the font if it would overflow the available width. */
function drawValue(doc: PDFKit.PDFDocument, font: string, str: string, x: number, y: number, maxW: number): void {
  let size = ROW_SIZE;
  doc.font(font).fontSize(size);
  const w = doc.widthOfString(str);
  if (w > maxW) size = Math.max(8, (size * maxW) / w);
  drawToken(doc, font, { x, y, size, str: str || "—", color: DOC_INK });
}

function drawBody(doc: PDFKit.PDFDocument, fonts: DocFonts, input: RegistrationCardInput): void {
  ROW_LABELS.forEach(([label, get], idx) => {
    const y = ROW_Y[idx];
    const rightEdge = y > 310 ? VALUE_MAX_FULL : VALUE_MAX_TOP;
    drawToken(doc, fonts.calibriBold, { x: LABEL_X, y, size: ROW_SIZE, str: label, color: DOC_INK });
    drawToken(doc, fonts.calibriBold, { x: COLON_X, y, size: ROW_SIZE, str: ":", color: DOC_INK });
    drawValue(doc, fonts.calibriBold, get(input), VALUE_X, y, rightEdge - VALUE_X);
  });
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
      const fonts = registerDocFonts(doc);

      drawDocFrame(doc, "registration-border.png");

      // Header: title, govt line, centred logo.
      drawDocHeader(
        doc,
        fonts,
        { x: 35.81, y: 74.67, size: 45.586, hScale: 10.258 / 45.586, refWidth: 524.08 },
        { x: 38.52, y: 93.12, size: 13.5, hScale: 22.86 / 13.5, refWidth: 520.87 },
      );
      drawDocLogo(doc, W / 2 - 47, 99, 94);

      // Title badge (green pill), centred on the page.
      drawBadge(doc, fonts.regBadge, {
        text: "Registration Card",
        size: 19.5,
        hScale: 20.107 / 20.6,
        centerX: W / 2,
        top: 186,
        height: 26,
        padX: 15,
        radius: 13,
      });

      // Photo (borderless) with the verification QR centred beneath it (top right).
      const colCenterX = 526;
      const photoW = 80;
      const photoH = 82;
      const photoX = colCenterX - photoW / 2;
      const photoY = 150;
      if (photo) {
        try {
          doc.image(photo, photoX, photoY, { fit: [photoW, photoH], align: "center", valign: "center" });
        } catch {
          /* ignore bad photo */
        }
      } else {
        doc.lineWidth(0.8).strokeColor("#C9C9C9").rect(photoX, photoY, photoW, photoH).stroke();
      }
      const qrSize = 66;
      doc.image(qr, colCenterX - qrSize / 2, photoY + photoH + 6, { width: qrSize, height: qrSize });

      // Serial line.
      drawToken(doc, fonts.arial, { x: 56.67, y: 253, size: 13, str: `Serial No: ${input.serialNo}`, color: DOC_INK });

      drawBody(doc, fonts, input);

      // Signature lines + captions.
      doc.lineWidth(1).strokeColor(DOC_INK);
      const sigY = 772;
      doc.moveTo(60, sigY).lineTo(180, sigY).stroke();
      doc.moveTo(205, sigY).lineTo(385, sigY).stroke();
      doc.moveTo(445, sigY).lineTo(562, sigY).stroke();
      const cap = (x: number, y: number, str: string) =>
        drawToken(doc, fonts.calibriBold, { x, y, size: 10, hScale: 11.613 / 14, str, color: DOC_INK });
      cap(71.43, 786, "Signature of Student");
      cap(215.29, 786, "Signature of Head of the institute");
      cap(452.16, 786, "Deputy Secretary");
      cap(462.44, 800, "(Registration)");

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
