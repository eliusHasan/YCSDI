import { v2 as cloudinary } from "cloudinary";
import PDFDocument from "pdfkit";

export interface CertificatePdfInput {
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  instituteName: string;
  issuedDate: Date;
}

function renderPdfBuffer(input: CertificatePdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      const H = doc.page.height;

      // Background frame
      doc.rect(0, 0, W, H).fill("#FFFFFF");
      doc.lineWidth(6).strokeColor("#1B3C53").rect(28, 28, W - 56, H - 56).stroke();
      doc.lineWidth(1.5).strokeColor("#E2B26A").rect(46, 46, W - 92, H - 92).stroke();

      // Top brand
      doc.fontSize(11).fillColor("#1B3C53").font("Helvetica-Bold")
        .text("YOUTH CAREER & SKILL DEVELOPMENT INSTITUTE", 0, 80, { align: "center", characterSpacing: 4 });

      doc.fontSize(8).fillColor("#E2B26A").font("Helvetica")
        .text("· GOVT. REGISTERED ACADEMY · REG NO 158451 ·", 0, 100, { align: "center", characterSpacing: 3 });

      // Title
      doc.fontSize(46).fillColor("#1B3C53").font("Helvetica-Bold")
        .text("Certificate", 0, 150, { align: "center" });

      doc.fontSize(16).fillColor("#1B3C53").font("Helvetica")
        .text("of Completion", 0, 210, { align: "center", characterSpacing: 4 });

      // Recipient
      doc.fontSize(11).fillColor("#5A6B7A").font("Helvetica")
        .text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 0, 260, { align: "center", characterSpacing: 3 });

      doc.fontSize(36).fillColor("#1B3C53").font("Helvetica-BoldOblique")
        .text(input.studentName, 0, 290, { align: "center" });

      // Underline under name
      const nameWidth = Math.max(280, Math.min(W - 200, doc.widthOfString(input.studentName) + 40));
      const ux = (W - nameWidth) / 2;
      const uy = 350;
      doc.lineWidth(1).strokeColor("#E2B26A").moveTo(ux, uy).lineTo(ux + nameWidth, uy).stroke();

      // Body
      doc.fontSize(12).fillColor("#1B3C53").font("Helvetica")
        .text("for successfully completing the course", 0, 372, { align: "center" });

      doc.fontSize(22).fillColor("#1B3C53").font("Helvetica-Bold")
        .text(input.courseTitle, 60, 398, { width: W - 120, align: "center" });

      doc.fontSize(10).fillColor("#5A6B7A").font("Helvetica")
        .text(`at ${input.instituteName}`, 0, 440, { align: "center" });

      // Footer
      const footerY = H - 110;
      const dateStr = input.issuedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.fontSize(9).fillColor("#5A6B7A").font("Helvetica-Bold")
        .text("ISSUED ON", 100, footerY, { width: 200, align: "left", characterSpacing: 2 });
      doc.fontSize(12).fillColor("#1B3C53").font("Helvetica")
        .text(dateStr, 100, footerY + 14, { width: 200, align: "left" });

      doc.fontSize(9).fillColor("#5A6B7A").font("Helvetica-Bold")
        .text("CERTIFICATE NO.", W - 300, footerY, { width: 200, align: "right", characterSpacing: 2 });
      doc.fontSize(12).fillColor("#1B3C53").font("Helvetica")
        .text(input.certificateNumber, W - 300, footerY + 14, { width: 200, align: "right" });

      // Signature line
      doc.lineWidth(0.8).strokeColor("#1B3C53")
        .moveTo(W / 2 - 110, footerY + 4).lineTo(W / 2 + 110, footerY + 4).stroke();
      doc.fontSize(8).fillColor("#5A6B7A").font("Helvetica-Bold")
        .text("AUTHORIZED SIGNATURE", W / 2 - 110, footerY + 12, { width: 220, align: "center", characterSpacing: 2 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function uploadPdfToCloudinary(buffer: Buffer, certificateNumber: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "ycsdi/certificates",
        public_id: certificateNumber,
        format: "pdf",
        type: "upload",
        access_mode: "public",
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error("Cloudinary returned no secure_url"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export async function generateAndUploadCertificate(input: CertificatePdfInput): Promise<string> {
  const buffer = await renderPdfBuffer(input);
  return uploadPdfToCloudinary(buffer, input.certificateNumber);
}
