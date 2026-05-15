import type { ViewModel2D, Point2D } from "@struct-flow/shared";
import type { BeamDeflectionInput } from "./input";
import type { BeamDeflectionResult } from "./compute";

// Schematic: horizontal beam line + two triangle supports + load arrows + dashed deflected curve.
export function toViewModel(input: BeamDeflectionInput, result: BeamDeflectionResult): ViewModel2D {
  const Lmm = input.spanM * 1000;
  // Amplify deflection 20x for visual clarity.
  const deflectionAmplified = Math.min(result.deflectionMm * 20, Lmm / 8);

  const beam: Point2D[] = [
    { x: 0, y: 0 },
    { x: Lmm, y: 0 },
  ];

  // Sample 9 points on a parabolic-ish deflected curve.
  const curve: Point2D[] = [];
  const N = 20;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * Lmm;
    // For UDL: δ(x) ≈ deflMax × 16t²(1-t)² (max at t=0.5). For point-mid: ≈ deflMax × (3t - 4t³) for t≤0.5 mirrored.
    let factor: number;
    if (input.loadCase === "udl") {
      factor = 16 * t * t * (1 - t) * (1 - t);
    } else {
      const u = t <= 0.5 ? t : 1 - t;
      factor = (3 * u - 4 * u * u * u) * 2; // mid-span peak ≈ 1 when u = 0.5
    }
    curve.push({ x, y: factor * deflectionAmplified });
  }

  const loadLabel =
    input.loadCase === "udl"
      ? `w = ${input.udlKNPerM ?? 0} kN/m`
      : `P = ${input.pointKN ?? 0} kN @ mid`;

  return {
    units: "mm",
    shapes: [
      { kind: "line", from: beam[0]!, to: beam[1]!, stroke: "#1f2937" },
      // left support triangle
      {
        kind: "polygon",
        points: [
          { x: -60, y: 80 },
          { x: 60, y: 80 },
          { x: 0, y: 0 },
        ],
        stroke: "#1f2937",
        fill: "#f3f4f6",
      },
      // right support triangle
      {
        kind: "polygon",
        points: [
          { x: Lmm - 60, y: 80 },
          { x: Lmm + 60, y: 80 },
          { x: Lmm, y: 0 },
        ],
        stroke: "#1f2937",
        fill: "#f3f4f6",
      },
      // Load arrow (UDL → 5 arrows; point-mid → 1 centered arrow)
      ...(input.loadCase === "udl"
        ? Array.from({ length: 5 }, (_, i) => {
            const x = ((i + 1) / 6) * Lmm;
            return { kind: "arrow" as const, from: { x, y: -120 }, to: { x, y: -10 }, stroke: "#dc2626" };
          })
        : [{ kind: "arrow" as const, from: { x: Lmm / 2, y: -160 }, to: { x: Lmm / 2, y: -10 }, stroke: "#dc2626" }]),
      // Deflected curve (dashed)
      ...curve.slice(0, -1).map((from, i) => ({
        kind: "line" as const,
        from,
        to: curve[i + 1]!,
        stroke: "#2563eb",
        strokeDasharray: "8 4",
      })),
      {
        kind: "dimension",
        from: { x: 0, y: 160 },
        to: { x: Lmm, y: 160 },
        offset: 0,
        label: `L = ${input.spanM} m`,
      },
    ],
    bounds: { minX: -200, minY: -200, maxX: Lmm + 200, maxY: 240 },
    annotations: [
      { text: loadLabel, anchor: { x: Lmm / 2, y: -180 }, align: "center" },
      {
        text: `δ = ${result.deflectionMm.toFixed(2)} mm  (L/${Math.round(result.spanOverDeflection)})`,
        anchor: { x: Lmm / 2, y: 220 },
        align: "center",
      },
    ],
  };
}
