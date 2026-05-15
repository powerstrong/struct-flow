export type CalculatorId =
  | "concrete-volume"
  | "rebar-weight"
  | "simple-beam-deflection"
  | "footing-bearing";

export type CalculatorTier = "free" | "pro";

export interface CalculatorMeta {
  title: string;
  description: string;
  assumptions: string[];
  cautions: string[];
}

export interface CalculatorSummary {
  id: CalculatorId;
  version: string;
  tier: CalculatorTier;
  meta: CalculatorMeta;
}

export const CALCULATOR_IDS: readonly CalculatorId[] = [
  "concrete-volume",
  "rebar-weight",
  "simple-beam-deflection",
  "footing-bearing",
] as const;

export function isCalculatorId(value: unknown): value is CalculatorId {
  return typeof value === "string" && (CALCULATOR_IDS as readonly string[]).includes(value);
}
