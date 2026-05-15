import type { ViewModel2D } from "@struct-flow/shared";
import { NOMINAL_DIAMETER_MM, type RebarWeightInput } from "./input";
import type { RebarWeightResult } from "./compute";

// Schematic cross-section: a single rebar circle (approx) + length annotation.
export function toViewModel(input: RebarWeightInput, result: RebarWeightResult): ViewModel2D {
  const d = NOMINAL_DIAMETER_MM[input.grade];
  const r = d / 2;
  // Circle approximated with 24-point polygon (ViewModel2D has no native circle shape).
  const N = 24;
  const center = { x: 0, y: 0 };
  const points = Array.from({ length: N }, (_, i) => {
    const angle = (i / N) * Math.PI * 2;
    return { x: center.x + r * Math.cos(angle), y: center.y + r * Math.sin(angle) };
  });

  const lengthMm = input.lengthM * 1000;
  return {
    units: "mm",
    shapes: [
      { kind: "polygon", points, stroke: "#374151", fill: "#fde68a" },
      {
        kind: "line",
        from: { x: r + 20, y: -r },
        to: { x: r + 20, y: r },
        stroke: "#374151",
      },
      {
        kind: "dimension",
        from: { x: r + 30, y: -r },
        to: { x: r + 30, y: r },
        offset: 0,
        label: `Ø${input.grade} (${d.toFixed(1)} mm)`,
      },
    ],
    bounds: { minX: -r - 20, minY: -r - 20, maxX: r + 200, maxY: r + 20 },
    annotations: [
      { text: `L = ${input.lengthM} m (${lengthMm} mm)`, anchor: { x: 0, y: r + 40 }, align: "center" },
      { text: `n = ${input.count} EA`, anchor: { x: 0, y: r + 60 }, align: "center" },
      {
        text: `W = ${result.totalWeightKg.toFixed(2)} kg`,
        anchor: { x: 0, y: r + 80 },
        align: "center",
      },
    ],
  };
}
