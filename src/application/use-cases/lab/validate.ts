import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";
import { assertAiEntitlement } from "@/application/services/entitlement-guard";
import type { AppDependencies } from "@/application/contracts/dependencies";
import {
  validateModelClassSpec,
  validateModelInstance,
  type ValidationResult,
} from "@/domain/lab/validation";
import type { ModelClassSpec } from "@/domain/lab/model-class";
import { validateExpression, type ExpressionLimits } from "@/domain/lab/expression";

/**
 * Validates an untrusted model-class spec against the Phase-4 Labs domain
 * contract. Deterministic, fail-closed: invalid input yields structured issues
 * rather than throwing. No `eval`, no `new Function`, no wall clock, no
 * randomness — the domain guarantees this and this edge widens nothing.
 */
async function assertLabsScope(deps: AppDependencies, userId: string): Promise<void> {
  await assertAiEntitlement(deps.entitlement, userId, "labs");
}

const ModelClassSpecSchema = z.unknown();

const ValidateModelClassInput = z.object({
  spec: ModelClassSpecSchema,
});

export const validateModelClassFn = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => ValidateModelClassInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertLabsScope(context.deps, context.userId);
    return validateModelClassSpec(data.spec);
  });

const ValidateModelInstanceInput = z.object({
  spec: z.unknown(),
  instance: z.unknown(),
});

export const validateModelInstanceFn = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => ValidateModelInstanceInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertLabsScope(context.deps, context.userId);
    const specResult = validateModelClassSpec(data.spec);
    if (!specResult.ok) return specResult;
    return validateModelInstance(data.instance, data.spec as ModelClassSpec) as ValidationResult;
  });

const ExpressionLimitsSchema = z
  .object({
    maxDepth: z.number().int().positive(),
    maxNodes: z.number().int().positive(),
  })
  .optional();

const ValidateExpressionInput = z.object({
  expression: z.unknown(),
  limits: ExpressionLimitsSchema,
  allowedVariables: z.array(z.string()).optional(),
});

export const validateExpressionFn = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => ValidateExpressionInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertLabsScope(context.deps, context.userId);
    return validateExpression(data.expression, data.limits, data.allowedVariables);
  });
