// Rebar total weight: unit_weight (kg/m) × length (m) × count.
// Pure function.

import { UNIT_WEIGHT_KG_PER_M, type RebarWeightInput } from "./input";

export interface RebarWeightResult {
  unitWeightKgPerM: number;
  perBarWeightKg: number;
  totalWeightKg: number;
  totalLengthM: number;
}

export function compute(input: RebarWeightInput): RebarWeightResult {
  const unit = UNIT_WEIGHT_KG_PER_M[input.grade];
  const perBar = unit * input.lengthM;
  return {
    unitWeightKgPerM: unit,
    perBarWeightKg: perBar,
    totalWeightKg: perBar * input.count,
    totalLengthM: input.lengthM * input.count,
  };
}
