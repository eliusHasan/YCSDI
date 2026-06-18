import PDFDocument from "pdfkit";
import { fetchImageBuffer, formatDate, loadAsset, uploadPdf } from "./shared.js";
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
  const ys = [190, 214, 238, 262, 286, 310, 334];
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
      // A4 sheet; the admit card design fills the top (y0–417) and the rest of
      // the page is left blank, matching the reference border (which runs y7–y410).
      const CARD_H = 417;
      const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 0 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const fonts = registerDocFonts(doc);
      drawDocFrame(doc, "admit-border.png", CARD_H);

      // Header: govt line, title, and a logo vertically centred on the title.
      drawDocHeader(
        doc,
        fonts,
        { x: 105.72, y: 82.69, size: 32.951, hScale: 8.949 / 32.951, refWidth: 457.2 },
        { x: 107.46, y: 51.47, size: 13.5, hScale: 19.825 / 13.5, refWidth: 451.72 },
      );
      drawDocLogo(doc, 36, 40, 56);

      drawBadge(doc, fonts.calibriBold, {
        text: "Admit Card",
        size: 23.071,
        hScale: 26.064 / 23.071,
        centerX: doc.page.width / 2,
        top: 108,
        height: 29,
        padX: 18,
        radius: 4,
      });

      // Serial No (the student's registration serial, shared across their documents).
      drawToken(doc, fonts.arial, { x: 38.5, y: 160, size: 11, str: `Serial No: ${input.serialNo}`, color: DOC_INK });

      drawLeftRows(doc, fonts, input);

      // Right column: photo (borderless, centred over the Roll/Reg boxes), then
      // the Roll/Reg/Sex fields.
      const boxCenterX = 481.5 + 69.5 / 2;
      const photoW = 74;
      const photoH = 66;
      const photoX = boxCenterX - photoW / 2;
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

      const rightLabel = (label: string, y: number) =>
        drawToken(doc, fonts.calibriBold, { x: 439.08, y, size: ROW_SIZE, str: label, color: DOC_INK });
      rightLabel("Roll No", 238);
      drawToken(doc, fonts.calibriBold, { x: 475.08, y: 238, size: ROW_SIZE, str: ":", color: DOC_INK });
      rightLabel("Reg. No :", 262);
      rightLabel("Sex", 286);
      drawToken(doc, fonts.calibriBold, { x: 475.08, y: 286, size: ROW_SIZE, str: ":", color: DOC_INK });

      // Roll/Reg value boxes.
      doc.lineWidth(1).strokeColor(DOC_INK);
      doc.rect(481.5, 228, 69.5, 15.5).stroke();
      doc.rect(481.5, 252, 69.5, 15.5).stroke();
      drawValue(doc, fonts.calibriBold, input.rollNo, 486, 239.5, 60);
      drawValue(doc, fonts.calibriBold, input.registrationNo, 486, 263.5, 60);
      const sex = input.sex ? input.sex.charAt(0).toUpperCase() + input.sex.slice(1).toLowerCase() : "";
      drawValue(doc, fonts.calibriBold, sex, 481, 286, 90);

      // Directions (Arial Narrow).
      const dir = (str: string, y: number) =>
        drawToken(doc, fonts.narrow, { x: 42.49, y, size: 6, hScale: 7.386 / 6, str, color: DOC_INK });
      dir("Directions:", 363.4);
      dir("1. The examinee must bring the Registration Card along with the Admit Card to the examination hall.", 371.4);
      dir("2. The examinee must sign the attendance sheet; otherwise, the examinee will be considered absent.", 379.4);

      // Controller (examiner) signature above the right rule.
      const examinerSign = loadAsset("examiner-sign.png");
      if (examinerSign) {
        try {
          const sw = 92;
          const sh = sw * (748 / 1572);
          doc.image(examinerSign, (445 + 574) / 2 - sw / 2, 370 - sh - 1, { width: sw });
        } catch {
          /* optional */
        }
      }
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
  return uploadPdf(buffer, "ycsdi/admit-cards", `admit_card_${input.serialNo}`);
}
