import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { StudioVideoBlueprint } from '@/lib/server/mediaProvider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ExportBody = {
  topic?: string;
  preset?: string;
  tone?: string;
  language?: 'pl' | 'en' | 'es';
  providerUsed?: string;
  blueprint?: StudioVideoBlueprint;
};

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function drawPageHeader(page: PDFPage, title: string, subtitle: string, fontBold: PDFFont, font: PDFFont) {
  const accent = rgb(0.0, 0.62, 0.84);
  const textColor = rgb(0.12, 0.14, 0.18);
  page.drawRectangle({ x: 0, y: 760, width: 595.28, height: 81.89, color: rgb(0.93, 0.98, 1) });
  page.drawText(title, { x: 40, y: 803, size: 24, font: fontBold, color: accent });
  page.drawText(subtitle, { x: 40, y: 778, size: 13, font, color: textColor });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as ExportBody));
  const blueprint = body.blueprint;

  if (!blueprint || !Array.isArray(blueprint.scenes) || !blueprint.scenes.length) {
    return NextResponse.json({ error: 'Video blueprint is required for PDF export.' }, { status: 400 });
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0.12, 0.14, 0.18);
  const muted = rgb(0.38, 0.42, 0.48);

  let page = pdf.addPage([595.28, 841.89]);
  let y = 735;

  const ensureSpace = (requiredY: number) => {
    if (y >= requiredY) return;
    page = pdf.addPage([595.28, 841.89]);
    drawPageHeader(page, 'UFinf Premium Video Brief', body.topic || blueprint.headline || 'Untitled Brief', fontBold, font);
    y = 735;
  };

  const drawLines = (lines: string[], size = 11, indent = 40, color = textColor, lineGap = 14) => {
    for (const line of lines) {
      ensureSpace(90);
      page.drawText(line, { x: indent, y, size, font, color });
      y -= lineGap;
    }
  };

  const drawSection = (title: string, text: string) => {
    ensureSpace(120);
    page.drawText(title, { x: 40, y, size: 13, font: fontBold, color: textColor });
    y -= 18;
    drawLines(wrapText(text, 82));
    y -= 8;
  };

  drawPageHeader(page, 'UFinf Premium Video Brief', body.topic || blueprint.headline || 'Untitled Brief', fontBold, font);

  const metaLines = [
    `Preset: ${body.preset || 'n/a'}`,
    `Tone: ${body.tone || 'n/a'}`,
    `Language: ${body.language || 'pl'}`,
    `Provider: ${body.providerUsed || 'studio'}`,
    `Generated: ${new Date().toISOString()}`,
  ];

  for (const line of metaLines) {
    page.drawText(line, { x: 40, y, size: 10, font, color: muted });
    y -= 14;
  }
  y -= 6;

  drawSection('Headline', blueprint.headline || '');
  drawSection('Hook', blueprint.hook || '');
  drawSection('CTA', blueprint.cta || '');
  drawSection('Soundtrack', blueprint.soundtrack || '');

  ensureSpace(140);
  page.drawText('Scenes', { x: 40, y, size: 13, font: fontBold, color: textColor });
  y -= 18;

  for (const [index, scene] of blueprint.scenes.entries()) {
    ensureSpace(120);
    page.drawText(`${index + 1}. ${scene.title || `Scene ${index + 1}`} (${scene.durationSec || 3}s)`, {
      x: 40,
      y,
      size: 11,
      font: fontBold,
      color: textColor,
    });
    y -= 15;
    drawLines(wrapText(`Visual: ${scene.visual || ''}`, 84), 10, 52, textColor, 13);
    drawLines(wrapText(`Voiceover: ${scene.voiceover || ''}`, 84), 10, 52, textColor, 13);
    drawLines(wrapText(`Caption: ${scene.caption || ''}`, 84), 10, 52, textColor, 13);
    y -= 8;
  }

  if (Array.isArray(blueprint.editNotes) && blueprint.editNotes.length) {
    ensureSpace(120);
    page.drawText('Edit Notes', { x: 40, y, size: 13, font: fontBold, color: textColor });
    y -= 18;
    for (const note of blueprint.editNotes) {
      drawLines(wrapText(`- ${note}`, 84), 10, 40, textColor, 13);
    }
  }

  const bytes = await pdf.save();
  const safeName = (String(body.topic || blueprint.headline || 'video-brief')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')) || 'video-brief';

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
