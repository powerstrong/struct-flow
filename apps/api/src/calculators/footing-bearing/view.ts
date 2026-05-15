import type { ViewModel2D } from "@struct-flow/shared";
import type { FootingBearingInput } from "./input";
import type { FootingBearingResult } from "./compute";

export function toViewModel(input: FootingBearingInput, result: FootingBearingResult): ViewModel2D {
  const Lmm = input.lengthM * 1000;
  const Bmm = input.widthM * 1000;

  // Plan + pressure profile underneath.
  const plan = {
    kind: "rectangle" as const,
    x: 0,
    y: 0,
    width: Lmm,
    height: Bmm,
    stroke: "#1f2937",
    fill: "#dbeafe",
  };

  // Pressure diagram below the plan (height proportional to qMax).
  const qMax = Number.isFinite(result.qMaxKPa) ? result.qMaxKPa : input.qAllowKPa * 2;
  const qMin = result.qMinKPa;
  const qScale = qMax > 0 ? 400 / qMax : 0;
  const pressureY = Bmm + 100;
  const pressureHeightMax = qMax * qScale;
  const pressureHeightMin = qMin * qScale;

  // Trapezoid (or triangle when uplift) on the bottom.
  const trapezoid = {
    kind: "polygon" as const,
    points: [
      { x: 0, y: pressureY },
      { x: Lmm, y: pressureY },
      { x: Lmm, y: pressureY + pressureHeightMax },
      { x: 0, y: pressureY + pressureHeightMin },
    ],
    stroke: "#b91c1c",
    fill: "#fecaca",
  };

  return {
    units: "mm",
    shapes: [
      plan,
      {
        kind: "dimension",
        from: { x: 0, y: 0 },
        to: { x: Lmm, y: 0 },
        offset: -60,
        label: `L = ${input.lengthM} m`,
      },
      {
        kind: "dimension",
        from: { x: 0, y: 0 },
        to: { x: 0, y: Bmm },
        offset: -60,
        label: `B = ${input.widthM} m`,
      },
      trapezoid,
    ],
    bounds: {
      minX: -120,
      minY: -120,
      maxX: Lmm + 120,
      maxY: pressureY + pressureHeightMax + 60,
    },
    annotations: [
      {
        text: `qmax = ${result.qMaxKPa.toFixed(1)} kPa`,
        anchor: { x: Lmm, y: pressureY + pressureHeightMax + 40 },
        align: "right",
      },
      {
        text: `qmin = ${result.qMinKPa.toFixed(1)} kPa`,
        anchor: { x: 0, y: pressureY + pressureHeightMin + 40 },
        align: "left",
      },
      {
        text: `e = ${result.eccentricityM.toFixed(3)} m  ${result.withinKern ? "(kern 내)" : "(kern 외 — uplift)"}`,
        anchor: { x: Lmm / 2, y: pressureY - 40 },
        align: "center",
      },
      {
        text: result.passes
          ? `OK: qmax ≤ qallow (안전율 ${result.safetyRatio.toFixed(2)})`
          : `NG: qmax > qallow (${input.qAllowKPa.toFixed(1)} kPa)`,
        anchor: { x: Lmm / 2, y: pressureY + pressureHeightMax + 80 },
        align: "center",
      },
    ],
  };
}
