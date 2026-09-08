/**
 * Re-exports from the Application Layer.
 *
 * This file preserves backward compatibility for existing consumers
 * that import from @/lib/sim-lab.functions.
 *
 * All application logic now lives in:
 *   src/application/use-cases/simulation/lab.ts
 */
export {
  SimulationSchema,
  embedPrompt,
  findSimilarSimulation,
  generateSimulationSchema,
  saveSimulation,
  listSimulations,
  deleteSimulation,
} from "@/application/use-cases/simulation/lab";
export type { SimulationSchemaT } from "@/application/use-cases/simulation/lab";
