// Slab/wall concrete volume — width × length × thickness.
// Pure function. No env, no IO.

import type { ConcreteVolumeInput } from "./input";

export interface ConcreteVolumeResult {
  volumeM3: number;
  topAreaM2: number;
  /** Edge surface area (perimeter × thickness), m². Useful for formwork estimate. */
  edgeAreaM2: number;
}

const MM3_PER_M3 = 1_000_000_000;
const MM2_PER_M2 = 1_000_000;

export function compute(input: ConcreteVolumeInput): ConcreteVolumeResult {
  const { widthMm, lengthMm, thicknessMm } = input;
  const volumeMm3 = widthMm * lengthMm * thicknessMm;
  const topAreaMm2 = widthMm * lengthMm;
  const perimeterMm = 2 * (widthMm + lengthMm);
  const edgeAreaMm2 = perimeterMm * thicknessMm;
  return {
    volumeM3: volumeMm3 / MM3_PER_M3,
    topAreaM2: topAreaMm2 / MM2_PER_M2,
    edgeAreaM2: edgeAreaMm2 / MM2_PER_M2,
  };
}
