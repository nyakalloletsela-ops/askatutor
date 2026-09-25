/**
 * Model-Class contract — a subject-neutral, renderer-independent description of a
 * quantitative model that can be executed deterministically.
 *
 * This is an additive reference contract for the Virtual Lab target architecture.
 * The existing `SimulationSchema` / `lab3d/physics.ts` presentation path is
 * unchanged and does not import this module.
 *
 * Scope discipline:
 *  - Model classes describe the *system being modelled*, never a curriculum
 *    subject or level. `subjectNeutral` is required to be the literal `true`.
 *  - Expressions are statically validated ASTs (see `expression.ts`) — they
 *    carry no executable code and are never evaluated in this phase.
 */
import type { ExpressionLimits, ExpressionNode } from "./expression";

export type QuantityKind = "variable" | "parameter" | "constant";

/**
 * Dimensional signature. Either a base dimension (`L`, `T`, `M`, `K`, `I`, `N`,
 * `J`), `dimensionless`, or a product/quotient such as `M*L/T^2`.
 */
export type Dimension = string;

export interface UnitSpec {
  /** Human-readable symbol, e.g. `"m"`, `"m/s"`, `"N"`. */
  symbol: string;
  /** Dimensional signature, e.g. `"L"`, `"L/T"`, `"M*L/T^2"`, `"dimensionless"`. */
  dimension: Dimension;
}

export interface QuantitySpec {
  /** snake_case identifier, unique within the model class. */
  id: string;
  kind: QuantityKind;
  unit: UnitSpec;
  /** Declared default for a `variable`; an instance may override it. */
  initial?: number;
  min?: number;
  max?: number;
}

export type ConstraintKind = "finite" | "positive" | "non-negative" | "bounded";

export interface ConstraintSpec {
  id: string;
  /** Quantity this constraint applies to. Must resolve within the model class. */
  quantityId: string;
  kind: ConstraintKind;
}

export interface ObservableSpec {
  id: string;
  unit: UnitSpec;
}

/**
 * A homogeneous, variable-cardinality collection of entities (for example
 * bodies, particles, nodes). Entity collections are the generic mechanism for
 * models whose state is not a fixed set of scalars; they exist so the contract
 * stays subject-neutral rather than growing per-domain fields.
 *
 * `maxEntities` is an explicit allocation bound. It keeps execution cost
 * finite and deterministic (work is bounded by `maxEntities` x `steps`) and is
 * declared by the model class, never inferred from an instance.
 */
export interface EntityCollectionSpec {
  /** snake_case identifier, unique within the model class. */
  id: string;
  /** Strict upper bound on the number of entities an instance may allocate. */
  maxEntities: number;
  /** Per-entity quantities. Reuses the flat `QuantitySpec` shape. */
  quantities: QuantitySpec[];
  /** Optional constraints over the per-entity quantities. */
  constraints?: ConstraintSpec[];
}

/**
 * A derived relationship: a formula that computes the value of `target` from
 * other declared quantities. The formula is a statically validated expression
 * AST — it is never executed in this phase. `target` must name a declared
 * quantity of the model class.
 */
export interface RelationshipSpec {
  /** snake_case identifier, unique within the model class. */
  id: string;
  /** Quantity id this relationship computes. Must be declared. */
  target: string;
  /** Formula over declared quantity ids and `t`. Never evaluated here. */
  formula: ExpressionNode;
  /** Optional human-readable description. */
  description?: string;
}

export interface TimeModelSpec {
  /** Explicit, deterministic time only. No wall clock is ever consulted. */
  kind: "fixed-step";
  defaultDt: number;
  maxSteps: number;
}

/** Closed allowlist of integrators. Extended deliberately in a later phase. */
export type IntegratorId = "euler";

export interface ModelClassSpec {
  /** Reverse-domain identifier, e.g. `"physics.mechanics.1d.newton2"`. */
  id: string;
  /** Semantic version of the model class definition. */
  version: string;
  /** Required literal `true`: model classes must not be subject- or level-bound. */
  subjectNeutral: true;
  quantities: QuantitySpec[];
  constraints: ConstraintSpec[];
  observables: ObservableSpec[];
  /**
   * Optional variable-cardinality entity collections. Omitted for models whose
   * state is a fixed set of scalars (e.g. 1-D Newton's second law).
   */
  entities?: EntityCollectionSpec[];
  /**
   * Optional derived-relationship formulas. Each targets a declared quantity
   * and uses a statically validated expression AST.
   */
  relationships?: RelationshipSpec[];
  /** Optional structural bounds for the above formulas. */
  expressionLimits?: ExpressionLimits;
  timeModel: TimeModelSpec;
  integrator: IntegratorId;
}

/**
 * A subject-neutral instance of a model class: the concrete inputs an execution
 * needs. Variable values override the model class defaults; parameters and
 * constants have no defaults and must be supplied when the class declares them.
 */
/**
 * A single entity within an entity collection. Identity is an explicit,
 * stable `id` so ordering and observation stay deterministic across executions.
 */
export interface EntityRecord {
  id: string;
  variables?: Record<string, number>;
  parameters?: Record<string, number>;
  constants?: Record<string, number>;
}

export interface ModelInstance {
  modelClassId: string;
  modelClassVersion?: string;
  variables?: Record<string, number>;
  parameters: Record<string, number>;
  constants?: Record<string, number>;
  /**
   * Concrete entity allocations, keyed by `EntityCollectionSpec.id`. Each
   * array length must not exceed the collection's `maxEntities`.
   */
  entities?: Record<string, EntityRecord[]>;
  /** Number of fixed steps to execute. Never derived from a clock. */
  steps: number;
  /** Optional step size; falls back to the model class `defaultDt`. */
  dt?: number;
}

export interface ModelClassRegistry {
  get(id: string, version?: string): ModelClassSpec | undefined;
  list(): readonly ModelClassSpec[];
}

export function createModelClassRegistry(specs: readonly ModelClassSpec[]): ModelClassRegistry {
  const byId = new Map<string, ModelClassSpec[]>();
  for (const spec of specs) {
    const bucket = byId.get(spec.id);
    if (bucket) bucket.push(spec);
    else byId.set(spec.id, [spec]);
  }
  return {
    get(id, version) {
      const bucket = byId.get(id);
      if (!bucket || bucket.length === 0) return undefined;
      if (version === undefined) return bucket[0];
      return bucket.find((spec) => spec.version === version);
    },
    list() {
      return specs;
    },
  };
}
