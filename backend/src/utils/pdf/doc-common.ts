import { loadAsset } from "./shared.js";

/**
 * Shared building blocks for the portrait documents (registration card, admit
 * card, marksheet). Each replicates a vector reference artwork 1:1 — the
 * ornamental border + watermark come from a per-document PNG, and every text
 * run is redrawn with the fonts the artwork uses (subsets extracted from the
 * reference PDFs for fixed wording; Carlito/Arimo — the metric-compatible OFL
 * clones of Calibri/Arial — for dynamic values).
 */
export const DOC_INK = "#2C2C34";
export const DOC_GREEN = "#144C44";
export const DOC_WHITE = "#FFFFFF";

const DOC_FONTS = {
  latin: { file: "fonts/latin-wide.otf", fallback: "Helvetica-Bold" },
  birgine: { file: "fonts/birgine.otf", fallback: "Times-Roman" },
  calibri: { file: "fonts/doc-calibri.ttf", fallback: "Helvetica" },
  calibriBold: { file: "fonts/doc-calibri-bold.ttf", fallback: "Helvetica-Bold" },
  arial: { file: "fonts/doc-arial.ttf", fallback: "Helvetica" },
  arialBold: { file: "fonts/doc-arial-bold.ttf", fallback: "Helvetica-Bold" },
  regBadge: { file: "fonts/doc-reg-badge.ttf", fallback: "Helvetica-Bold" },
  resBadge: { file: "fonts/doc-res-badge.ttf", fallback: "Helvetica-Bold" },
  resFinal: { file: "fonts/doc-res-final.ttf", fallback: "Helvetica-Bold" },
  calisto: { file: "fonts/doc-calisto.ttf", fallback: "Times-Roman" },
  californian: { file: "fonts/doc-californian-bold.ttf", fallback: "Times-Bold" },
  narrow: { file: "fonts/doc-arial-narrow.ttf", fallback: "Helvetica" },
} as const;

export type DocFontKey = keyof typeof DOC_FONTS;
export type DocFonts = Record<DocFontKey, string>;

export function registerDocFonts(doc: PDFKit.PDFDocument): DocFonts {
  const out = {} as DocFonts;
  for (const key of Object.keys(DOC_FONTS) as DocFontKey[]) {
    const spec = DOC_FONTS[key];
    const buf = loadAsset(spec.file);
    if (buf) {
      try {
        doc.registerFont(`doc-${key}`, buf);
        out[key] = `doc-${key}`;
        continue;
      } catch {
        /* fall through to built-in fallback */
      }
    }
    out[key] = spec.fallback;
  }
  return out;
}

export interface RunOpts {
  x: number;
  y: number; // baseline, from top
  size: number; // vertical font size (sy)
  hScale?: number; // horizontal squeeze/stretch (sx / sy)
  str: string;
  color?: string;
}

/** Draws a single space-free token at its baseline with optional anamorphic scale. */
export function drawToken(doc: PDFKit.PDFDocument, font: string, o: RunOpts): void {
  doc.font(font).fontSize(o.size).fillColor(o.color ?? DOC_INK);
  const h = o.hScale ?? 1;
  if (Math.abs(h - 1) < 0.001) {
    doc.text(o.str, o.x, o.y, { baseline: "alphabetic", lineBreak: false });
    return;
  }
  doc.save();
  doc.scale(h, 1, { origin: [o.x, o.y] });
  doc.text(o.str, o.x, o.y, { baseline: "alphabetic", lineBreak: false });
  doc.restore();
}

/**
 * Draws a multi-word run, placing each word individually and calibrating the
 * inter-word gap so the total width matches the artwork (`refWidth`). The
 * display-font subsets carry no space glyph, so spaces are never emitted.
 */
export function drawRun(
  doc: PDFKit.PDFDocument,
  font: string,
  o: RunOpts & { refWidth?: number },
): void {
  const words = o.str.split(" ").filter((w) => w.length > 0);
  const h = o.hScale ?? 1;
  doc.font(font).fontSize(o.size);
  const widths = words.map((w) => doc.widthOfString(w) * h);
  const total = widths.reduce((a, b) => a + b, 0);
  const gaps = words.length - 1;
  const spaceW = doc.widthOfString(" ") * h || doc.widthOfString("n") * h * 0.5;
  const refW = o.refWidth ?? total + gaps * spaceW;
  const gapW = gaps > 0 ? Math.max(0, (refW - total) / gaps) : 0;
  let x = o.x;
  words.forEach((w, i) => {
    drawToken(doc, font, { ...o, x, str: w });
    x += widths[i] + gapW;
  });
}

/**
 * Green pill/box title badge: the box auto-sizes to the caption (symmetric
 * horizontal padding) and the caption is centred both horizontally (on
 * `centerX`) and vertically within the box, so it never sits off-centre
 * regardless of the font's metrics.
 */
export function drawBadge(
  doc: PDFKit.PDFDocument,
  font: string,
  o: {
    text: string;
    size: number;
    hScale?: number;
    centerX: number;
    top: number;
    height: number;
    padX?: number;
    radius: number;
    textColor?: string;
  },
): void {
  const hs = o.hScale ?? 1;
  doc.font(font).fontSize(o.size);
  const tw = doc.widthOfString(o.text) * hs;
  const padX = o.padX ?? 16;
  const w = tw + padX * 2;
  const x = o.centerX - w / 2;
  if (o.radius > 0) doc.roundedRect(x, o.top, w, o.height, o.radius).fill(DOC_GREEN);
  else doc.rect(x, o.top, w, o.height).fill(DOC_GREEN);
  // Vertically centre on the cap height (≈0.68·size) within the box.
  const baseline = o.top + o.height / 2 + o.size * 0.34;
  drawToken(doc, font, { x: o.centerX - tw / 2, y: baseline, size: o.size, hScale: hs, str: o.text, color: o.textColor ?? DOC_WHITE });
}

/**
 * White page + ornamental frame (per-document border PNG) + faint centred
 * logo watermark. Content is drawn on top by the caller.
 */
export function drawDocFrame(doc: PDFKit.PDFDocument, borderAsset: string): void {
  const W = doc.page.width;
  const H = doc.page.height;
  doc.rect(0, 0, W, H).fill(DOC_WHITE);

  // Faint logo watermark, centred on the page (the page is the design area —
  // the admit card uses a compact page, so this lands in the card's middle).
  const logo = loadAsset("logo.png");
  if (logo) {
    const wmW = Math.min(270, W * 0.46);
    const wmH = wmW * (2088 / 2461);
    doc.save();
    doc.opacity(0.06);
    try {
      doc.image(logo, (W - wmW) / 2, H / 2 - wmH / 2, { width: wmW, height: wmH });
    } catch {
      /* optional */
    }
    doc.restore();
    doc.opacity(1);
  }

  const border = loadAsset(borderAsset);
  if (border) {
    try {
      doc.image(border, 0, 0, { width: W, height: H });
    } catch {
      /* keep generating without the frame if unreadable */
    }
  }
}

/** Institute logo (new brand artwork), drawn at width `w` keeping aspect ratio. */
export function drawDocLogo(doc: PDFKit.PDFDocument, x: number, y: number, w: number): void {
  const logo = loadAsset("logo.png");
  if (!logo) return;
  try {
    doc.image(logo, x, y, { width: w });
  } catch {
    /* optional */
  }
}

/** The shared header band: Latin Wide title + Birgine govt line. */
export function drawDocHeader(
  doc: PDFKit.PDFDocument,
  fonts: DocFonts,
  title: { x: number; y: number; size: number; hScale: number; refWidth: number },
  govt: { x: number; y: number; size: number; hScale: number; refWidth: number },
): void {
  drawRun(doc, fonts.latin, {
    x: title.x,
    y: title.y,
    size: title.size,
    hScale: title.hScale,
    refWidth: title.refWidth,
    str: "YOUTH CAREER & SKILLS DEVELOPMENT TRAINING",
    color: DOC_INK,
  });
  drawRun(doc, fonts.birgine, {
    x: govt.x,
    y: govt.y,
    size: govt.size,
    hScale: govt.hScale,
    refWidth: govt.refWidth,
    str: "Approved By Govt. of The People's Republic of Bangladesh",
    color: DOC_INK,
  });
}
