import type { ViewModel2D } from "@struct-flow/shared";
import type { ConcreteVolumeInput } from "./input";
import type { ConcreteVolumeResult } from "./compute";

export function toViewModel(input: ConcreteVolumeInput, result: ConcreteVolumeResult): ViewModel2D {
  const w = input.widthMm;
  const l = input.lengthMm;
  return {
    units: "mm",
    shapes: [
      { kind: "rectangle", x: 0, y: 0, width: w, height: l, stroke: "#1f2937", fill: "#e0e7ff" },
      { kind: "dimension", from: { x: 0, y: 0 }, to: { x: w, y: 0 }, offset: -80, label: `${w} mm` },
      { kind: "dimension", from: { x: 0, y: 0 }, to: { x: 0, y: l }, offset: -80, label: `${l} mm` },
    ],
    bounds: { minX: -100, minY: -100, maxX: w + 100, maxY: l + 100 },
    annotations: [
      { text: `t = ${input.thicknessMm} mm`, anchor: { x: w / 2, y: l / 2 }, align: "center" },
      { text: `V = ${result.volumeM3.toFixed(3)} m³`, anchor: { x: w / 2, y: l + 40 }, align: "center" },
    ],
  };
}
