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
const LATEX_HINT_RE = /\\(?:int|iint|iiint|oint|frac|sqrt|sum|prod|lim|begin|partial|nabla|vec|sin|cos|tan|log|ln|alpha|beta|gamma|theta|pi|infty|leq|geq|neq|rightarrow)|[∫∑∏√∞≈≤≥≠±]/;

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
  const cleanRaw = raw
    .replace(/```(?:latex|tex|math|svg)?/gi, "")
    .replace(/```/g, "")
    .trim();

  // First split out <svg> blocks – they must remain intact.
  const svgMatches: { idx: number; len: number; svg: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = SVG_RE.exec(cleanRaw)) !== null) {
    svgMatches.push({ idx: m.index, len: m[0].length, svg: m[0] });
  }

  let cursor = 0;
  const pushTextual = (chunk: string) => {
    let last = 0;
    let mm: RegExpExecArray | null;
    const re = new RegExp(MATH_RE.source, "g");
    while ((mm = re.exec(chunk)) !== null) {
      const before = chunk.slice(last, mm.index).trim();
      if (before) splitParagraphs(before).forEach((t) => out.push(classifyTextualBlock(t)));
      out.push({ kind: "math", latex: normalizeLatex(mm[1].trim()) });
      last = mm.index + mm[0].length;
    }
    const tail = chunk.slice(last).trim();
    if (tail) splitParagraphs(tail).forEach((t) => out.push(classifyTextualBlock(t)));
  };

  for (const s of svgMatches) {
    if (s.idx > cursor) pushTextual(cleanRaw.slice(cursor, s.idx));
    const { w, h } = readSvgDims(s.svg);
    out.push({ kind: "svg", svg: s.svg, w, h });
    cursor = s.idx + s.len;
  }
  if (cursor < cleanRaw.length) pushTextual(cleanRaw.slice(cursor));

  return out;
}

function classifyTextualBlock(text: string): ConvertedBlock {
  const cleaned = text.replace(/^\s*(?:LaTeX|Math|Equation|Formula)\s*:\s*/i, "").trim();
  const singleLine = !cleaned.includes("\n");
  const looksLikeMath = LATEX_HINT_RE.test(cleaned) || (/=/.test(cleaned) && /[0-9a-zA-Z)][+\-*/^_=]/.test(cleaned));
  if (singleLine && looksLikeMath) return { kind: "math", latex: normalizeLatex(cleaned) };
  return { kind: "text", text: cleaned };
}

function normalizeLatex(input: string): string {
  return input
    .replace(/^\$\$|\$\$$/g, "")
    .replace(/∫/g, "\\int ")
    .replace(/∑/g, "\\sum ")
    .replace(/∏/g, "\\prod ")
    .replace(/√\s*\(?([^\n()]+)\)?/g, "\\sqrt{$1}")
    .replace(/∞/g, "\\infty")
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/≈/g, "\\approx")
    .replace(/±/g, "\\pm")
    .replace(/\s+d([a-zA-Z])\b/g, "\\,d$1")
    .trim();
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
      // Render LaTeX → SVG via CodeCogs so the equation is shown as typeset math,
      // not source code. The original LaTeX is preserved in meta.latex so it can
      // be re-edited later.
      const url = `https://latex.codecogs.com/svg.image?\\dpi{150}\\bg{white}${encodeURIComponent(b.latex)}`;
      // Rough size estimate from formula length (CodeCogs returns variable dims).
      const w = Math.min(colWidth, Math.max(140, Math.round(b.latex.length * 12)));
      const h = Math.max(48, Math.round(w * 0.22));
      const assetId: TLAssetId = AssetRecordType.createId();
      assetsToCreate.push({
        id: assetId,
        type: "image",
        typeName: "asset",
        props: {
          name: "equation.svg",
          src: url,
          w,
          h,
          mimeType: "image/svg+xml",
          isAnimated: false,
        },
        meta: { latex: b.latex },
      });
      shapesToCreate.push({
        id: createShapeId(),
        type: "image",
        x,
        y,
        props: { assetId, w, h },
        meta: { latex: b.latex },
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
