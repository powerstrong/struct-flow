import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SvgViewer } from "../src/components/viewer/SvgViewer";
import type { ViewModel2D } from "@struct-flow/shared";

const sample: ViewModel2D = {
  units: "mm",
  shapes: [
    { kind: "rectangle", x: 0, y: 0, width: 100, height: 60 },
    { kind: "line", from: { x: 0, y: 0 }, to: { x: 100, y: 60 } },
    {
      kind: "polygon",
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ],
    },
    { kind: "arrow", from: { x: 0, y: -30 }, to: { x: 0, y: 0 } },
    { kind: "dimension", from: { x: 0, y: 60 }, to: { x: 100, y: 60 }, offset: 20, label: "100 mm" },
  ],
  bounds: { minX: -10, minY: -40, maxX: 110, maxY: 80 },
  annotations: [{ text: "label", anchor: { x: 50, y: -20 }, align: "center" }],
};

describe("SvgViewer", () => {
  it("renders an SVG with the expected number of basic nodes", () => {
    const { container } = render(<SvgViewer viewModel={sample} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(container.querySelectorAll("rect").length).toBe(1);
    // arrow + polygon + dimension lines all push polygon/line counts up;
    // we only assert the explicit shape elements exist.
    expect(container.querySelectorAll("polygon").length).toBeGreaterThanOrEqual(2); // 1 polygon shape + 1 arrowhead
    expect(container.querySelectorAll("text").length).toBeGreaterThanOrEqual(2); // dimension label + annotation
  });

  it("sets viewBox from bounds + padding", () => {
    const { container } = render(<SvgViewer viewModel={sample} padding={10} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("-20 -50 140 140");
  });
});
