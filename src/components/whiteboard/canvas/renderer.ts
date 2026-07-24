import type { Camera, Shape } from "./engine";

export interface GraphAxes {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface RenderOpts {
  ctx: CanvasRenderingContext2D;
  shapes: Shape[];
  camera: Camera;
  width: number;
  height: number;
  dpr: number;
  grid?: "off" | "grid" | "dots" | "graph";
  selection?: Set<string>;
  marquee?: { x: number; y: number; w: number; h: number } | null;
  /** Background colour (defaults to white). */
  bg?: string;
  /** Cached <img> elements for image shapes, keyed by src. */
  imageCache?: Map<string, HTMLImageElement>;
  /** When grid is "graph", use these axis ranges (viewport-fitted, independent of camera zoom). */
  graphAxes?: GraphAxes;
}

export function render(opts: RenderOpts) {
  const { ctx, shapes, camera, width, height, dpr, grid = "off", selection, marquee, bg = "#ffffff", imageCache, graphAxes } = opts;
  // Reset transform
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  if (grid !== "off") drawGrid(ctx, camera, width, height, grid, graphAxes);

  ctx.save();
  // Camera: translate then scale
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.z, camera.z);

  // Render shapes in z order
  const sorted = [...shapes].sort((a, b) => a.z - b.z);
  for (const s of sorted) drawShape(ctx, s, imageCache);

  // Selection outlines
  if (selection && selection.size) {
    ctx.lineWidth = 1.5 / camera.z;
    ctx.strokeStyle = "#3b82f6";
    ctx.setLineDash([6 / camera.z, 4 / camera.z]);
    for (const s of sorted) {
      if (!selection.has(s.id)) continue;
      const b = importBounds(s);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
    ctx.setLineDash([]);
  }

  ctx.restore();

  // Marquee (screen space)
  if (marquee) {
    ctx.strokeStyle = "rgba(59,130,246,0.8)";
    ctx.fillStyle = "rgba(59,130,246,0.12)";
    ctx.lineWidth = 1;
    ctx.fillRect(marquee.x, marquee.y, marquee.w, marquee.h);
    ctx.strokeRect(marquee.x, marquee.y, marquee.w, marquee.h);
  }
}

function importBounds(s: Shape) {
  // Lightweight inline bounds to avoid circular import.
  switch (s.type) {
    case "pencil":
    case "highlighter": {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < s.points.length; i += 2) {
        const x = s.points[i], y = s.points[i + 1];
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
      const pad = s.size;
      return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
    }
    case "line":
    case "arrow": {
      const minX = Math.min(s.x1, s.x2), maxX = Math.max(s.x1, s.x2);
      const minY = Math.min(s.y1, s.y2), maxY = Math.max(s.y1, s.y2);
      const pad = s.size + 8;
      return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
    }
    default:
      return { x: s.x, y: s.y, w: s.w, h: s.h };
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, cam: Camera, w: number, h: number, mode: "grid" | "dots" | "graph", axes?: GraphAxes) {
  if (mode === "graph") {
    drawGraphAxes(ctx, w, h, axes ?? { xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
    return;
  }
  const step = 32 * cam.z;
  if (step < 6) return;
  const offX = ((cam.x % step) + step) % step;
  const offY = ((cam.y % step) + step) % step;
  if (mode === "grid") {
    ctx.strokeStyle = "rgba(15,23,42,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offX; x < w; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = offY; y < h; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(15,23,42,0.18)";
    for (let x = offX; x < w; x += step) {
      for (let y = offY; y < h; y += step) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
  }
}

function niceStep(range: number, targetDivisions = 10): number {
  if (!isFinite(range) || range <= 0) return 1;
  const rough = range / Math.max(1, targetDivisions);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  const nice = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return nice * pow;
}

function drawGraphAxes(ctx: CanvasRenderingContext2D, w: number, h: number, ax: GraphAxes) {
  let { xMin, xMax, yMin, yMax } = ax;
  if (!(xMax > xMin)) xMax = xMin + 1;
  if (!(yMax > yMin)) yMax = yMin + 1;
  const uX = w / (xMax - xMin);
  const uY = h / (yMax - yMin);
  const sx = (x: number) => (x - xMin) * uX;
  const sy = (y: number) => h - (y - yMin) * uY;

  const stepX = niceStep(xMax - xMin);
  const stepY = niceStep(yMax - yMin);
  const minorX = stepX / 5;
  const minorY = stepY / 5;

  // Minor lines
  ctx.strokeStyle = "rgba(15,23,42,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.ceil(xMin / minorX) * minorX; x <= xMax + 1e-9; x += minorX) {
    const px = sx(x); ctx.moveTo(px + 0.5, 0); ctx.lineTo(px + 0.5, h);
  }
  for (let y = Math.ceil(yMin / minorY) * minorY; y <= yMax + 1e-9; y += minorY) {
    const py = sy(y); ctx.moveTo(0, py + 0.5); ctx.lineTo(w, py + 0.5);
  }
  ctx.stroke();

  // Major lines
  ctx.strokeStyle = "rgba(15,23,42,0.15)";
  ctx.beginPath();
  for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax + 1e-9; x += stepX) {
    const px = sx(x); ctx.moveTo(px + 0.5, 0); ctx.lineTo(px + 0.5, h);
  }
  for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax + 1e-9; y += stepY) {
    const py = sy(y); ctx.moveTo(0, py + 0.5); ctx.lineTo(w, py + 0.5);
  }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = "rgba(15,23,42,0.6)";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  const ay = sy(0);
  if (ay >= 0 && ay <= h) { ctx.moveTo(0, ay + 0.5); ctx.lineTo(w, ay + 0.5); }
  const axc = sx(0);
  if (axc >= 0 && axc <= w) { ctx.moveTo(axc + 0.5, 0); ctx.lineTo(axc + 0.5, h); }
  ctx.stroke();

  // Tick labels
  ctx.fillStyle = "rgba(15,23,42,0.7)";
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  const decimals = Math.max(0, -Math.floor(Math.log10(stepX)) + 0);
  const decY = Math.max(0, -Math.floor(Math.log10(stepY)) + 0);
  const fmt = (v: number, d: number) => {
    if (Math.abs(v) < 1e-9) return "0";
    return d > 0 ? v.toFixed(Math.min(4, d)) : String(Math.round(v));
  };
  ctx.textBaseline = "top";
  const labelY = Math.min(Math.max(ay + 2, 2), h - 12);
  for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax + 1e-9; x += stepX) {
    if (Math.abs(x) < 1e-9) continue;
    ctx.fillText(fmt(x, decimals), sx(x) + 2, labelY);
  }
  ctx.textBaseline = "middle";
  const labelX = Math.min(Math.max(axc + 4, 2), w - 32);
  for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax + 1e-9; y += stepY) {
    if (Math.abs(y) < 1e-9) continue;
    ctx.fillText(fmt(y, decY), labelX, sy(y));
  }
}

function drawShape(ctx: CanvasRenderingContext2D, s: Shape, imageCache?: Map<string, HTMLImageElement>) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (s.type) {
    case "pencil": {
      if (s.points.length < 4) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      strokePath(ctx, s.points);
      break;
    }
    case "highlighter": {
      if (s.points.length < 4) return;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = "multiply";
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size * 2.5;
      strokePath(ctx, s.points);
      ctx.restore();
      break;
    }
    case "line": {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.size;
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
      break;
    }
    case "arrow": {
      ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineWidth = s.size;
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
      const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
      const head = 10 + s.size * 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x2, s.y2);
      ctx.lineTo(s.x2 - head * Math.cos(ang - Math.PI / 7), s.y2 - head * Math.sin(ang - Math.PI / 7));
      ctx.lineTo(s.x2 - head * Math.cos(ang + Math.PI / 7), s.y2 - head * Math.sin(ang + Math.PI / 7));
      ctx.closePath(); ctx.fill();
      break;
    }
    case "rect": {
      if (s.fill) { ctx.fillStyle = s.fill; ctx.fillRect(s.x, s.y, s.w, s.h); }
      ctx.strokeStyle = s.color; ctx.lineWidth = s.size;
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      break;
    }
    case "ellipse": {
      ctx.beginPath();
      ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, Math.abs(s.w / 2), Math.abs(s.h / 2), 0, 0, Math.PI * 2);
      if (s.fill) { ctx.fillStyle = s.fill; ctx.fill(); }
      ctx.strokeStyle = s.color; ctx.lineWidth = s.size; ctx.stroke();
      break;
    }
    case "triangle": {
      ctx.beginPath();
      ctx.moveTo(s.x + s.w / 2, s.y);
      ctx.lineTo(s.x + s.w, s.y + s.h);
      ctx.lineTo(s.x, s.y + s.h);
      ctx.closePath();
      if (s.fill) { ctx.fillStyle = s.fill; ctx.fill(); }
      ctx.strokeStyle = s.color; ctx.lineWidth = s.size; ctx.stroke();
      break;
    }
    case "text": {
      ctx.fillStyle = s.color;
      ctx.font = `${s.size}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textBaseline = "top";
      wrapText(ctx, s.text, s.x, s.y, s.w, s.size * 1.25);
      break;
    }
    case "sticky": {
      ctx.fillStyle = s.bg;
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
      roundRect(ctx, s.x, s.y, s.w, s.h, 8);
      ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = s.color;
      ctx.font = `14px ui-sans-serif, system-ui, sans-serif`;
      ctx.textBaseline = "top";
      wrapText(ctx, s.text, s.x + 10, s.y + 10, s.w - 20, 18);
      break;
    }
    case "image": {
      const img = imageCache?.get(s.src);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, s.x, s.y, s.w, s.h);
      } else {
        ctx.fillStyle = "#f1f5f9"; ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(s.x, s.y, s.w, s.h);
      }
      break;
    }
  }
}

function strokePath(ctx: CanvasRenderingContext2D, pts: number[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  if (pts.length === 4) {
    ctx.lineTo(pts[2], pts[3]);
  } else {
    // Quadratic smoothing through midpoints.
    for (let i = 2; i < pts.length - 2; i += 2) {
      const mx = (pts[i] + pts[i + 2]) / 2;
      const my = (pts[i + 1] + pts[i + 3]) / 2;
      ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
    }
    ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
  }
  ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const paragraphs = text.split("\n");
  let yy = y;
  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, yy);
        line = word;
        yy += lineH;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, x, yy); yy += lineH; }
    if (!para) yy += lineH;
  }
}
