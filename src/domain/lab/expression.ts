/**
 * Safe-expression contracts for the Virtual Lab architecture.
 *
 * This slice defines the *static* surface only: the AST node shapes and
 * deterministic validation. There is deliberately no evaluator here — no
 * `eval`, no `new Function`, no wall clock, no randomness. A pure recursive
 * evaluator is designed for future extension (DESIGNED FOR FUTURE EXTENSION)
 * and will live beside this module in a later slice.
 *
 * Expressions return values. Assignment is NOT an expression operator: the
 * relationship's `target` declares which quantity a formula computes, so there
 * is no `"="` operator anywhere in the language.
 */
import type { ValidationIssue, ValidationResult } from "./validation";
import { isFiniteNumber, isRecord } from "./guards";

export type BinaryOperator = "+" | "-" | "*" | "/" | "^";

export const ALLOWED_FUNCTIONS = [
  "sin",
  "cos",
  "tan",
  "exp",
  "ln",
  "sqrt",
  "abs",
  "min",
  "max",
] as const;

export type AllowedFunction = (typeof ALLOWED_FUNCTIONS)[number];

export const ALLOWED_FUNCTION_SET: ReadonlySet<string> = new Set(ALLOWED_FUNCTIONS);

export interface LiteralNode {
  type: "literal";
  value: number;
}

export interface VariableNode {
  type: "variable";
  name: string;
}

export interface UnaryOpNode {
  type: "unary_op";
  op: "+" | "-";
  operand: ExpressionNode;
}

export interface BinaryOpNode {
  type: "binary_op";
  op: BinaryOperator;
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface FunctionCallNode {
  type: "function_call";
  name: AllowedFunction;
  args: ExpressionNode[];
}

export type ExpressionNode =
  LiteralNode | VariableNode | UnaryOpNode | BinaryOpNode | FunctionCallNode;

/**
 * Structural bounds for expressions. Both fields are positive integers when
 * present. Enforced during validation so a model class or relationship cannot
 * smuggle in unboundedly deep or large expressions.
 */
export interface ExpressionLimits {
  maxDepth: number;
  maxNodes: number;
}

const FUNCTION_ARITY: Record<AllowedFunction, number> = {
  sin: 1,
  cos: 1,
  tan: 1,
  exp: 1,
  ln: 1,
  sqrt: 1,
  abs: 1,
  min: 2,
  max: 2,
};

const BINARY_OP_SET: ReadonlySet<string> = new Set<string>(["+", "-", "*", "/", "^"]);

export const MAX_EXPRESSION_DEPTH = 128;
export const MAX_EXPRESSION_NODES = 10_000;

function validateTree(
  node: unknown,
  maxDepth: number,
  maxNodes: number,
  allowedVariables: readonly string[] | undefined,
  issues: ValidationIssue[],
): void {
  const pending: { value: unknown; path: string; depth: number }[] = [
    { value: node, path: "", depth: 0 },
  ];
  const visited = new WeakSet<object>();
  let nodeCount = 0;

  while (pending.length > 0) {
    const current = pending.pop()!;
    nodeCount += 1;
    if (nodeCount > maxNodes) {
      issues.push({ path: current.path, message: `expression exceeds the ${maxNodes}-node limit` });
      return;
    }
    if (current.depth > maxDepth) {
      issues.push({
        path: current.path,
        message: `expression exceeds the depth limit (${maxDepth})`,
      });
      continue;
    }
    if (!isRecord(current.value)) {
      issues.push({ path: current.path, message: "expression node must be an object" });
      continue;
    }
    if (visited.has(current.value)) {
      issues.push({
        path: current.path,
        message: "expression must be a tree without cycles or shared nodes",
      });
      continue;
    }
    visited.add(current.value);
    const value = current.value as Record<string, unknown>;
    const addChild = (child: unknown, suffix: string) =>
      pending.push({ value: child, path: `${current.path}${suffix}`, depth: current.depth + 1 });

    switch (value.type) {
      case "literal":
        if (!isFiniteNumber(value.value)) {
          issues.push({
            path: `${current.path}.value`,
            message: "literal value must be a finite number",
          });
        }
        break;
      case "variable":
        if (typeof value.name !== "string" || value.name === "") {
          issues.push({
            path: `${current.path}.name`,
            message: "variable name must be a non-empty string",
          });
        } else if (allowedVariables !== undefined && !allowedVariables.includes(value.name)) {
          issues.push({
            path: `${current.path}.name`,
            message: `unknown variable "${value.name}"`,
          });
        }
        break;
      case "unary_op":
        if (value.op !== "+" && value.op !== "-") {
          issues.push({
            path: `${current.path}.op`,
            message: `unary op must be "+" or "-" (got "${String(value.op)}")`,
          });
        } else addChild(value.operand, ".operand");
        break;
      case "binary_op":
        if (typeof value.op !== "string" || !BINARY_OP_SET.has(value.op)) {
          issues.push({
            path: `${current.path}.op`,
            message: `binary op must be one of "+", "-", "*", "/", "^" (got "${String(value.op)}")`,
          });
        } else {
          addChild(value.right, ".right");
          addChild(value.left, ".left");
        }
        break;
      case "function_call":
        if (typeof value.name !== "string" || !ALLOWED_FUNCTION_SET.has(value.name)) {
          issues.push({
            path: `${current.path}.name`,
            message: `function must be one of ${ALLOWED_FUNCTIONS.join(", ")} (got "${String(value.name)}")`,
          });
        } else {
          const expected = FUNCTION_ARITY[value.name as AllowedFunction];
          if (!Array.isArray(value.args) || value.args.length !== expected) {
            issues.push({
              path: `${current.path}.args`,
              message: `function "${value.name}" expects exactly ${expected} argument(s)`,
            });
          } else value.args.forEach((arg, index) => addChild(arg, `.args[${index}]`));
        }
        break;
      default:
        issues.push({
          path: current.path,
          message: `unknown expression node type (got "${String(value.type)}")`,
        });
    }
  }
}

/**
 * Deterministically validate an expression tree.
 *
 * When `allowedVariables` is provided, every variable node must name one of
 * them. Caller limits can tighten the technical ceilings but cannot raise
 * them. Iterative traversal avoids exhausting the JS call stack on deep input.
 *
 * Depth convention: root node = depth 0; children of root = depth 1; etc.
 * MaxNodes counts every node in the tree.
 */
export function validateExpression(
  node: unknown,
  limits?: ExpressionLimits,
  allowedVariables?: readonly string[],
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (limits !== undefined) {
    if (!isRecord(limits)) {
      issues.push({ path: "limits", message: "expression limits must be an object" });
    } else {
      if (
        !isFiniteNumber(limits.maxDepth) ||
        !Number.isInteger(limits.maxDepth) ||
        limits.maxDepth <= 0
      ) {
        issues.push({ path: "limits.maxDepth", message: "maxDepth must be a positive integer" });
      }
      if (
        !isFiniteNumber(limits.maxNodes) ||
        !Number.isInteger(limits.maxNodes) ||
        limits.maxNodes <= 0
      ) {
        issues.push({ path: "limits.maxNodes", message: "maxNodes must be a positive integer" });
      }
      if (isFiniteNumber(limits.maxDepth) && limits.maxDepth > MAX_EXPRESSION_DEPTH) {
        issues.push({
          path: "limits.maxDepth",
          message: `maxDepth cannot exceed the technical ceiling (${MAX_EXPRESSION_DEPTH})`,
        });
      }
      if (isFiniteNumber(limits.maxNodes) && limits.maxNodes > MAX_EXPRESSION_NODES) {
        issues.push({
          path: "limits.maxNodes",
          message: `maxNodes cannot exceed the technical ceiling (${MAX_EXPRESSION_NODES})`,
        });
      }
    }
  }

  if (node === undefined || !isRecord(node)) {
    issues.push({ path: "", message: "expression must be an object node" });
    return { ok: false, issues };
  }

  if (issues.length > 0) return { ok: false, issues };

  validateTree(
    node,
    limits?.maxDepth ?? MAX_EXPRESSION_DEPTH,
    limits?.maxNodes ?? MAX_EXPRESSION_NODES,
    allowedVariables,
    issues,
  );

  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}
