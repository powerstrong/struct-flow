import { z } from "zod";

export const REBAR_GRADES = ["D10", "D13", "D16", "D19", "D22", "D25", "D29"] as const;
export type RebarGrade = (typeof REBAR_GRADES)[number];

// Unit weights (kg/m) — KDS 14 20 50 reference.
export const UNIT_WEIGHT_KG_PER_M: Record<RebarGrade, number> = {
  D10: 0.560,
  D13: 0.995,
  D16: 1.560,
  D19: 2.250,
  D22: 3.040,
  D25: 3.980,
  D29: 5.040,
};

// Nominal diameter (mm).
export const NOMINAL_DIAMETER_MM: Record<RebarGrade, number> = {
  D10: 9.53,
  D13: 12.7,
  D16: 15.9,
  D19: 19.1,
  D22: 22.2,
  D25: 25.4,
  D29: 28.6,
};

export const inputSchema = z.object({
  grade: z.enum(REBAR_GRADES),
  lengthM: z.number().positive().max(20),
  count: z.number().int().positive().max(10_000),
});

export type RebarWeightInput = z.infer<typeof inputSchema>;
