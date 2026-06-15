import { type Shape, nextId, tick } from "../canvas/engine";

export type ConvertedBlock =
  | { kind: "svg"; svg: string; w: number; h: number }
  | { kind: "math"; latex: string }
  | { kind: "text"; text: string };

const SVG_RE = /<svg[\s\S]*?<\/svg>/gi;
const MATH_RE = /\$\$([\s\S]+?)\$\$/g;
const LATEX_HINT_RE = /\\(?:int|iint|iiint|oint|frac|sqrt|sum|prod|lim|begin|partial|nabla|vec|sin|cos|tan|log|ln|alpha|beta|gamma|theta|pi|infty|leq|geq|neq|rightarrow)|\b(?:int|iint|iiint|sqrt|sum|prod|lim|frac|partial)(?=_|\b)|[∫∬∭∮∑∏√∞≈≤≥≠±∂∇πθΔ]/i;

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
    .replace(/\\\[/g, () => "$$")
    .replace(/\\\]/g, () => "$$")
    .replace(/```(?:latex|tex|math|svg)?/gi, "")
    .replace(/```/g, "")
    .trim();

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
  if (cleaned.includes("\n")) {
    const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every((line) => looksLikeMathLine(line))) {
      return { kind: "math", latex: lines.map(normalizeLatex).join("\\\\") };
    }
  }
  const singleLine = !cleaned.includes("\n");
  if (singleLine && looksLikeMathLine(cleaned)) return { kind: "math", latex: normalizeLatex(cleaned) };
  return { kind: "text", text: cleaned };
}

function looksLikeMathLine(value: string): boolean {
  return LATEX_HINT_RE.test(value) || (/=/.test(value) && /[0-9a-zA-Z)][+\-*/^_=]/.test(value));
}

function normalizeLatex(input: string): string {
  return input
    .replace(/^\$\$|\$\$$/g, "")
    .replace(/∭/g, "\\iiint ").replace(/∬/g, "\\iint ").replace(/∮/g, "\\oint ").replace(/∫/g, "\\int ")
    .replace(/∑/g, "\\sum ").replace(/∏/g, "\\prod ")
    .replace(/√\s*\(?([^\n()]+)\)?/g, "\\sqrt{$1}")
    .replace(/∞/g, "\\infty").replace(/≤/g, "\\leq").replace(/≥/g, "\\geq").replace(/≠/g, "\\neq")
    .replace(/≈/g, "\\approx").replace(/±/g, "\\pm").replace(/∂/g, "\\partial").replace(/∇/g, "\\nabla")
    .replace(/π/g, "\\pi").replace(/θ/g, "\\theta").replace(/Δ/g, "\\Delta")
    .trim();
}

function splitParagraphs(s: string): string[] {
  return s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function svgToDataUrl(svg: string): string {
  const fixed = /xmlns=/.test(svg) ? svg : svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  const b64 = typeof window === "undefined"
    ? Buffer.from(fixed, "utf8").toString("base64")
    : btoa(unescape(encodeURIComponent(fixed)));
  return `data:image/svg+xml;base64,${b64}`;
}

/** Convert AI-parsed blocks into laid-out Shape objects to be inserted into the whiteboard. */
export function blocksToShapes(blocks: ConvertedBlock[]): Shape[] {
  const shapes: Shape[] = [];
  let x = 80, y = 80; const colWidth = 560; const gap = 24;
  let z = 1000;
  for (const b of blocks) {
    if (b.kind === "svg") {
      const scale = Math.min(1, colWidth / b.w);
      const w = Math.round(b.w * scale), h = Math.round(b.h * scale);
      shapes.push({ id: nextId(), type: "image", x, y, w, h, src: svgToDataUrl(b.svg), z: z++, page: 1, ts: tick() });
      y += h + gap;
    } else if (b.kind === "math") {
      const url = `https://latex.codecogs.com/svg.image?\\dpi{150}\\bg{white}${encodeURIComponent(b.latex)}`;
      const w = Math.min(colWidth, Math.max(140, Math.round(b.latex.length * 12)));
      const h = Math.max(48, Math.round(w * 0.22));
      shapes.push({ id: nextId(), type: "image", x, y, w, h, src: url, z: z++, page: 1, ts: tick() });
      y += h + gap;
    } else {
      const lines = Math.max(1, Math.ceil(b.text.length / 60));
      const h = Math.max(40, lines * 24);
      shapes.push({ id: nextId(), type: "text", x, y, w: colWidth, h, text: b.text, color: "#0f172a", size: 18, z: z++, page: 1, ts: tick() });
      y += h + gap;
    }
  }
  return shapes;
}
