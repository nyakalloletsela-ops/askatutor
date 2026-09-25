import { describe, expect, test } from "bun:test";
import {
  evaluateMathExpression,
  MAX_MATH_EXPRESSION_LENGTH,
  parseMathExpression,
} from "../src/domain/lab/math-expression";

function evaluate(source: string, x = 0, t = 0): number | null {
  const expression = parseMathExpression(source);
  return expression ? evaluateMathExpression(expression, { x, t }) : null;
}

describe("safe Simulation Lab graph expressions", () => {
  test("evaluates the supported arithmetic and Math grammar", () => {
    expect(evaluate("Math.sin(x + t)", Math.PI / 2, 0)).toBeCloseTo(1);
    expect(evaluate("Math.exp(-x) + 2^3", 0, 0)).toBeCloseTo(9);
    expect(evaluate("Math.pow(x, 2) + Math.PI", 3, 0)).toBeCloseTo(9 + Math.PI);
    expect(evaluate("Math.max(x, t, 4)", 2, 3)).toBe(4);
    expect(evaluate("-(x^2) + Math.E", 2, 0)).toBeCloseTo(Math.E - 4);
  });

  test("rejects global access, prototype escapes, property indexing and assignment", () => {
    for (const source of [
      "Math.constructor('return globalThis')()",
      "Math.sin.constructor(1)",
      "globalThis.alert(1)",
      "x.constructor",
      "Math['sin'](x)",
      "Math.random()",
      "x = 4",
      "fetch('/secret')",
    ]) {
      expect(parseMathExpression(source)).toBeNull();
    }
  });

  test("bounds source size, token count, nesting and non-finite results", () => {
    expect(parseMathExpression("1".repeat(MAX_MATH_EXPRESSION_LENGTH + 1))).toBeNull();
    expect(parseMathExpression("-".repeat(70) + "x")).toBeNull();
    expect(evaluate("1 / 0")).toBeNaN();
  });
});
