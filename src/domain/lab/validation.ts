/**
 * Deterministic validation for the Model-Class contract.
 *
 * Pure and side-effect free: no `eval`, no `new Function`, no wall clock, no
 * randomness. Validation is total — invalid input yields structured issues
 * rather than throwing.
 */
import type {
  ConstraintKind,
  EntityCollectionSpec,
  EntityRecord,
  ModelClassSpec,
  ModelInstance,
  QuantityKind,
  QuantitySpec,
  RelationshipSpec,
} from "./model-class";
import { validateExpression, type ExpressionLimits } from "./expression";
import { isFiniteNumber, isRecord } from "./guards";

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult = { ok: true } | { ok: false; issues: ValidationIssue[] };

const BASE_DIMENSIONS = new Set(["L", "T", "M", "K", "I", "N", "J"]);
const QUANTITY_KINDS: readonly QuantityKind[] = ["variable", "parameter", "constant"];
const CONSTRAINT_KINDS: readonly ConstraintKind[] = [
  "finite",
  "positive",
  "non-negative",
  "bounded",
];
const INTEGRATORS = new Set(["euler"]);

const ID_RE = /^[a-z][a-z0-9_]*$/;
const MODEL_CLASS_ID_RE = /^[a-z][a-z0-9]*(\.[a-z0-9]+)+$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

const SUBJECT_LEVEL_KEYS = new Set([
  "subject",
  "subjects",
  "level",
  "levels",
  "grade",
  "grades",
  "curriculum",
  "engine",
  "engines",
]);

/**
 * Parse a dimensional signature into base-dimension exponents. Returns `null`
 * for anything that is not a well-formed signature. `dimensionless` and `1`
 * produce an empty map.
 */
export function parseDimension(input: string): Map<string, number> | null {
  const raw = input.trim();
  if (raw === "" || raw === "dimensionless" || raw === "1") return new Map();

  const slash = raw.indexOf("/");
  if (slash !== -1 && raw.indexOf("/", slash + 1) !== -1) return null;
  const numerator = slash === -1 ? raw : raw.slice(0, slash);
  const denominator = slash === -1 ? "" : raw.slice(slash + 1);

  const exponents = new Map<string, number>();
  const add = (expression: string, sign: number): boolean => {
    if (expression === "") return false;
    for (const factor of expression.split("*")) {
      if (factor === "") return false;
      const match = /^([A-Za-z]+)(?:\^(-?\d+))?$/.exec(factor);
      if (!match) return false;
      const base = match[1];
      if (!BASE_DIMENSIONS.has(base)) return false;
      const exponent = match[2] === undefined ? 1 : Number(match[2]);
      if (!Number.isInteger(exponent)) return false;
      exponents.set(base, (exponents.get(base) ?? 0) + sign * exponent);
    }
    return true;
  };

  if (!add(numerator, 1)) return null;
  if (denominator !== "" && !add(denominator, -1)) return null;

  for (const [base, exponent] of exponents) {
    if (exponent === 0) exponents.delete(base);
  }
  return exponents;
}

function dimensionsEqual(a: Map<string, number>, b: Map<string, number>): boolean {
  if (a.size !== b.size) return false;
  for (const [base, exponent] of a) {
    if (b.get(base) !== exponent) return false;
  }
  return true;
}

function validateUnit(unit: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(unit)) {
    issues.push({ path, message: "unit must be an object" });
    return;
  }
  if (typeof unit.symbol !== "string" || unit.symbol.trim() === "") {
    issues.push({ path: `${path}.symbol`, message: "unit.symbol must be a non-empty string" });
  }
  if (typeof unit.dimension !== "string") {
    issues.push({ path: `${path}.dimension`, message: "unit.dimension must be a string" });
    return;
  }
  if (parseDimension(unit.dimension) === null) {
    issues.push({
      path: `${path}.dimension`,
      message: `malformed dimensional signature "${unit.dimension}"`,
    });
  }
}

function validateQuantity(
  quantity: unknown,
  path: string,
  issues: ValidationIssue[],
): QuantitySpec | null {
  if (!isRecord(quantity)) {
    issues.push({ path, message: "quantity must be an object" });
    return null;
  }
  if (typeof quantity.id !== "string" || !ID_RE.test(quantity.id)) {
    issues.push({ path: `${path}.id`, message: "quantity id must be snake_case" });
  }
  if (
    typeof quantity.kind !== "string" ||
    !QUANTITY_KINDS.includes(quantity.kind as QuantityKind)
  ) {
    issues.push({
      path: `${path}.kind`,
      message: `quantity kind must be one of ${QUANTITY_KINDS.join(", ")}`,
    });
  }
  validateUnit(quantity.unit, `${path}.unit`, issues);
  if (quantity.initial !== undefined && !isFiniteNumber(quantity.initial)) {
    issues.push({ path: `${path}.initial`, message: "initial must be a finite number" });
  }
  for (const bound of ["min", "max"] as const) {
    if (quantity[bound] !== undefined && !isFiniteNumber(quantity[bound])) {
      issues.push({ path: `${path}.${bound}`, message: `${bound} must be a finite number` });
    }
  }
  if (isFiniteNumber(quantity.min) && isFiniteNumber(quantity.max) && quantity.min > quantity.max) {
    issues.push({ path, message: "min must not exceed max" });
  }
  return quantity as unknown as QuantitySpec;
}

function validateConstraint(
  constraint: unknown,
  path: string,
  quantityIds: Set<string>,
  issueList: ValidationIssue[],
): void {
  if (!isRecord(constraint)) {
    issueList.push({ path, message: "constraint must be an object" });
    return;
  }
  if (typeof constraint.id !== "string" || !ID_RE.test(constraint.id)) {
    issueList.push({ path: `${path}.id`, message: "constraint id must be snake_case" });
  }
  if (typeof constraint.quantityId !== "string" || !quantityIds.has(constraint.quantityId)) {
    issueList.push({
      path: `${path}.quantityId`,
      message: "constraint must reference a declared quantity",
    });
  }
  if (
    typeof constraint.kind !== "string" ||
    !CONSTRAINT_KINDS.includes(constraint.kind as ConstraintKind)
  ) {
    issueList.push({
      path: `${path}.kind`,
      message: `constraint kind must be one of ${CONSTRAINT_KINDS.join(", ")}`,
    });
  }
}

function validateObservable(observable: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(observable)) {
    issues.push({ path, message: "observable must be an object" });
    return;
  }
  if (typeof observable.id !== "string" || !ID_RE.test(observable.id)) {
    issues.push({ path: `${path}.id`, message: "observable id must be snake_case" });
  }
  validateUnit(observable.unit, `${path}.unit`, issues);
}

/**
 * Validate one entity-collection declaration. Returns the collection id when it
 * is a usable string, otherwise `null`.
 */
function validateEntityCollection(
  collection: unknown,
  path: string,
  issues: ValidationIssue[],
): string | null {
  if (!isRecord(collection)) {
    issues.push({ path, message: "entity collection must be an object" });
    return null;
  }
  if (typeof collection.id !== "string" || !ID_RE.test(collection.id)) {
    issues.push({ path: `${path}.id`, message: "entity collection id must be snake_case" });
  }
  if (
    !isFiniteNumber(collection.maxEntities) ||
    !Number.isInteger(collection.maxEntities) ||
    collection.maxEntities <= 0
  ) {
    issues.push({
      path: `${path}.maxEntities`,
      message: "maxEntities must be a positive integer",
    });
  }

  const entityQuantityIds = new Set<string>();
  if (!Array.isArray(collection.quantities) || collection.quantities.length === 0) {
    issues.push({
      path: `${path}.quantities`,
      message: "entity quantities must be a non-empty array",
    });
  } else {
    collection.quantities.forEach((quantity, index) => {
      const parsed = validateQuantity(quantity, `${path}.quantities[${index}]`, issues);
      if (parsed && typeof parsed.id === "string") {
        if (entityQuantityIds.has(parsed.id)) {
          issues.push({
            path: `${path}.quantities[${index}].id`,
            message: "duplicate entity quantity id",
          });
        }
        entityQuantityIds.add(parsed.id);
      }
    });
  }

  if (collection.constraints !== undefined) {
    if (!Array.isArray(collection.constraints)) {
      issues.push({ path: `${path}.constraints`, message: "entity constraints must be an array" });
    } else {
      const constraintIds = new Set<string>();
      collection.constraints.forEach((constraint, index) => {
        validateConstraint(constraint, `${path}.constraints[${index}]`, entityQuantityIds, issues);
        if (isRecord(constraint) && typeof constraint.id === "string") {
          if (constraintIds.has(constraint.id)) {
            issues.push({
              path: `${path}.constraints[${index}].id`,
              message: "duplicate constraint id",
            });
          }
          constraintIds.add(constraint.id);
        }
      });
    }
  }

  return typeof collection.id === "string" ? collection.id : null;
}

/**
 * Validate a single entity record against its collection. Returns the entity id
 * when it is a usable string, otherwise `null`.
 */
function validateEntityRecord(
  record: unknown,
  collection: EntityCollectionSpec,
  path: string,
  issues: ValidationIssue[],
): string | null {
  if (!isRecord(record)) {
    issues.push({ path, message: "entity record must be an object" });
    return null;
  }
  if (typeof record.id !== "string" || !ID_RE.test(record.id)) {
    issues.push({ path: `${path}.id`, message: "entity id must be snake_case" });
  }

  for (const [label, value] of [
    ["variables", record.variables],
    ["parameters", record.parameters],
    ["constants", record.constants],
  ] as const) {
    if (value !== undefined && !isRecord(value)) {
      issues.push({ path: `${path}.${label}`, message: `${label} must be an object` });
    }
  }

  const quantityById = new Map<string, QuantitySpec>();
  for (const quantity of collection.quantities) quantityById.set(quantity.id, quantity);

  const suppliedValues: Record<QuantityKind, Record<string, unknown> | undefined> = {
    variable: isRecord(record.variables) ? record.variables : undefined,
    parameter: isRecord(record.parameters) ? record.parameters : undefined,
    constant: isRecord(record.constants) ? record.constants : undefined,
  };
  for (const [kind, supplied] of Object.entries(suppliedValues) as [
    QuantityKind,
    Record<string, unknown> | undefined,
  ][]) {
    if (!supplied) continue;
    for (const key of Object.keys(supplied)) {
      const quantity = quantityById.get(key);
      if (!quantity || quantity.kind !== kind) {
        issues.push({
          path: `${path}.${kind === "variable" ? "variables" : `${kind}s`}.${key}`,
          message: "unknown entity quantity",
        });
      }
    }
  }

  const values = new Map<string, number>();
  for (const quantity of collection.quantities) {
    const value = effectiveValue(record as unknown as ValueSource, quantity);
    if (!isFiniteNumber(value)) {
      issues.push({
        path: `${path}.quantity.${quantity.id}`,
        message: `a finite value is required for ${quantity.kind} "${quantity.id}"`,
      });
      continue;
    }
    if (quantity.min !== undefined && value < quantity.min) {
      issues.push({ path: `${path}.quantity.${quantity.id}`, message: "value is below min" });
    }
    if (quantity.max !== undefined && value > quantity.max) {
      issues.push({ path: `${path}.quantity.${quantity.id}`, message: "value is above max" });
    }
    values.set(quantity.id, value);
  }

  for (const constraint of collection.constraints ?? []) {
    const value = values.get(constraint.quantityId);
    const quantity = quantityById.get(constraint.quantityId);
    if (value === undefined || !quantity) continue;
    validateValueAgainstConstraint(
      value,
      quantity,
      constraint,
      `${path}.constraint.${constraint.id}`,
      issues,
    );
  }

  return typeof record.id === "string" ? record.id : null;
}

export function validateModelClassSpec(spec: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(spec)) {
    return { ok: false, issues: [{ path: "", message: "model class spec must be an object" }] };
  }

  if (typeof spec.id !== "string" || !MODEL_CLASS_ID_RE.test(spec.id)) {
    issues.push({
      path: "id",
      message: "model class id must be a dotted lowercase identifier",
    });
  }
  if (typeof spec.version !== "string" || !SEMVER_RE.test(spec.version)) {
    issues.push({ path: "version", message: "version must be a semantic version" });
  }
  if (spec.subjectNeutral !== true) {
    issues.push({ path: "subjectNeutral", message: "subjectNeutral must be the literal true" });
  }
  for (const key of Object.keys(spec)) {
    if (SUBJECT_LEVEL_KEYS.has(key) || /Engine$/.test(key)) {
      issues.push({
        path: key,
        message: `key "${key}" would bind the model class to a subject/level/engine`,
      });
    }
  }

  const quantityIds = new Set<string>();
  if (!Array.isArray(spec.quantities) || spec.quantities.length === 0) {
    issues.push({ path: "quantities", message: "quantities must be a non-empty array" });
  } else {
    spec.quantities.forEach((quantity, index) => {
      const parsed = validateQuantity(quantity, `quantities[${index}]`, issues);
      if (parsed && typeof parsed.id === "string") {
        if (quantityIds.has(parsed.id)) {
          issues.push({ path: `quantities[${index}].id`, message: "duplicate quantity id" });
        }
        quantityIds.add(parsed.id);
      }
    });
  }

  const constraintIds = new Set<string>();
  if (!Array.isArray(spec.constraints)) {
    issues.push({ path: "constraints", message: "constraints must be an array" });
  } else {
    spec.constraints.forEach((constraint, index) => {
      validateConstraint(constraint, `constraints[${index}]`, quantityIds, issues);
      if (isRecord(constraint) && typeof constraint.id === "string") {
        if (constraintIds.has(constraint.id)) {
          issues.push({ path: `constraints[${index}].id`, message: "duplicate constraint id" });
        }
        constraintIds.add(constraint.id);
      }
    });
  }

  const observableIds = new Set<string>();
  if (!Array.isArray(spec.observables) || spec.observables.length === 0) {
    issues.push({ path: "observables", message: "observables must be a non-empty array" });
  } else {
    spec.observables.forEach((observable, index) => {
      validateObservable(observable, `observables[${index}]`, issues);
      if (isRecord(observable) && typeof observable.id === "string") {
        if (observableIds.has(observable.id)) {
          issues.push({ path: `observables[${index}].id`, message: "duplicate observable id" });
        }
        observableIds.add(observable.id);
      }
    });
  }

  if (spec.entities !== undefined) {
    if (!Array.isArray(spec.entities)) {
      issues.push({
        path: "entities",
        message: "entities must be an array of entity collections",
      });
    } else {
      const entityCollectionIds = new Set<string>();
      spec.entities.forEach((collection, index) => {
        const id = validateEntityCollection(collection, `entities[${index}]`, issues);
        if (id !== null) {
          if (entityCollectionIds.has(id)) {
            issues.push({
              path: `entities[${index}].id`,
              message: "duplicate entity collection id",
            });
          }
          entityCollectionIds.add(id);
        }
      });
    }
  }

  if (spec.relationships !== undefined) {
    if (!Array.isArray(spec.relationships)) {
      issues.push({
        path: "relationships",
        message: "relationships must be an array of relationship specs",
      });
    } else {
      const relationshipIds = new Set<string>();
      spec.relationships.forEach((relationship, index) => {
        const path = `relationships[${index}]`;
        if (!isRecord(relationship)) {
          issues.push({ path, message: "relationship must be an object" });
          return;
        }
        if (typeof relationship.id !== "string" || !ID_RE.test(relationship.id)) {
          issues.push({ path: `${path}.id`, message: "relationship id must be snake_case" });
        } else {
          if (relationshipIds.has(relationship.id)) {
            issues.push({ path: `${path}.id`, message: "duplicate relationship id" });
          }
          relationshipIds.add(relationship.id);
        }
        if (typeof relationship.target !== "string" || !quantityIds.has(relationship.target)) {
          issues.push({
            path: `${path}.target`,
            message: "relationship target must reference a declared quantity",
          });
        }
        if (relationship.formula === undefined) {
          issues.push({ path: `${path}.formula`, message: "relationship formula is required" });
        } else {
          const expressionLimits: ExpressionLimits | undefined = isRecord(spec.expressionLimits)
            ? (spec.expressionLimits as unknown as ExpressionLimits)
            : undefined;
          const expressionResult = validateExpression(relationship.formula, expressionLimits, [
            ...quantityIds,
            "t",
          ]);
          if (!expressionResult.ok) {
            expressionResult.issues.forEach((expressionIssue) => {
              issues.push({
                path: `${path}.formula${expressionIssue.path ?? ""}`,
                message: expressionIssue.message,
              });
            });
          }
        }
      });
    }
  }
  if (spec.expressionLimits !== undefined) {
    if (!isRecord(spec.expressionLimits)) {
      issues.push({ path: "expressionLimits", message: "expressionLimits must be an object" });
    } else {
      if (
        !isFiniteNumber(spec.expressionLimits.maxDepth) ||
        !Number.isInteger(spec.expressionLimits.maxDepth) ||
        spec.expressionLimits.maxDepth <= 0
      ) {
        issues.push({
          path: "expressionLimits.maxDepth",
          message: "expressionLimits.maxDepth must be a positive integer",
        });
      }
      if (
        !isFiniteNumber(spec.expressionLimits.maxNodes) ||
        !Number.isInteger(spec.expressionLimits.maxNodes) ||
        spec.expressionLimits.maxNodes <= 0
      ) {
        issues.push({
          path: "expressionLimits.maxNodes",
          message: "expressionLimits.maxNodes must be a positive integer",
        });
      }
    }
  }

  if (!isRecord(spec.timeModel)) {
    issues.push({ path: "timeModel", message: "timeModel must be an object" });
  } else {
    if (spec.timeModel.kind !== "fixed-step") {
      issues.push({ path: "timeModel.kind", message: 'timeModel.kind must be "fixed-step"' });
    }
    if (!isFiniteNumber(spec.timeModel.defaultDt) || spec.timeModel.defaultDt <= 0) {
      issues.push({
        path: "timeModel.defaultDt",
        message: "defaultDt must be a finite number greater than zero",
      });
    }
    if (
      !isFiniteNumber(spec.timeModel.maxSteps) ||
      !Number.isInteger(spec.timeModel.maxSteps) ||
      spec.timeModel.maxSteps <= 0
    ) {
      issues.push({
        path: "timeModel.maxSteps",
        message: "maxSteps must be a positive integer",
      });
    }
  }

  if (typeof spec.integrator !== "string" || !INTEGRATORS.has(spec.integrator)) {
    issues.push({
      path: "integrator",
      message: `integrator must be one of ${[...INTEGRATORS].join(", ")}`,
    });
  }

  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}

/** Any value-bearing record: a top-level instance or an entity within it. */
interface ValueSource {
  variables?: Record<string, number>;
  parameters?: Record<string, number>;
  constants?: Record<string, number>;
}

function effectiveValue(source: ValueSource, quantity: QuantitySpec): number | undefined {
  if (quantity.kind === "variable") {
    const supplied = source.variables?.[quantity.id];
    if (supplied !== undefined) return supplied;
    return quantity.initial;
  }
  if (quantity.kind === "parameter") {
    return source.parameters?.[quantity.id];
  }
  return source.constants?.[quantity.id];
}

function validateValueAgainstConstraint(
  value: number,
  quantity: QuantitySpec,
  constraint: { kind: ConstraintKind; id: string; quantityId: string },
  path: string,
  issues: ValidationIssue[],
): void {
  if (constraint.kind === "positive" && !(value > 0)) {
    issues.push({ path, message: `constraint "${constraint.id}" requires > 0` });
  }
  if (constraint.kind === "non-negative" && !(value >= 0)) {
    issues.push({ path, message: `constraint "${constraint.id}" requires >= 0` });
  }
  if (constraint.kind === "bounded") {
    if (
      (quantity.min !== undefined && value < quantity.min) ||
      (quantity.max !== undefined && value > quantity.max)
    ) {
      issues.push({ path, message: `constraint "${constraint.id}" requires value within bounds` });
    }
  }
}

export function validateModelInstance(instance: unknown, spec: ModelClassSpec): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(instance)) {
    return { ok: false, issues: [{ path: "", message: "instance must be an object" }] };
  }

  if (instance.modelClassId !== spec.id) {
    issues.push({
      path: "modelClassId",
      message: `instance modelClassId must equal "${spec.id}"`,
    });
  }
  if (instance.modelClassVersion !== undefined && instance.modelClassVersion !== spec.version) {
    issues.push({
      path: "modelClassVersion",
      message: `instance modelClassVersion must equal "${spec.version}"`,
    });
  }

  const variables = instance.variables;
  const parameters = instance.parameters;
  const constants = instance.constants;
  for (const [label, value] of [
    ["variables", variables],
    ["parameters", parameters],
    ["constants", constants],
  ] as const) {
    if (value !== undefined && !isRecord(value)) {
      issues.push({ path: label, message: `${label} must be an object` });
    }
  }

  const kindById = new Map<string, QuantitySpec>();
  for (const quantity of spec.quantities) kindById.set(quantity.id, quantity);

  const suppliedKeys: Record<QuantityKind, Record<string, unknown> | undefined> = {
    variable: isRecord(variables) ? variables : undefined,
    parameter: isRecord(parameters) ? parameters : undefined,
    constant: isRecord(constants) ? constants : undefined,
  };

  for (const [kind, supplied] of Object.entries(suppliedKeys) as [
    QuantityKind,
    Record<string, unknown> | undefined,
  ][]) {
    if (!supplied) continue;
    for (const key of Object.keys(supplied)) {
      const quantity = kindById.get(key);
      if (!quantity || quantity.kind !== kind) {
        issues.push({
          path: `${kind === "variable" ? "variables" : `${kind}s`}.${key}`,
          message: "unknown quantity",
        });
      }
    }
  }

  const values = new Map<string, number>();
  for (const quantity of spec.quantities) {
    const value = effectiveValue(instance as unknown as ValueSource, quantity);
    if (!isFiniteNumber(value)) {
      issues.push({
        path: `quantity.${quantity.id}`,
        message: `a finite value is required for ${quantity.kind} "${quantity.id}"`,
      });
      continue;
    }
    if (quantity.min !== undefined && value < quantity.min) {
      issues.push({ path: `quantity.${quantity.id}`, message: `value is below min` });
    }
    if (quantity.max !== undefined && value > quantity.max) {
      issues.push({ path: `quantity.${quantity.id}`, message: `value is above max` });
    }
    values.set(quantity.id, value);
  }

  for (const constraint of spec.constraints) {
    const value = values.get(constraint.quantityId);
    const quantity = kindById.get(constraint.quantityId);
    if (value === undefined || !quantity) continue;
    validateValueAgainstConstraint(
      value,
      quantity,
      constraint,
      `constraint.${constraint.id}`,
      issues,
    );
  }

  const suppliedEntities = instance.entities;
  if (suppliedEntities !== undefined && !isRecord(suppliedEntities)) {
    issues.push({ path: "entities", message: "entities must be an object keyed by collection id" });
  } else {
    const declaredCollections = new Map<string, EntityCollectionSpec>();
    for (const collection of spec.entities ?? [])
      declaredCollections.set(collection.id, collection);

    if (isRecord(suppliedEntities)) {
      for (const key of Object.keys(suppliedEntities)) {
        if (!declaredCollections.has(key)) {
          issues.push({ path: `entities.${key}`, message: "unknown entity collection" });
        }
      }
    }

    for (const collection of spec.entities ?? []) {
      const supplied = isRecord(suppliedEntities) ? suppliedEntities[collection.id] : undefined;
      if (supplied === undefined) continue;
      if (!Array.isArray(supplied)) {
        issues.push({
          path: `entities.${collection.id}`,
          message: "entity collection must be an array",
        });
        continue;
      }
      if (supplied.length > collection.maxEntities) {
        issues.push({
          path: `entities.${collection.id}`,
          message: `entity count must not exceed maxEntities (${collection.maxEntities})`,
        });
      }
      const entityIds = new Set<string>();
      supplied.forEach((record, index) => {
        const id = validateEntityRecord(
          record,
          collection,
          `entities.${collection.id}[${index}]`,
          issues,
        );
        if (id !== null) {
          if (entityIds.has(id)) {
            issues.push({
              path: `entities.${collection.id}[${index}].id`,
              message: "duplicate entity id",
            });
          }
          entityIds.add(id);
        }
      });
    }
  }

  if (!isFiniteNumber(instance.steps) || !Number.isInteger(instance.steps) || instance.steps <= 0) {
    issues.push({ path: "steps", message: "steps must be a positive integer" });
  } else if (instance.steps > spec.timeModel.maxSteps) {
    issues.push({
      path: "steps",
      message: `steps must not exceed maxSteps (${spec.timeModel.maxSteps})`,
    });
  }
  if (instance.dt !== undefined && (!isFiniteNumber(instance.dt) || instance.dt <= 0)) {
    issues.push({ path: "dt", message: "dt must be a finite number greater than zero" });
  }

  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}

/** Exposed for engine unit tests: compare two dimensional signatures. */
export function dimensionSignature(input: string): string | null {
  const parsed = parseDimension(input);
  if (parsed === null) return null;
  return [...parsed.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([base, exponent]) => `${base}^${exponent}`)
    .join("*");
}

export function dimensionSignaturesEqual(a: string, b: string): boolean {
  const parsedA = parseDimension(a);
  const parsedB = parseDimension(b);
  if (parsedA === null || parsedB === null) return false;
  return dimensionsEqual(parsedA, parsedB);
}
