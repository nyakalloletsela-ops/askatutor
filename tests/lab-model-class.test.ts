import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createModelClassRegistry, type ModelInstance } from "../src/domain/lab/model-class";
import {
  dimensionSignature,
  dimensionSignaturesEqual,
  validateModelClassSpec,
  validateModelInstance,
} from "../src/domain/lab/validation";
import {
  ENGINE_VERSION,
  NEWTON_2_MODEL_CLASS,
  NEWTON_2_MODEL_CLASS_ID,
  NEWTON_2_MODEL_CLASS_VERSION,
  buildModel,
  createState,
  run,
  step,
  toObservables,
} from "../src/domain/lab/engines/mechanics-1d";

function cloneSpec(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...NEWTON_2_MODEL_CLASS,
    quantities: NEWTON_2_MODEL_CLASS.quantities.map((quantity) => ({ ...quantity })),
    constraints: NEWTON_2_MODEL_CLASS.constraints.map((constraint) => ({ ...constraint })),
    observables: NEWTON_2_MODEL_CLASS.observables.map((observable) => ({ ...observable })),
    timeModel: { ...NEWTON_2_MODEL_CLASS.timeModel },
    ...overrides,
  };
}

function instance(
  overrides: Partial<Omit<ModelInstance, "parameters">> & {
    parameters?: Partial<Record<string, number>>;
  } = {},
): ModelInstance {
  const { parameters, ...rest } = overrides;
  return {
    modelClassId: NEWTON_2_MODEL_CLASS_ID,
    modelClassVersion: NEWTON_2_MODEL_CLASS_VERSION,
    parameters: parameters ?? { mass: 2, force: 10 },
    steps: 10,
    ...rest,
  };
}

describe("Model-Class contract", () => {
  test("accepts the reference 1-D mechanics model class", () => {
    expect(validateModelClassSpec(NEWTON_2_MODEL_CLASS)).toEqual({ ok: true });
  });

  test("rejects subject/level binding and per-subject engines", () => {
    expect(validateModelClassSpec(cloneSpec({ subjectNeutral: false })).ok).toBe(false);
    expect(validateModelClassSpec(cloneSpec({ subject: "physics" })).ok).toBe(false);
    expect(validateModelClassSpec(cloneSpec({ level: "primary" })).ok).toBe(false);
    expect(validateModelClassSpec(cloneSpec({ PhysicsEngine: true })).ok).toBe(false);
  });

  test("rejects malformed identifiers and versions", () => {
    expect(validateModelClassSpec(cloneSpec({ id: "Physics" })).ok).toBe(false);
    expect(validateModelClassSpec(cloneSpec({ id: "single" })).ok).toBe(false);
    expect(validateModelClassSpec(cloneSpec({ version: "1.0" })).ok).toBe(false);
    expect(validateModelClassSpec(cloneSpec({ version: "v1.0.0" })).ok).toBe(false);
  });

  test("rejects duplicate quantities, dangling constraints and malformed units", () => {
    const duplicate = cloneSpec();
    const quantities = duplicate.quantities as Record<string, unknown>[];
    quantities.push({ ...quantities[0] });
    expect(validateModelClassSpec(duplicate).ok).toBe(false);

    const dangling = cloneSpec();
    const constraints = dangling.constraints as Record<string, unknown>[];
    constraints.push({ id: "ghost", quantityId: "not_a_quantity", kind: "finite" });
    expect(validateModelClassSpec(dangling).ok).toBe(false);

    const badUnit = cloneSpec();
    const badQuantities = badUnit.quantities as Record<string, unknown>[];
    badQuantities[0] = { ...badQuantities[0], unit: { symbol: "m", dimension: "L//T" } };
    expect(validateModelClassSpec(badUnit).ok).toBe(false);
  });

  test("rejects non-finite defaults, inverted bounds and disallowed integrators", () => {
    const nonFinite = cloneSpec();
    const quantities = nonFinite.quantities as Record<string, unknown>[];
    quantities[0] = { ...quantities[0], initial: Number.POSITIVE_INFINITY };
    expect(validateModelClassSpec(nonFinite).ok).toBe(false);

    const inverted = cloneSpec();
    const bounded = inverted.quantities as Record<string, unknown>[];
    bounded[0] = { ...bounded[0], min: 5, max: 1 };
    expect(validateModelClassSpec(inverted).ok).toBe(false);

    expect(validateModelClassSpec(cloneSpec({ integrator: "rk4" })).ok).toBe(false);
  });

  test("dimensional signatures parse and compare deterministically", () => {
    expect(dimensionSignature("M*L/T^2")).toBe("L^1*M^1*T^-2");
    expect(dimensionSignaturesEqual("M*L/T^2", "L*M/T^2")).toBe(true);
    expect(dimensionSignaturesEqual("M*L/T^2", "M*L/T")).toBe(false);
    expect(dimensionSignature("dimensionless")).toBe("");
    expect(dimensionSignature("L//T")).toBeNull();
    expect(dimensionSignature("Q")).toBeNull();
  });

  test("registry resolves by id and version", () => {
    const registry = createModelClassRegistry([NEWTON_2_MODEL_CLASS]);
    expect(registry.list()).toHaveLength(1);
    expect(registry.get(NEWTON_2_MODEL_CLASS_ID)?.version).toBe(NEWTON_2_MODEL_CLASS_VERSION);
    expect(registry.get(NEWTON_2_MODEL_CLASS_ID, NEWTON_2_MODEL_CLASS_VERSION)).toBeDefined();
    expect(registry.get(NEWTON_2_MODEL_CLASS_ID, "9.9.9")).toBeUndefined();
    expect(registry.get("unknown.model")).toBeUndefined();
  });
});

describe("Model-Class instance validation", () => {
  test("accepts a valid instance", () => {
    expect(validateModelInstance(instance(), NEWTON_2_MODEL_CLASS)).toEqual({ ok: true });
  });

  test("requires finite parameters and applies constraints", () => {
    expect(
      validateModelInstance(instance({ parameters: { force: 1 } }), NEWTON_2_MODEL_CLASS).ok,
    ).toBe(false);
    expect(
      validateModelInstance(instance({ parameters: { mass: 0, force: 1 } }), NEWTON_2_MODEL_CLASS)
        .ok,
    ).toBe(false);
    expect(
      validateModelInstance(
        instance({ parameters: { mass: Number.NaN, force: 1 } }),
        NEWTON_2_MODEL_CLASS,
      ).ok,
    ).toBe(false);
  });

  test("rejects unknown variables and a wrong model class", () => {
    expect(
      validateModelInstance(instance({ variables: { nonsense: 1 } }), NEWTON_2_MODEL_CLASS).ok,
    ).toBe(false);
    expect(
      validateModelInstance({ ...instance(), modelClassId: "other.model" }, NEWTON_2_MODEL_CLASS)
        .ok,
    ).toBe(false);
    expect(
      validateModelInstance({ ...instance(), modelClassVersion: "0.0.1" }, NEWTON_2_MODEL_CLASS).ok,
    ).toBe(false);
  });

  test("enforces the step budget and step size", () => {
    const tooMany = instance({ steps: NEWTON_2_MODEL_CLASS.timeModel.maxSteps + 1 });
    expect(validateModelInstance(tooMany, NEWTON_2_MODEL_CLASS).ok).toBe(false);
    expect(validateModelInstance(instance({ steps: 0 }), NEWTON_2_MODEL_CLASS).ok).toBe(false);
    expect(validateModelInstance(instance({ dt: 0 }), NEWTON_2_MODEL_CLASS).ok).toBe(false);
  });
});

describe("1-D mechanics reference engine", () => {
  test("is deterministic across independent runs", () => {
    const a = run(instance({ steps: 50, dt: 0.02 }));
    const b = run(instance({ steps: 50, dt: 0.02 }));
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test("returns the initial observation plus one per step with explicit time", () => {
    const history = run(instance({ steps: 4, dt: 0.25 }));
    expect(history).toHaveLength(5);
    expect(history[0]).toMatchObject({ step: 0, t: 0 });
    expect(history[4].step).toBe(4);
    expect(history[4].t).toBeCloseTo(1, 12);
  });

  test("matches constant-force kinematics within Euler tolerance", () => {
    const history = run(instance({ steps: 1000, dt: 0.001 }), { steps: 1000, dt: 0.001 });
    const final = history[history.length - 1];
    const acceleration = 10 / 2;
    expect(final.observables.acceleration).toBeCloseTo(acceleration, 12);
    expect(final.observables.velocity).toBeCloseTo(acceleration * 1, 6);
    expect(final.observables.position).toBeCloseTo(0.5 * acceleration * 1 ** 2, 2);
  });

  test("free fall under gravity with no wall clock", () => {
    const mass = 3;
    const history = run(
      instance({ parameters: { mass, force: -mass * 9.81 }, steps: 1000, dt: 0.001 }),
    );
    const final = history[history.length - 1];
    expect(final.observables.acceleration).toBeCloseTo(-9.81, 12);
    expect(final.observables.velocity).toBeCloseTo(-9.81, 6);
    expect(final.observables.position).toBeCloseTo(-0.5 * 9.81, 2);
  });

  test("gravitational acceleration is mass-independent", () => {
    for (const mass of [1, 5, 20]) {
      const model = buildModel(instance({ parameters: { mass, force: -mass * 9.81 } }));
      const state = step(
        createState(instance({ parameters: { mass, force: -mass * 9.81 } }), model),
        model,
        1,
      );
      expect(state.acceleration).toBeCloseTo(-9.81, 12);
      expect(state.velocity).toBeCloseTo(-9.81, 12);
    }
  });

  test("net force is reported as mass times acceleration", () => {
    const model = buildModel(instance());
    const state = createState(instance(), model);
    expect(toObservables(state, model).net_force).toBeCloseTo(10, 12);
  });

  test("step is pure and does not mutate its input", () => {
    const model = buildModel(instance());
    const before = createState(instance(), model);
    const snapshot = JSON.stringify(before);
    const after = step(before, model, 0.1);
    expect(JSON.stringify(before)).toBe(snapshot);
    expect(after).not.toEqual(before);
    expect(after.step).toBe(before.step + 1);
  });

  test("rejects invalid instances and out-of-budget runs", () => {
    expect(() => buildModel(instance({ parameters: { mass: -1, force: 1 } }))).toThrow();
    expect(() => run(instance(), { steps: NEWTON_2_MODEL_CLASS.timeModel.maxSteps + 1 })).toThrow();
    expect(() => run(instance(), { dt: 0 })).toThrow();
    expect(ENGINE_VERSION).toBe("1.0.0");
  });
});

describe("security: new domain subtree is free of executable/dynamic constructs", () => {
  test("no eval, new Function, wall clock, or randomness", () => {
    const root = resolve(import.meta.dir, "..", "src", "domain", "lab");
    const forbidden: { label: string; pattern: RegExp }[] = [
      { label: "eval", pattern: /\beval\b/ },
      { label: "new Function", pattern: /new\s+Function/ },
      { label: "performance wall clock", pattern: /\bperformance\b/ },
      { label: "Date.now wall clock", pattern: /\bDate\s*\.\s*now/ },
      { label: "Math.random", pattern: /\bMath\s*\.\s*random/ },
    ];
    const files: string[] = [];
    const walk = (directory: string): void => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const full = join(directory, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".ts")) files.push(full);
      }
    };
    walk(root);
    expect(files.length).toBeGreaterThan(0);

    const violations: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "");
      for (const rule of forbidden) {
        if (rule.pattern.test(source)) violations.push(`${file}: ${rule.label}`);
      }
    }
    expect(violations).toEqual([]);
  });
});
