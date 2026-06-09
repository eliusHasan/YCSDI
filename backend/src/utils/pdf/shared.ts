import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { v2 as cloudinary } from "cloudinary";
import QRCode from "qrcode";

/** YCSDI brand identity used across every generated document. */
export const BRAND = {
  name: "YOUTH CAREER & SKILL DEVELOPMENT INSTITUTE",
  shortName: "YCSDI",
  govtLine: "Approved By Govt. of the People's Republic of Bangladesh",
  regLine: "GOVT. REGISTERED ACADEMY · REG NO 158451",
  website: "www.ycsdi.com.bd",
} as const;

/** Colour palette mirroring the reference documents (navy + gold). */
export const COLORS = {
  navy: "#1B3C53",
  navyDeep: "#13293D",
  gold: "#E2B26A",
  goldDark: "#C9974A",
  ink: "#1B3C53",
  muted: "#5A6B7A",
  line: "#C9D3DC",
  white: "#FFFFFF",
} as const;

/**
 * Where swappable brand assets live. Drop `logo.png`, `seal.png`,
 * `signature.png` (and optionally `signature-2.png`) into this folder to
 * replace the text/line placeholders. Overridable with DOCUMENT_ASSETS_DIR.
 */
const ASSETS_DIR = process.env.DOCUMENT_ASSETS_DIR ?? resolve(process.cwd(), "assets/documents");

const assetCache = new Map<string, Buffer | null>();

/**
 * Loads an optional brand asset. Only successful reads are cached, so an asset
 * dropped in after the server started is picked up on the next render without a
 * restart (caching a null would otherwise mask a later-added file).
 */
export function loadAsset(fileName: string): Buffer | null {
  const cached = assetCache.get(fileName);
  if (cached) return cached;
  const full = resolve(ASSETS_DIR, fileName);
  const buf = existsSync(full) ? readFileSync(full) : null;
  if (buf) assetCache.set(fileName, buf);
  return buf;
}

/** Base URL of the public web app, used to build QR verification links. */
export function publicWebUrl(): string {
  const fromEnv = process.env.PUBLIC_WEB_URL ?? process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  return (fromEnv || "http://localhost:5173").replace(/\/$/, "");
}

export function verifyUrl(serialNo: string): string {
  return `${publicWebUrl()}/verify/${serialNo}`;
}

/** Renders a QR code (encoding the verify URL) to a PNG buffer. */
export async function qrBuffer(serialNo: string): Promise<Buffer> {
  return QRCode.toBuffer(verifyUrl(serialNo), {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
    color: { dark: COLORS.navyDeep, light: "#FFFFFF" },
  });
}

/** Fetches a remote image (e.g. the student's Cloudinary photo) as a buffer. */
export async function fetchImageBuffer(url?: string): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch {
    return null;
  }
}

/** Uploads a generated PDF buffer to Cloudinary and returns its secure URL. */
export function uploadPdf(buffer: Buffer, folder: string, publicId: string): Promise<string> {
  return new Promise((res, rej) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: publicId,
        format: "pdf",
        type: "upload",
        access_mode: "public",
        overwrite: true,
      },
      (error, result) => {
        if (error) return rej(error);
        if (!result?.secure_url) return rej(new Error("Cloudinary returned no secure_url"));
        res(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Draws the double border frame seen on every reference document. */
export function drawFrame(doc: PDFKit.PDFDocument): void {
  const W = doc.page.width;
  const H = doc.page.height;
  doc.rect(0, 0, W, H).fill(COLORS.white);
  doc.lineWidth(4).strokeColor(COLORS.navyDeep).rect(18, 18, W - 36, H - 36).stroke();
  doc.lineWidth(1).strokeColor(COLORS.navyDeep).rect(26, 26, W - 52, H - 52).stroke();
}

/** Faint centred seal/text watermark. Uses seal.png when available, else text. */
export function drawWatermark(doc: PDFKit.PDFDocument, text: string): void {
  const W = doc.page.width;
  const H = doc.page.height;
  const seal = loadAsset("seal.png");
  doc.save();
  doc.opacity(0.06);
  if (seal) {
    const size = Math.min(W, H) * 0.55;
    try {
      doc.image(seal, (W - size) / 2, (H - size) / 2, { width: size, height: size });
    } catch {
      /* ignore bad asset */
    }
  } else {
    doc.fontSize(60).fillColor(COLORS.navy).font("Helvetica-Bold");
    doc.text(text, 0, H / 2 - 40, { align: "center", width: W });
  }
  doc.restore();
  doc.opacity(1);
}

/** Draws the circular logo (logo.png) or a lettered placeholder badge at x,y. */
export function drawLogo(doc: PDFKit.PDFDocument, x: number, y: number, size: number): void {
  const logo = loadAsset("logo.png");
  if (logo) {
    try {
      doc.image(logo, x, y, { width: size, height: size });
      return;
    } catch {
      /* fall through to placeholder */
    }
  }
  doc.save();
  doc.lineWidth(2).strokeColor(COLORS.navy).circle(x + size / 2, y + size / 2, size / 2).stroke();
  doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(size * 0.28)
    .text(BRAND.shortName, x, y + size / 2 - size * 0.16, { width: size, align: "center" });
  doc.restore();
}

/**
 * Draws a signature block: signature.png (or a ruled line) above a caption.
 * `assetName` lets a second signatory use a different image.
 */
export function drawSignature(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  caption: string,
  subCaption?: string,
  assetName = "signature.png",
): void {
  const sig = loadAsset(assetName);
  if (sig) {
    try {
      doc.image(sig, x + width / 2 - 35, y - 28, { fit: [70, 26] });
    } catch {
      /* ignore */
    }
  }
  doc.lineWidth(0.8).strokeColor(COLORS.navy).moveTo(x, y).lineTo(x + width, y).stroke();
  doc.fillColor(COLORS.navy).font("Helvetica-Bold").fontSize(8.5)
    .text(caption, x, y + 4, { width, align: "center" });
  if (subCaption) {
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(7)
      .text(subCaption, x, y + 15, { width, align: "center" });
  }
}

/** Draws a navy pill badge with centred white label (e.g. "Registration Card"). */
export function drawBadge(doc: PDFKit.PDFDocument, x: number, y: number, label: string): number {
  doc.font("Helvetica-Bold").fontSize(15);
  const textW = doc.widthOfString(label);
  const padX = 18;
  const padY = 8;
  const w = textW + padX * 2;
  const h = 16 + padY * 2;
  doc.roundedRect(x, y, w, h, 3).fill(COLORS.navy);
  doc.fillColor(COLORS.gold).font("Helvetica-Bold").fontSize(15)
    .text(label, x, y + padY, { width: w, align: "center" });
  return w;
}
