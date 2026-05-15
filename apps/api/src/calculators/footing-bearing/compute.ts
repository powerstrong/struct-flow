// Rigid spread footing bearing pressure under axial + uniaxial moment.
//   e = M / P
//   If e <= L/6 (kern):  qmax/min = (P / A) × (1 ± 6e/L)
//   If e  > L/6:         qmax = 2P / (3 × width × (L/2 - e)),  qmin = 0 (tension lift-off)
// Pure function.

import type { FootingBearingInput } from "./input";

export interface FootingBearingResult {
  areaM2: number;
  eccentricityM: number;
  withinKern: boolean;
  qMaxKPa: number;
  qMinKPa: number;
  qAvgKPa: number;
  safetyRatio: number; // qAllow / qMax
  passes: boolean;
}

export function compute(input: FootingBearingInput): FootingBearingResult {
  const { lengthM: L, widthM: B, axialKN: P, momentKNm: M, qAllowKPa } = input;
  const A = L * B;
  const qAvg = P / A;
  if (P === 0) {
    // No axial load and no moment → trivially zero pressure (safe).
    // (P=0 with M>0 is rejected by inputSchema as a physically inconsistent free body.)
    return {
      areaM2: A,
      eccentricityM: 0,
      withinKern: true,
      qMaxKPa: 0,
      qMinKPa: 0,
      qAvgKPa: 0,
      safetyRatio: Number.POSITIVE_INFINITY,
      passes: true,
    };
  }
  const e = M / P;
  const kern = L / 6;
  let qMax: number;
  let qMin: number;
  let withinKern: boolean;
  if (e <= kern) {
    withinKern = true;
    qMax = qAvg * (1 + (6 * e) / L);
    qMin = qAvg * (1 - (6 * e) / L);
  } else {
    withinKern = false;
    const a = L / 2 - e;
    if (a <= 0) {
      // Resultant outside the footing — unstable.
      qMax = Number.POSITIVE_INFINITY;
      qMin = 0;
    } else {
      qMax = (2 * P) / (3 * B * a);
      qMin = 0;
    }
  }
  const safetyRatio = qMax > 0 ? qAllowKPa / qMax : Number.POSITIVE_INFINITY;
  return {
    areaM2: A,
    eccentricityM: e,
    withinKern,
    qMaxKPa: qMax,
    qMinKPa: qMin,
    qAvgKPa: qAvg,
    safetyRatio,
    passes: qMax <= qAllowKPa,
  };
}
