// Simply-supported beam mid-span deflection.
//   UDL:        δ = 5 w L^4 / (384 EI)
//   Point mid:  δ = P L^3 / (48 EI)
// Units: L [m], EI [kN·m²], w [kN/m], P [kN]. Result δ [mm].
// Pure function.

import type { BeamDeflectionInput } from "./input";

export interface BeamDeflectionResult {
  deflectionMm: number;
  maxMomentKNm: number;
  /** Span/deflection ratio (L/δ). Higher = stiffer. */
  spanOverDeflection: number;
  /** Common service limit reference (L/360 → if ratio > 360 the beam is within typical limit). */
  withinL360: boolean;
}

export function compute(input: BeamDeflectionInput): BeamDeflectionResult {
  const L = input.spanM;
  const EI = input.eiKNm2;
  let deflectionM = 0;
  let maxMoment = 0;

  if (input.loadCase === "udl") {
    const w = input.udlKNPerM ?? 0;
    deflectionM = (5 * w * Math.pow(L, 4)) / (384 * EI);
    maxMoment = (w * L * L) / 8;
  } else {
    const P = input.pointKN ?? 0;
    deflectionM = (P * Math.pow(L, 3)) / (48 * EI);
    maxMoment = (P * L) / 4;
  }

  const deflectionMm = deflectionM * 1000;
  const ratio = deflectionMm > 0 ? (L * 1000) / deflectionMm : Number.POSITIVE_INFINITY;
  return {
    deflectionMm,
    maxMomentKNm: maxMoment,
    spanOverDeflection: ratio,
    withinL360: ratio >= 360,
  };
}
