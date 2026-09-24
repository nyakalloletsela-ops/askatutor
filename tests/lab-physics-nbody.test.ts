import { describe, expect, test } from "bun:test";
import { validateModelClassSpec, validateModelInstance } from "../src/domain/lab/validation";
import {
  executeFixedStep,
  resolveFixedStepSchedule,
  type FixedStepSchedule,
} from "../src/domain/lab/execution/fixed-step";
import {
  NBODY_ENGINE_VERSION,
  NBODY_MODEL_CLASS,
  NBODY_MODEL_CLASS_ID,
  NBODY_MODEL_CLASS_VERSION,
  buildModel,
  computeAccelerations,
  createState,
  run,
  step,
  toObservables,
} from "../src/domain/lab/domains/physics/nbody-1d";
import type { ModelInstance } from "../src/domain/lab/model-class";

interface BodyInput {
  id: string;
  mass: number;
  position?: number;
  velocity?: number;
}

function body({ id, mass, position = 0, velocity = 0 }: BodyInput) {
  return { id, parameters: { mass }, variables: { position, velocity } };
}

function instance(
  overrides: Omit<Partial<ModelInstance>, "parameters" | "entities"> & {
    parameters?: Partial<Record<string, number>>;
    entities?: ModelInstance["entities"];
  } = {},
): ModelInstance {
  const { parameters, entities, ...rest } = overrides;
  return {
    modelClassId: NBODY_MODEL_CLASS_ID,
    modelClassVersion: NBODY_MODEL_CLASS_VERSION,
    parameters: {
      gravitational_constant: 1,
      softening: 0.1,
      ...parameters,
    },
    entities: entities ?? {
      bodies: [body({ id: "a", mass: 1, position: -1 }), body({ id: "b", mass: 1, position: 1 })],
    },
    steps: 10,
    ...rest,
  };
}

function cloneSpec(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const source = NBODY_MODEL_CLASS;
  return {
    ...source,
    quantities: source.quantities.map((quantity) => ({ ...quantity })),
    constraints: source.constraints.map((constraint) => ({ ...constraint })),
    observables: source.observables.map((observable) => ({ ...observable })),
    entities: (source.entities ?? []).map((collection) => ({
      ...collection,
      quantities: collection.quantities.map((quantity) => ({ ...quantity })),
      constraints: (collection.constraints ?? []).map((constraint) => ({ ...constraint })),
    })),
    timeModel: { ...source.timeModel },
    ...overrides,
  };
}

describe("N-body model class declaration", () => {
  test("accepts the reference n-body model class with an entity collection", () => {
    expect(validateModelClassSpec(NBODY_MODEL_CLASS)).toEqual({ ok: true });
    expect(NBODY_MODEL_CLASS.entities).toHaveLength(1);
    expect(NBODY_MODEL_CLASS.entities?.[0].maxEntities).toBeGreaterThan(0);
  });

  test("rejects malformed entity-collection declarations", () => {
    const noMax = cloneSpec();
    (noMax.entities as Record<string, unknown>[])[0] = {
      ...(noMax.entities as Record<string, unknown>[])[0],
      maxEntities: 0,
    };
    expect(validateModelClassSpec(noMax).ok).toBe(false);

    const nonIntegerMax = cloneSpec();
    (nonIntegerMax.entities as Record<string, unknown>[])[0] = {
      ...(nonIntegerMax.entities as Record<string, unknown>[])[0],
      maxEntities: 1.5,
    };
    expect(validateModelClassSpec(nonIntegerMax).ok).toBe(false);

    const emptyQuantities = cloneSpec();
    (emptyQuantities.entities as Record<string, unknown>[])[0] = {
      ...(emptyQuantities.entities as Record<string, unknown>[])[0],
      quantities: [],
    };
    expect(validateModelClassSpec(emptyQuantities).ok).toBe(false);

    const duplicateCollection = cloneSpec();
    const collections = duplicateCollection.entities as Record<string, unknown>[];
    collections.push({ ...collections[0] });
    expect(validateModelClassSpec(duplicateCollection).ok).toBe(false);

    const danglingConstraint = cloneSpec();
    const [collection] = danglingConstraint.entities as Record<string, unknown>[];
    (collection.constraints as Record<string, unknown>[]).push({
      id: "ghost",
      quantityId: "not_a_quantity",
      kind: "finite",
    });
    expect(validateModelClassSpec(danglingConstraint).ok).toBe(false);
  });
});

describe("N-body instance validation", () => {
  test("accepts a valid multi-body instance", () => {
    expect(validateModelInstance(instance(), NBODY_MODEL_CLASS)).toEqual({ ok: true });
  });

  test("rejects unknown collections and unknown entity quantities", () => {
    expect(
      validateModelInstance(
        instance({ entities: { bodies: [body({ id: "a", mass: 1 })], wiggles: [] } }),
        NBODY_MODEL_CLASS,
      ).ok,
    ).toBe(false);

    const badQuantity = body({ id: "a", mass: 1 });
    (badQuantity.variables as Record<string, number>).charge = 1;
    expect(
      validateModelInstance(instance({ entities: { bodies: [badQuantity] } }), NBODY_MODEL_CLASS)
        .ok,
    ).toBe(false);
  });

  test("rejects non-array collections, duplicate ids and malformed entity ids", () => {
    expect(
      validateModelInstance(
        instance({ entities: { bodies: body({ id: "a", mass: 1 }) as unknown as never[] } }),
        NBODY_MODEL_CLASS,
      ).ok,
    ).toBe(false);

    expect(
      validateModelInstance(
        instance({
          entities: { bodies: [body({ id: "a", mass: 1 }), body({ id: "a", mass: 2 })] },
        }),
        NBODY_MODEL_CLASS,
      ).ok,
    ).toBe(false);

    expect(
      validateModelInstance(
        instance({ entities: { bodies: [body({ id: "A", mass: 1 })] } }),
        NBODY_MODEL_CLASS,
      ).ok,
    ).toBe(false);
  });

  test("enforces the allocation bound exactly", () => {
    const max = NBODY_MODEL_CLASS.entities?.[0].maxEntities ?? 0;
    const within = Array.from({ length: max }, (_, index) => body({ id: `b_${index}`, mass: 1 }));
    expect(
      validateModelInstance(instance({ entities: { bodies: within } }), NBODY_MODEL_CLASS).ok,
    ).toBe(true);

    const over = Array.from({ length: max + 1 }, (_, index) => body({ id: `b_${index}`, mass: 1 }));
    expect(
      validateModelInstance(instance({ entities: { bodies: over } }), NBODY_MODEL_CLASS).ok,
    ).toBe(false);
  });

  test("requires finite per-entity quantities and positive mass", () => {
    expect(
      validateModelInstance(
        instance({ entities: { bodies: [{ id: "a", variables: { position: 0, velocity: 0 } }] } }),
        NBODY_MODEL_CLASS,
      ).ok,
    ).toBe(false);

    expect(
      validateModelInstance(
        instance({ entities: { bodies: [body({ id: "a", mass: 0 })] } }),
        NBODY_MODEL_CLASS,
      ).ok,
    ).toBe(false);

    expect(
      validateModelInstance(
        instance({ entities: { bodies: [body({ id: "a", mass: Number.NaN })] } }),
        NBODY_MODEL_CLASS,
      ).ok,
    ).toBe(false);
  });

  test("rejects non-finite positions and non-positive softening", () => {
    expect(
      validateModelInstance(
        instance({
          entities: { bodies: [body({ id: "a", mass: 1, position: Number.POSITIVE_INFINITY })] },
        }),
        NBODY_MODEL_CLASS,
      ).ok,
    ).toBe(false);

    expect(
      validateModelInstance(instance({ parameters: { softening: 0 } }), NBODY_MODEL_CLASS).ok,
    ).toBe(false);
  });
});

describe("generic fixed-step execution contract", () => {
  const timeModel = NBODY_MODEL_CLASS.timeModel;

  test("resolves a schedule and derives deterministic time", () => {
    const schedule = resolveFixedStepSchedule(timeModel, { steps: 4, dt: 0.5 });
    expect(schedule).toEqual({ steps: 4, dt: 0.5, maxSteps: timeModel.maxSteps });

    const history = executeFixedStep<number>({
      state: 0,
      schedule,
      advance: (state, context) => state + context.t + context.dt,
    });
    expect(history).toHaveLength(5);
  });

  test("returns steps + 1 states with start-of-step time", () => {
    const observed: Array<{ step: number; t: number }> = [];
    executeFixedStep<number>({
      state: 0,
      schedule: { steps: 3, dt: 1, maxSteps: 10 },
      advance: (state, context) => {
        observed.push({ step: context.step, t: context.t });
        return state + 1;
      },
    });
    expect(observed).toEqual([
      { step: 1, t: 0 },
      { step: 2, t: 1 },
      { step: 3, t: 2 },
    ]);
  });

  test("rejects out-of-budget and non-positive schedules", () => {
    const overBudget: FixedStepSchedule = {
      steps: timeModel.maxSteps + 1,
      dt: 0.1,
      maxSteps: timeModel.maxSteps,
    };
    expect(() =>
      executeFixedStep<number>({ state: 0, schedule: overBudget, advance: (s) => s }),
    ).toThrow();
    expect(() => resolveFixedStepSchedule(timeModel, { steps: 1, dt: 0 })).toThrow();
    expect(() => resolveFixedStepSchedule(timeModel, { steps: -1 })).toThrow();
    expect(() => resolveFixedStepSchedule(timeModel, {})).toThrow();
  });
});

describe("N-body Newtonian engine", () => {
  test("is deterministic across independent runs", () => {
    const a = run(instance({ steps: 200, dt: 0.005 }));
    const b = run(instance({ steps: 200, dt: 0.005 }));
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test("reports the initial observation plus one per step", () => {
    const history = run(instance({ steps: 5, dt: 0.25 }));
    expect(history).toHaveLength(6);
    expect(history[0]).toMatchObject({ step: 0, t: 0 });
    expect(history[5].step).toBe(5);
    expect(history[5].t).toBeCloseTo(1.25, 12);
  });

  test("softened gravitation stays finite when bodies coincide", () => {
    const coincident = instance({
      entities: {
        bodies: [body({ id: "a", mass: 1, position: 0 }), body({ id: "b", mass: 1, position: 0 })],
      },
    });
    const model = buildModel(coincident);
    const accelerations = computeAccelerations(createState(coincident, model).bodies, model);
    expect(accelerations).toEqual([0, 0]);
    const history = run(coincident, { steps: 10, dt: 0.01 });
    for (const observation of history) {
      expect(Number.isFinite(observation.observables.total_kinetic_energy)).toBe(true);
      for (const bodyObservation of observation.bodies) {
        expect(Number.isFinite(bodyObservation.acceleration)).toBe(true);
        expect(Number.isFinite(bodyObservation.net_force)).toBe(true);
      }
    }
  });

  test("a body's acceleration is independent of its own mass", () => {
    const base = instance({
      entities: {
        bodies: [body({ id: "a", mass: 1, position: -1 }), body({ id: "b", mass: 5, position: 1 })],
      },
    });
    const heavy = instance({
      entities: {
        bodies: [
          body({ id: "a", mass: 1000, position: -1 }),
          body({ id: "b", mass: 5, position: 1 }),
        ],
      },
    });
    const baseModel = buildModel(base);
    const heavyModel = buildModel(heavy);
    const a0 = createState(base, baseModel).accelerations[0];
    const a1 = createState(heavy, heavyModel).accelerations[0];
    expect(a0).toBeCloseTo(a1, 12);
  });

  test("net force is mass times acceleration and pairwise forces cancel", () => {
    const model = buildModel(instance());
    const observation = step(createState(instance(), model), model, 0.01);
    const [a, b] = observation.bodies.map((bodyState, index) => ({
      mass: bodyState.mass,
      acceleration: observation.accelerations[index],
    }));
    expect(a.mass * a.acceleration).toBeCloseTo(-(b.mass * b.acceleration), 12);
  });

  test("conserves total momentum for an isolated pair", () => {
    const history = run(instance({ steps: 400, dt: 0.005 }));
    for (const observation of history) {
      expect(observation.observables.total_momentum).toBeCloseTo(0, 10);
    }
    const first = history[0].observables.center_of_mass;
    expect(history[history.length - 1].observables.center_of_mass).toBeCloseTo(first, 10);
  });

  test("aggregate observables are consistent with per-body data", () => {
    const model = buildModel(instance());
    const state = createState(instance(), model);
    const observables = toObservables(state, model);
    expect(observables.total_kinetic_energy).toBeCloseTo(0, 12);
    expect(observables.center_of_mass).toBeCloseTo(0, 12);
    expect(observables.total_momentum).toBeCloseTo(0, 12);
  });

  test("step is pure and does not mutate its input", () => {
    const model = buildModel(instance());
    const before = createState(instance(), model);
    const snapshot = JSON.stringify(before);
    const after = step(before, model, 0.1);
    expect(JSON.stringify(before)).toBe(snapshot);
    expect(after.step).toBe(before.step + 1);
    expect(after.bodies[0]).not.toBe(before.bodies[0]);
  });

  test("rejects invalid instances, empty collections and out-of-budget runs", () => {
    expect(() => buildModel(instance({ parameters: { softening: 0 } }))).toThrow();
    expect(() => buildModel(instance({ entities: { bodies: [] } }))).toThrow();
    expect(() => buildModel(instance({ entities: {} }))).toThrow();
    expect(() => run(instance(), { steps: NBODY_MODEL_CLASS.timeModel.maxSteps + 1 })).toThrow();
    expect(() => run(instance(), { dt: 0 })).toThrow();
    expect(NBODY_ENGINE_VERSION).toBe("1.0.0");
  });
});
