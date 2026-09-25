import { describe, it, expect } from "bun:test";
import { renderLatexToSvgDataUrl } from "@/presentation/domains/5-classroom-live-workspace/whiteboard/canvas/latex";
import { parseConversion, blocksToShapes } from "@/presentation/domains/5-classroom-live-workspace/whiteboard/ai/insertConversion";
import { shapeBounds, hitTest, translateShape, type Shape } from "@/presentation/domains/5-classroom-live-workspace/whiteboard/canvas/engine";

describe("Whiteboard AI Independence", () => {
  describe("LaTeX rendering", () => {
    it("renders LaTeX to SVG without AI", () => {
      const result = renderLatexToSvgDataUrl("\\int_0^1 x^2 dx", { displayMode: true });
      expect(result.dataUrl).toContain("data:image/svg+xml;base64,");
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it("renders inline LaTeX without AI", () => {
      const result = renderLatexToSvgDataUrl("x = y", { displayMode: false });
      expect(result.dataUrl).toContain("data:image/svg+xml;base64,");
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it("handles invalid LaTeX gracefully without AI", () => {
      const result = renderLatexToSvgDataUrl("\\invalidcommand", { displayMode: true });
      expect(result.dataUrl).toContain("data:image/svg+xml;base64,");
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });
  });

  describe("Conversion parsing", () => {
    it("parses LaTeX blocks without AI", () => {
      const raw = "Here is math: $$x^2 + y^2 = z^2$$ and text.";
      const blocks = parseConversion(raw);
      expect(blocks.length).toBeGreaterThan(0);
      const mathBlock = blocks.find((b) => b.kind === "math");
      expect(mathBlock).toBeDefined();
      if (mathBlock && mathBlock.kind === "math") {
        expect(mathBlock.latex).toContain("x^2 + y^2 = z^2");
      }
    });

    it("parses SVG blocks without AI", () => {
      const raw = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
      const blocks = parseConversion(raw);
      expect(blocks.length).toBeGreaterThan(0);
      const svgBlock = blocks.find((b) => b.kind === "svg");
      expect(svgBlock).toBeDefined();
      if (svgBlock && svgBlock.kind === "svg") {
        expect(svgBlock.svg).toContain("<svg");
      }
    });

    it("parses plain text without AI", () => {
      const raw = "Just some plain text content.";
      const blocks = parseConversion(raw);
      expect(blocks.length).toBeGreaterThan(0);
      const textBlock = blocks.find((b) => b.kind === "text");
      expect(textBlock).toBeDefined();
      if (textBlock && textBlock.kind === "text") {
        expect(textBlock.text).toContain("plain text");
      }
    });
  });

  describe("Shape creation from blocks", () => {
    it("creates shapes from math blocks without AI", () => {
      const blocks = [{ kind: "math" as const, latex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" }];
      const shapes = blocksToShapes(blocks, { x: 100, y: 100 });
      expect(shapes.length).toBe(1);
      expect(shapes[0].type).toBe("image");
      expect(shapes[0].src).toContain("data:image/svg+xml;base64,");
    });

    it("creates shapes from SVG blocks without AI", () => {
      const blocks = [{
        kind: "svg" as const,
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>',
        w: 100,
        h: 100,
      }];
      const shapes = blocksToShapes(blocks, { x: 100, y: 100 });
      expect(shapes.length).toBeGreaterThan(0);
      expect(shapes[0].type).toBe("image");
    });

    it("creates shapes from text blocks without AI", () => {
      const blocks = [{ kind: "text" as const, text: "Hello world" }];
      const shapes = blocksToShapes(blocks, { x: 100, y: 100 });
      expect(shapes.length).toBe(1);
      expect(shapes[0].type).toBe("text");
      expect(shapes[0].text).toBe("Hello world");
    });
  });

  describe("Core shape operations", () => {
    it("computes shape bounds without AI", () => {
      const pencilShape: Shape = {
        id: "test",
        type: "pencil",
        points: [10, 10, 20, 20, 30, 15],
        color: "#000",
        size: 2,
        z: 1,
        page: 1,
        ts: 1,
      };
      const bounds = shapeBounds(pencilShape);
      expect(bounds.x).toBeLessThanOrEqual(10);
      expect(bounds.y).toBeLessThanOrEqual(10);
      expect(bounds.w).toBeGreaterThan(0);
      expect(bounds.h).toBeGreaterThan(0);
    });

    it("hit tests shapes without AI", () => {
      const rectShape: Shape = {
        id: "test",
        type: "rect",
        x: 0,
        y: 0,
        w: 100,
        h: 50,
        color: "#000",
        size: 2,
        fill: null,
        z: 1,
        page: 1,
        ts: 1,
      };
      expect(hitTest(rectShape, 50, 25)).toBe(true);
      expect(hitTest(rectShape, 200, 200)).toBe(false);
    });

    it("translates shapes without AI", () => {
      const rectShape: Shape = {
        id: "test",
        type: "rect",
        x: 10,
        y: 20,
        w: 100,
        h: 50,
        color: "#000",
        size: 2,
        fill: null,
        z: 1,
        page: 1,
        ts: 1,
      };
      const translated = translateShape(rectShape, 5, 10);
      expect(translated.x).toBe(15);
      expect(translated.y).toBe(30);
    });
  });
});