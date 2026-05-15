// Calculator registry. Adding a new calculator: see AGENTS.md rule #4.
// Empty for now — calculators are added in US-007.

import type { CalculatorId, CalculatorTier, CalculatorMeta } from "@struct-flow/shared";
import type { ViewModel2D } from "@struct-flow/shared";
import type { z } from "zod";

export interface Calculator<I, R> {
  id: CalculatorId;
  version: string;
  tier: CalculatorTier;
  meta: CalculatorMeta;
  inputSchema: z.ZodType<I>;
  compute: (input: I) => R;
  toViewModel: (input: I, result: R) => ViewModel2D | null;
  // toMgt is intentionally absent in MVP (Phase 2).
}

export const calculators: Calculator<unknown, unknown>[] = [];

export function findCalculator(id: string): Calculator<unknown, unknown> | undefined {
  return calculators.find((c) => c.id === id);
}
