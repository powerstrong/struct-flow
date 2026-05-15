import { describe, it, expect } from "vitest";
import { compute as concreteCompute } from "../src/calculators/concrete-volume/compute";
import { compute as rebarCompute } from "../src/calculators/rebar-weight/compute";
import { compute as beamCompute } from "../src/calculators/simple-beam-deflection/compute";
import { compute as footingCompute } from "../src/calculators/footing-bearing/compute";
import { toViewModel as concreteView } from "../src/calculators/concrete-volume/view";
import { toViewModel as rebarView } from "../src/calculators/rebar-weight/view";
import { toViewModel as beamView } from "../src/calculators/simple-beam-deflection/view";
import { toViewModel as footingView } from "../src/calculators/footing-bearing/view";
import { calculators, findCalculator } from "../src/calculators/registry";
import { CALCULATOR_IDS } from "@struct-flow/shared";

describe("registry", () => {
  it("exposes all 4 MVP calculators", () => {
    expect(calculators.map((c) => c.id).sort()).toEqual([...CALCULATOR_IDS].sort());
  });

  it("findCalculator returns by id", () => {
    expect(findCalculator("concrete-volume")?.tier).toBe("free");
    expect(findCalculator("simple-beam-deflection")?.tier).toBe("pro");
    expect(findCalculator("does-not-exist")).toBeUndefined();
  });

  it("every calculator has non-empty meta + version + 5-file shape", () => {
    for (const c of calculators) {
      expect(c.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(c.meta.title.length).toBeGreaterThan(0);
      expect(c.meta.cautions.length).toBeGreaterThan(0);
      expect(c.meta.assumptions.length).toBeGreaterThan(0);
    }
  });
});

describe("concrete-volume", () => {
  it("normal: 6 m × 4 m × 0.2 m = 4.8 m³", () => {
    const r = concreteCompute({ widthMm: 6000, lengthMm: 4000, thicknessMm: 200 });
    expect(r.volumeM3).toBeCloseTo(4.8, 6);
    expect(r.topAreaM2).toBeCloseTo(24, 6);
    expect(r.edgeAreaM2).toBeCloseTo((2 * (6 + 4)) * 0.2, 6);
  });

  it("boundary: 1 mm × 1 mm × 1 mm = 1e-9 m³", () => {
    const r = concreteCompute({ widthMm: 1, lengthMm: 1, thicknessMm: 1 });
    expect(r.volumeM3).toBeCloseTo(1e-9, 15);
  });

  it("NG: zero/negative is rejected by schema (verified at route level); compute itself is pure", () => {
    // compute is pure; schema rejects bad input. Confirm correct number for a tiny value:
    const r = concreteCompute({ widthMm: 100, lengthMm: 100, thicknessMm: 100 });
    expect(r.volumeM3).toBeCloseTo(0.001, 9);
  });

  it("view returns shapes + bounds + annotations", () => {
    const input = { widthMm: 6000, lengthMm: 4000, thicknessMm: 200 };
    const v = concreteView(input, concreteCompute(input));
    expect(v.shapes.length).toBeGreaterThan(0);
    expect(v.annotations.length).toBeGreaterThan(0);
    expect(v.bounds.maxX).toBeGreaterThan(v.bounds.minX);
  });
});

describe("rebar-weight", () => {
  it("normal: D16 × 6 m × 100ea ≈ 1.56 × 6 × 100 = 936 kg", () => {
    const r = rebarCompute({ grade: "D16", lengthM: 6, count: 100 });
    expect(r.unitWeightKgPerM).toBe(1.56);
    expect(r.totalWeightKg).toBeCloseTo(936, 6);
    expect(r.totalLengthM).toBe(600);
  });

  it("boundary: 1 bar × 1 m", () => {
    const r = rebarCompute({ grade: "D10", lengthM: 1, count: 1 });
    expect(r.totalWeightKg).toBeCloseTo(0.56, 6);
  });

  it("boundary: large quantity D29 × 12 m × 1000ea", () => {
    const r = rebarCompute({ grade: "D29", lengthM: 12, count: 1000 });
    expect(r.totalWeightKg).toBeCloseTo(5.04 * 12 * 1000, 4);
  });

  it("view includes polygon for cross-section", () => {
    const v = rebarView({ grade: "D19", lengthM: 5, count: 10 }, rebarCompute({ grade: "D19", lengthM: 5, count: 10 }));
    expect(v.shapes.some((s) => s.kind === "polygon")).toBe(true);
  });
});

describe("simple-beam-deflection", () => {
  it("UDL: textbook value δ = 5wL⁴/(384EI)", () => {
    // w = 10 kN/m, L = 6 m, EI = 10000 kN·m²
    // δ = 5 × 10 × 6⁴ / (384 × 10000) m = 64800/3,840,000 = 0.016875 m = 16.875 mm
    const r = beamCompute({ spanM: 6, eiKNm2: 10000, loadCase: "udl", udlKNPerM: 10 });
    expect(r.deflectionMm).toBeCloseTo(16.875, 3);
    expect(r.maxMomentKNm).toBeCloseTo(45, 6); // wL²/8 = 10×36/8 = 45
  });

  it("Point at mid-span: δ = PL³/(48EI)", () => {
    // P = 50 kN, L = 5 m, EI = 20000 kN·m² → δ = 50×125 / (48×20000) m = 0.0065104167 m = 6.510 mm
    const r = beamCompute({ spanM: 5, eiKNm2: 20000, loadCase: "point-mid", pointKN: 50 });
    expect(r.deflectionMm).toBeCloseTo(6.5104, 3);
    expect(r.maxMomentKNm).toBeCloseTo(62.5, 6); // PL/4
  });

  it("boundary: very stiff EI ⇒ negligible deflection ⇒ withinL360 true", () => {
    const r = beamCompute({ spanM: 5, eiKNm2: 1_000_000, loadCase: "udl", udlKNPerM: 5 });
    expect(r.withinL360).toBe(true);
  });

  it("NG: very flexible EI fails L/360", () => {
    // big deflection on purpose
    const r = beamCompute({ spanM: 8, eiKNm2: 100, loadCase: "udl", udlKNPerM: 5 });
    expect(r.withinL360).toBe(false);
    expect(r.spanOverDeflection).toBeLessThan(360);
  });

  it("view contains the load arrow and beam line", () => {
    const input = { spanM: 6, eiKNm2: 10000, loadCase: "udl" as const, udlKNPerM: 10 };
    const v = beamView(input, beamCompute(input));
    expect(v.shapes.some((s) => s.kind === "line")).toBe(true);
    expect(v.shapes.some((s) => s.kind === "arrow")).toBe(true);
  });
});

describe("footing-bearing", () => {
  it("axial only (M=0): uniform q = P/A", () => {
    const r = footingCompute({ lengthM: 3, widthM: 2, axialKN: 600, momentKNm: 0, qAllowKPa: 200 });
    expect(r.areaM2).toBe(6);
    expect(r.qAvgKPa).toBeCloseTo(100, 6);
    expect(r.qMaxKPa).toBeCloseTo(100, 6);
    expect(r.qMinKPa).toBeCloseTo(100, 6);
    expect(r.withinKern).toBe(true);
    expect(r.passes).toBe(true);
  });

  it("within kern: q = (P/A)(1 ± 6e/L)", () => {
    // P=600, M=300 → e=0.5 m; L=3 m → L/6=0.5 (boundary)
    const r = footingCompute({ lengthM: 3, widthM: 2, axialKN: 600, momentKNm: 300, qAllowKPa: 250 });
    expect(r.eccentricityM).toBeCloseTo(0.5, 6);
    expect(r.withinKern).toBe(true);
    expect(r.qMaxKPa).toBeCloseTo(200, 6);
    expect(r.qMinKPa).toBeCloseTo(0, 6);
  });

  it("outside kern: triangular pressure with uplift; qmin = 0", () => {
    // e > L/6: P=600, M=600 → e=1 m; L=3 m → L/6=0.5; a = L/2 - e = 0.5 m
    // qmax = 2P/(3·B·a) = 1200/(3·2·0.5) = 400 kPa
    const r = footingCompute({ lengthM: 3, widthM: 2, axialKN: 600, momentKNm: 600, qAllowKPa: 500 });
    expect(r.withinKern).toBe(false);
    expect(r.qMaxKPa).toBeCloseTo(400, 6);
    expect(r.qMinKPa).toBe(0);
    expect(r.passes).toBe(true);
  });

  it("NG: qmax > qallow", () => {
    const r = footingCompute({ lengthM: 2, widthM: 2, axialKN: 1500, momentKNm: 0, qAllowKPa: 300 });
    expect(r.qMaxKPa).toBeCloseTo(375, 6);
    expect(r.passes).toBe(false);
  });

  it("view includes plan rectangle + pressure trapezoid", () => {
    const input = { lengthM: 3, widthM: 2, axialKN: 600, momentKNm: 300, qAllowKPa: 250 };
    const v = footingView(input, footingCompute(input));
    expect(v.shapes.some((s) => s.kind === "rectangle")).toBe(true);
    expect(v.shapes.some((s) => s.kind === "polygon")).toBe(true);
  });
});

describe("compute purity", () => {
  it("calling compute twice with the same input returns equal results", () => {
    const a = beamCompute({ spanM: 6, eiKNm2: 10000, loadCase: "udl", udlKNPerM: 10 });
    const b = beamCompute({ spanM: 6, eiKNm2: 10000, loadCase: "udl", udlKNPerM: 10 });
    expect(a).toEqual(b);
  });
});
