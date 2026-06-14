import PDFDocument from "pdfkit";
import { fetchImageBuffer, formatDate, uploadPdf } from "./shared.js";
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

const LABEL_X = 38.5;
const COLON_X = 130;
const VALUE_X = 143;
const VALUE_MAX = 430;
const ROW_SIZE = 10;

function drawValue(doc: PDFKit.PDFDocument, font: string, str: string, x: number, y: number, maxW: number): void {
  let size = ROW_SIZE;
  doc.font(font).fontSize(size);
  const w = doc.widthOfString(str);
  if (w > maxW) size = Math.max(6, (size * maxW) / w);
  drawToken(doc, font, { x, y, size, str: str || "—", color: DOC_INK });
}

function drawLeftRows(doc: PDFKit.PDFDocument, fonts: DocFonts, input: AdmitCardInput): void {
  const rows: Array<[string, string]> = [
    ["Name of the Institute", input.instituteName],
    ["Name of the Student", input.studentName],
    ["Father's Name", input.fatherName],
    ["Mother's Name", input.motherName],
    ["Date of Birth", formatDate(input.dateOfBirth)],
    ["Session", input.session],
    ["Subject Name", input.subjectName],
  ];
  const ys = [174, 194, 214, 234, 254, 274, 294];
  rows.forEach(([label, value], i) => {
    const y = ys[i];
    drawToken(doc, fonts.calibriBold, { x: LABEL_X, y, size: ROW_SIZE, str: label, color: DOC_INK });
    drawToken(doc, fonts.calibriBold, { x: COLON_X, y, size: ROW_SIZE, str: ":", color: DOC_INK });
    drawValue(doc, fonts.calibriBold, value, VALUE_X, y, VALUE_MAX - VALUE_X);
  });
}

export async function render(input: AdmitCardInput): Promise<Buffer> {
  const photo = await fetchImageBuffer(input.photoUrl);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 0 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const fonts = registerDocFonts(doc);
      drawDocFrame(doc, "admit-border.png");

      // Header: govt line, title, small top-left logo.
      drawDocHeader(
        doc,
        fonts,
        { x: 105.72, y: 82.69, size: 32.951, hScale: 8.949 / 32.951, refWidth: 457.2 },
        { x: 107.46, y: 51.47, size: 13.5, hScale: 19.825 / 13.5, refWidth: 451.72 },
      );
      drawDocLogo(doc, 36, 56, 62);

      drawBadge(doc, fonts.calibriBold, {
        text: "Admit Card",
        size: 23.071,
        hScale: 26.064 / 23.071,
        rect: { x: 226, y: 108, w: 143, h: 29 },
        radius: 4,
        baselineY: 124,
      });

      drawLeftRows(doc, fonts, input);

      // Right column: photo box, Roll/Reg boxes, Sex.
      doc.lineWidth(1).strokeColor(DOC_INK);
      doc.rect(481.5, 150, 69.5, 52).stroke();
      if (photo) {
        try {
          doc.image(photo, 482.5, 151, { fit: [67.5, 50], align: "center", valign: "center" });
        } catch {
          /* ignore */
        }
      }

      const rightLabel = (label: string, y: number) =>
        drawToken(doc, fonts.calibriBold, { x: 439.08, y, size: ROW_SIZE, str: label, color: DOC_INK });
      rightLabel("Roll No", 223.33);
      drawToken(doc, fonts.calibriBold, { x: 475.08, y: 223.33, size: ROW_SIZE, str: ":", color: DOC_INK });
      rightLabel("Reg. No :", 243.33);
      rightLabel("Sex", 263.33);
      drawToken(doc, fonts.calibriBold, { x: 475.08, y: 263.33, size: ROW_SIZE, str: ":", color: DOC_INK });

      // Roll/Reg value boxes.
      doc.lineWidth(1).strokeColor(DOC_INK);
      doc.rect(481.5, 213, 69.5, 15.5).stroke();
      doc.rect(481.5, 233, 69.5, 15.5).stroke();
      drawValue(doc, fonts.calibriBold, input.rollNo, 486, 224.5, 60);
      drawValue(doc, fonts.calibriBold, input.registrationNo, 486, 244.5, 60);
      drawValue(doc, fonts.calibriBold, input.sex, 481, 263.33, 90);

      // Directions (Arial Narrow).
      const dir = (str: string, y: number) =>
        drawToken(doc, fonts.narrow, { x: 42.49, y, size: 6, hScale: 7.386 / 6, str, color: DOC_INK });
      dir("Directions:", 363.4);
      dir("1. The examinee must bring the Registration Card along with the Admit Card to the examination hall.", 371.4);
      dir("2. The examinee must sign the attendance sheet; otherwise, the examinee will be considered absent.", 379.4);

      // Controller signature (right).
      doc.lineWidth(1).strokeColor(DOC_INK).moveTo(445, 370).lineTo(574, 370).stroke();
      drawToken(doc, fonts.narrow, { x: 457.49, y: 380.71, size: 7.125, hScale: 8.77 / 7.125, str: "Controller of Examinations", color: DOC_INK });

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
