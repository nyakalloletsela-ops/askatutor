import { describe, expect, test } from "bun:test";
import {
  MAX_EXPRESSION_DEPTH,
  MAX_EXPRESSION_NODES,
  validateExpression,
} from "../src/domain/lab/expression";

describe("Virtual Lab expression validation", () => {
  test("counts every node and enforces a caller's tighter limit", () => {
    const expression = {
      type: "binary_op",
      op: "+",
      left: { type: "literal", value: 1 },
      right: { type: "literal", value: 2 },
    };

    expect(validateExpression(expression)).toEqual({ ok: true });
    expect(validateExpression(expression, { maxDepth: 2, maxNodes: 2 }).ok).toBe(false);
  });

  test("rejects deeply nested input without recursive stack exhaustion", () => {
    let expression: unknown = { type: "literal", value: 1 };
    for (let index = 0; index < 20_000; index += 1) {
      expression = { type: "unary_op", op: "-", operand: expression };
    }

    expect(() => validateExpression(expression)).not.toThrow();
    expect(validateExpression(expression).ok).toBe(false);
  });

  test("callers cannot raise hard resource ceilings", () => {
    expect(
      validateExpression(
        { type: "literal", value: 1 },
        {
          maxDepth: MAX_EXPRESSION_DEPTH + 1,
          maxNodes: MAX_EXPRESSION_NODES,
        },
      ).ok,
    ).toBe(false);
    expect(
      validateExpression(
        { type: "literal", value: 1 },
        {
          maxDepth: MAX_EXPRESSION_DEPTH,
          maxNodes: MAX_EXPRESSION_NODES + 1,
        },
      ).ok,
    ).toBe(false);
  });

  test("rejects cyclic and shared-node object graphs", () => {
    const cyclic: Record<string, unknown> = { type: "unary_op", op: "-" };
    cyclic.operand = cyclic;
    expect(validateExpression(cyclic).ok).toBe(false);

    const shared = { type: "literal", value: 1 };
    expect(validateExpression({ type: "binary_op", op: "+", left: shared, right: shared }).ok).toBe(
      false,
    );
  });
});
