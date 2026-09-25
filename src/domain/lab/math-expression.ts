/**
 * Small arithmetic expression parser/evaluator for Simulation Lab graph curves.
 * Input is data only: there is no JavaScript compilation, property lookup, or
 * access to globals. The grammar is intentionally limited and resource-bounded.
 */

export const MAX_MATH_EXPRESSION_LENGTH = 256;
const MAX_TOKENS = 128;
const MAX_NODES = 128;
const MAX_PARSE_DEPTH = 64;

type UnaryOperator = "+" | "-";
type BinaryOperator = "+" | "-" | "*" | "/" | "^";
type MathFunction =
  | "sin"
  | "cos"
  | "tan"
  | "asin"
  | "acos"
  | "atan"
  | "atan2"
  | "exp"
  | "log"
  | "log10"
  | "sqrt"
  | "abs"
  | "min"
  | "max"
  | "pow"
  | "floor"
  | "ceil"
  | "round";

export type MathExpression =
  | { type: "number"; value: number }
  | { type: "variable"; name: "x" | "t" }
  | { type: "constant"; value: number }
  | { type: "unary"; op: UnaryOperator; operand: MathExpression }
  | { type: "binary"; op: BinaryOperator; left: MathExpression; right: MathExpression }
  | { type: "call"; name: MathFunction; args: MathExpression[] };

type Token =
  | { type: "number"; value: number }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: string }
  | { type: "left" | "right" | "comma" };

const FUNCTION_ARITY: Record<MathFunction, { min: number; max: number }> = {
  sin: { min: 1, max: 1 },
  cos: { min: 1, max: 1 },
  tan: { min: 1, max: 1 },
  asin: { min: 1, max: 1 },
  acos: { min: 1, max: 1 },
  atan: { min: 1, max: 1 },
  atan2: { min: 2, max: 2 },
  exp: { min: 1, max: 1 },
  log: { min: 1, max: 1 },
  log10: { min: 1, max: 1 },
  sqrt: { min: 1, max: 1 },
  abs: { min: 1, max: 1 },
  min: { min: 2, max: 8 },
  max: { min: 2, max: 8 },
  pow: { min: 2, max: 2 },
  floor: { min: 1, max: 1 },
  ceil: { min: 1, max: 1 },
  round: { min: 1, max: 1 },
};

function tokenize(source: string): Token[] | null {
  if (source.length === 0 || source.length > MAX_MATH_EXPRESSION_LENGTH) return null;
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const remaining = source.slice(index);
    if (/^\s+/.test(remaining)) {
      index += remaining.match(/^\s+/)![0].length;
      continue;
    }
    const number = remaining.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (number) {
      const value = Number(number[0]);
      if (!Number.isFinite(value)) return null;
      tokens.push({ type: "number", value });
      index += number[0].length;
    } else {
      const identifier = remaining.match(/^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?/);
      if (identifier) {
        tokens.push({ type: "identifier", value: identifier[0] });
        index += identifier[0].length;
      } else {
        const char = source[index]!;
        if (char === "(") tokens.push({ type: "left" });
        else if (char === ")") tokens.push({ type: "right" });
        else if (char === ",") tokens.push({ type: "comma" });
        else if (char === "*" && source[index + 1] === "*") {
          tokens.push({ type: "operator", value: "^" });
          index += 2;
        } else if (["+", "-", "*", "/", "^"].includes(char)) {
          tokens.push({ type: "operator", value: char });
          index += 1;
        } else return null;
        if (char === "(" || char === ")" || char === ",") index += 1;
      }
    }
    if (tokens.length > MAX_TOKENS) return null;
  }
  return tokens;
}

class Parser {
  private index = 0;
  private nodes = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): MathExpression | null {
    const result = this.parseAdditive(0);
    return result && this.index === this.tokens.length ? result : null;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private consume(): Token | undefined {
    const token = this.peek();
    if (token) this.index += 1;
    return token;
  }

  private make<T extends MathExpression>(node: T): T | null {
    this.nodes += 1;
    return this.nodes <= MAX_NODES ? node : null;
  }

  private parseAdditive(depth: number): MathExpression | null {
    if (depth > MAX_PARSE_DEPTH) return null;
    let left = this.parseMultiplicative(depth + 1);
    while (left) {
      const token = this.peek();
      if (token?.type !== "operator" || !["+", "-"].includes(token.value)) break;
      const op = (this.consume() as { type: "operator"; value: string }).value as BinaryOperator;
      const right = this.parseMultiplicative(depth + 1);
      if (!right) return null;
      left = this.make({ type: "binary", op, left, right });
    }
    return left;
  }

  private parseMultiplicative(depth: number): MathExpression | null {
    if (depth > MAX_PARSE_DEPTH) return null;
    let left = this.parseUnary(depth + 1);
    while (left) {
      const token = this.peek();
      if (token?.type !== "operator" || !["*", "/"].includes(token.value)) break;
      const op = (this.consume() as { type: "operator"; value: string }).value as BinaryOperator;
      const right = this.parseUnary(depth + 1);
      if (!right) return null;
      left = this.make({ type: "binary", op, left, right });
    }
    return left;
  }

  private parseUnary(depth: number): MathExpression | null {
    if (depth > MAX_PARSE_DEPTH) return null;
    const token = this.peek();
    if (token?.type === "operator" && (token.value === "+" || token.value === "-")) {
      this.consume();
      const operand = this.parseUnary(depth + 1);
      return operand ? this.make({ type: "unary", op: token.value, operand }) : null;
    }
    return this.parsePower(depth + 1);
  }

  private parsePower(depth: number): MathExpression | null {
    if (depth > MAX_PARSE_DEPTH) return null;
    const left = this.parsePrimary(depth + 1);
    if (!left) return null;
    const token = this.peek();
    if (token?.type !== "operator" || token.value !== "^") return left;
    this.consume();
    const right = this.parseUnary(depth + 1);
    return right ? this.make({ type: "binary", op: "^", left, right }) : null;
  }

  private parsePrimary(depth: number): MathExpression | null {
    if (depth > MAX_PARSE_DEPTH) return null;
    const token = this.consume();
    if (!token) return null;
    if (token.type === "number") return this.make({ type: "number", value: token.value });
    if (token.type === "left") {
      const expression = this.parseAdditive(depth + 1);
      return expression && this.consume()?.type === "right" ? expression : null;
    }
    if (token.type !== "identifier") return null;

    if (token.value === "x" || token.value === "t") {
      return this.make({ type: "variable", name: token.value });
    }
    if (token.value === "Math.PI") return this.make({ type: "constant", value: Math.PI });
    if (token.value === "Math.E") return this.make({ type: "constant", value: Math.E });
    if (!token.value.startsWith("Math.")) return null;

    const name = token.value.slice("Math.".length) as MathFunction;
    if (!Object.hasOwn(FUNCTION_ARITY, name) || this.consume()?.type !== "left") return null;
    const args: MathExpression[] = [];
    if (this.peek()?.type !== "right") {
      while (true) {
        const arg = this.parseAdditive(depth + 1);
        if (!arg) return null;
        args.push(arg);
        if (this.peek()?.type !== "comma") break;
        this.consume();
      }
    }
    if (this.consume()?.type !== "right") return null;
    const arity = FUNCTION_ARITY[name];
    if (args.length < arity.min || args.length > arity.max) return null;
    return this.make({ type: "call", name, args });
  }
}

export function parseMathExpression(source: string): MathExpression | null {
  const tokens = tokenize(source);
  if (!tokens) return null;
  try {
    return new Parser(tokens).parse();
  } catch {
    return null;
  }
}

const FUNCTIONS: Record<MathFunction, (...values: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  exp: Math.exp,
  log: Math.log,
  log10: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
};

function evaluate(node: MathExpression, x: number, t: number): number {
  switch (node.type) {
    case "number":
    case "constant":
      return node.value;
    case "variable":
      return node.name === "x" ? x : t;
    case "unary": {
      const value = evaluate(node.operand, x, t);
      return node.op === "-" ? -value : value;
    }
    case "binary": {
      const left = evaluate(node.left, x, t);
      const right = evaluate(node.right, x, t);
      switch (node.op) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "^":
          return left ** right;
      }
      return Number.NaN;
    }
    case "call":
      return Object.hasOwn(FUNCTIONS, node.name)
        ? FUNCTIONS[node.name](...node.args.map((arg) => evaluate(arg, x, t)))
        : Number.NaN;
  }
}

export function evaluateMathExpression(
  expression: MathExpression,
  variables: { x: number; t: number },
): number {
  try {
    const result = evaluate(expression, variables.x, variables.t);
    return Number.isFinite(result) ? result : Number.NaN;
  } catch {
    return Number.NaN;
  }
}
