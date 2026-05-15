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
  // ZodType with `Input = unknown` so schemas with `.default()` (Input has optional) still fit.
  inputSchema: z.ZodType<I, z.ZodTypeDef, unknown>;
  compute: (input: I) => R;
  toViewModel: (input: I, result: R) => ViewModel2D | null;
  // toMgt is intentionally absent in MVP (Phase 2).
}

import { concreteVolume } from "./concrete-volume";
import { rebarWeight } from "./rebar-weight";
import { simpleBeamDeflection } from "./simple-beam-deflection";
import { footingBearing } from "./footing-bearing";

// Order matters for UI listing: free first, then pro.
export const calculators: Calculator<unknown, unknown>[] = [
  concreteVolume as Calculator<unknown, unknown>,
  rebarWeight as Calculator<unknown, unknown>,
  simpleBeamDeflection as Calculator<unknown, unknown>,
  footingBearing as Calculator<unknown, unknown>,
];

export function findCalculator(id: string): Calculator<unknown, unknown> | undefined {
  return calculators.find((c) => c.id === id);
}
