// Applies a large diagonal "DRAFT — PENDING ATTORNEY REVIEW" watermark to
// every page of a PDF. Used on every document in the case packet until the
// attorney reviews and releases it.
//
// The watermark is drawn semi-transparently across the middle of each page
// so the document is still readable but obviously not final.

import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export async function applyDraftWatermark(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const text = "DRAFT — PENDING ATTORNEY REVIEW";

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    // Size text so it spans about 80% of the page's diagonal.
    const targetWidth = Math.hypot(width, height) * 0.72;
    let size = 60;
    let textWidth = font.widthOfTextAtSize(text, size);
    if (textWidth > 0) {
      size = Math.max(28, Math.min(96, (targetWidth / textWidth) * size));
      textWidth = font.widthOfTextAtSize(text, size);
    }
    const textHeight = font.heightAtSize(size);

    // Rotate around center; offset so the string is centered.
    const angle = Math.atan2(height, width); // radians
    const cx = width / 2;
    const cy = height / 2;
    const dx = -(textWidth / 2) * Math.cos(angle) + (textHeight / 2) * Math.sin(angle);
    const dy = -(textWidth / 2) * Math.sin(angle) - (textHeight / 2) * Math.cos(angle);

    page.drawText(text, {
      x: cx + dx,
      y: cy + dy,
      size,
      font,
      color: rgb(0.85, 0.1, 0.1),
      opacity: 0.18,
      rotate: degrees((angle * 180) / Math.PI),
    });

    // Also add a small red header banner so scans/prints show the warning even if
    // opacity is stripped.
    const bannerSize = 9;
    const banner = "DRAFT — PENDING ATTORNEY REVIEW — NOT FOR FILING";
    const bw = font.widthOfTextAtSize(banner, bannerSize);
    page.drawText(banner, {
      x: (width - bw) / 2,
      y: height - 14,
      size: bannerSize,
      font,
      color: rgb(0.75, 0, 0),
      opacity: 0.9,
    });
  }

  return await doc.save();
}
