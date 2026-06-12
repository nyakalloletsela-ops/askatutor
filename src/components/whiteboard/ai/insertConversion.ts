import {
  AssetRecordType,
  createShapeId,
  toRichText,
  type Editor,
  type TLAssetId,
} from "tldraw";

/**
 * Parse the AI response into ordered blocks:
 *  - svg  : an inline <svg>…</svg> diagram (visual, kept as a diagram)
 *  - math : a $$…$$ LaTeX equation (editable LaTeX text)
 *  - text : plain text paragraph
 *
 * The AI prompt already enforces these three element types.
 */
export type ConvertedBlock =
  | { kind: "svg"; svg: string; w: number; h: number }
  | { kind: "math"; latex: string }
  | { kind: "text"; text: string };

const SVG_RE = /<svg[\s\S]*?<\/svg>/gi;
const MATH_RE = /\$\$([\s\S]+?)\$\$/g;

function readSvgDims(svg: string): { w: number; h: number } {
  const vb = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
  if (vb) {
    const p = vb[1].trim().split(/\s+/).map(Number);
    if (p.length === 4 && p[2] > 0 && p[3] > 0) return { w: p[2], h: p[3] };
  }
  const w = svg.match(/\swidth\s*=\s*"(\d+(?:\.\d+)?)/i);
  const h = svg.match(/\sheight\s*=\s*"(\d+(?:\.\d+)?)/i);
  return { w: w ? +w[1] : 320, h: h ? +h[1] : 240 };
}

export function parseConversion(raw: string): ConvertedBlock[] {
  const out: ConvertedBlock[] = [];

  // First split out <svg> blocks – they must remain intact.
  const svgMatches: { idx: number; len: number; svg: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = SVG_RE.exec(raw)) !== null) {
    svgMatches.push({ idx: m.index, len: m[0].length, svg: m[0] });
  }

  let cursor = 0;
  const pushTextual = (chunk: string) => {
    let last = 0;
    let mm: RegExpExecArray | null;
    const re = new RegExp(MATH_RE.source, "g");
    while ((mm = re.exec(chunk)) !== null) {
      const before = chunk.slice(last, mm.index).trim();
      if (before) splitParagraphs(before).forEach((t) => out.push({ kind: "text", text: t }));
      out.push({ kind: "math", latex: mm[1].trim() });
      last = mm.index + mm[0].length;
    }
    const tail = chunk.slice(last).trim();
    if (tail) splitParagraphs(tail).forEach((t) => out.push({ kind: "text", text: t }));
  };

  for (const s of svgMatches) {
    if (s.idx > cursor) pushTextual(raw.slice(cursor, s.idx));
    const { w, h } = readSvgDims(s.svg);
    out.push({ kind: "svg", svg: s.svg, w, h });
    cursor = s.idx + s.len;
  }
  if (cursor < raw.length) pushTextual(raw.slice(cursor));

  return out;
}

function splitParagraphs(s: string): string[] {
  return s
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function svgToDataUrl(svg: string): string {
  // Ensure xmlns for stand-alone <img>/asset use.
  const fixed = /xmlns=/.test(svg)
    ? svg
    : svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  // Use base64 to avoid URL-encoding pitfalls with non-ASCII.
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(fixed, "utf8").toString("base64")
      : btoa(unescape(encodeURIComponent(fixed)));
  return `data:image/svg+xml;base64,${b64}`;
}

/**
 * Insert parsed blocks as independent, draggable, resizable tldraw shapes
 * placed in a column starting at the current viewport centre.
 */
export function insertBlocksIntoEditor(editor: Editor, blocks: ConvertedBlock[]) {
  if (blocks.length === 0) return;

  const vp = editor.getViewportPageBounds();
  let x = vp.minX + 40;
  let y = vp.minY + 40;
  const colWidth = Math.min(560, vp.width - 80);
  const gap = 24;

  const assetsToCreate: Parameters<Editor["createAssets"]>[0] = [];
  const shapesToCreate: Parameters<Editor["createShapes"]>[0] = [];

  for (const b of blocks) {
    if (b.kind === "svg") {
      const scale = Math.min(1, colWidth / b.w);
      const w = Math.round(b.w * scale);
      const h = Math.round(b.h * scale);
      const assetId: TLAssetId = AssetRecordType.createId();
      assetsToCreate.push({
        id: assetId,
        type: "image",
        typeName: "asset",
        props: {
          name: "diagram.svg",
          src: svgToDataUrl(b.svg),
          w,
          h,
          mimeType: "image/svg+xml",
          isAnimated: false,
        },
        meta: {},
      });
      shapesToCreate.push({
        id: createShapeId(),
        type: "image",
        x,
        y,
        props: { assetId, w, h },
      });
      y += h + gap;
    } else if (b.kind === "math") {
      // Editable text shape preserving LaTeX source so the user can keep editing.
      const text = `$$${b.latex}$$`;
      const h = Math.max(40, 28 * Math.ceil(text.length / 60));
      shapesToCreate.push({
        id: createShapeId(),
        type: "text",
        x,
        y,
        props: {
          richText: toRichText(text),
          w: colWidth,
          autoSize: false,
          color: "blue",
          size: "m",
        },
      });
      y += h + gap;
    } else {
      const lines = b.text.split("\n").length;
      const h = Math.max(32, 22 * lines);
      shapesToCreate.push({
        id: createShapeId(),
        type: "text",
        x,
        y,
        props: {
          richText: toRichText(b.text),
          w: colWidth,
          autoSize: false,
          size: "m",
        },
      });
      y += h + gap;
    }
  }

  editor.run(() => {
    if (assetsToCreate.length) editor.createAssets(assetsToCreate);
    editor.createShapes(shapesToCreate);
    // Select the new shapes so the user can immediately drag/move them.
    editor.setSelectedShapes(shapesToCreate.map((s) => s.id!));
    editor.zoomToSelection({ animation: { duration: 250 } });
  });
}
