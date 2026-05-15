import { z } from "zod";

export const LOAD_CASES = ["udl", "point-mid"] as const;
export type LoadCase = (typeof LOAD_CASES)[number];

export const inputSchema = z
  .object({
    spanM: z.number().positive().max(50),
    /** EI in kN·m² (flexural rigidity). */
    eiKNm2: z.number().positive().max(1_000_000),
    loadCase: z.enum(LOAD_CASES),
    /** Uniformly distributed load (kN/m). Required when loadCase = 'udl'. */
    udlKNPerM: z.number().nonnegative().max(1_000).optional(),
    /** Point load at mid-span (kN). Required when loadCase = 'point-mid'. */
    pointKN: z.number().nonnegative().max(10_000).optional(),
  })
  .refine(
    (v) =>
      (v.loadCase === "udl" && typeof v.udlKNPerM === "number") ||
      (v.loadCase === "point-mid" && typeof v.pointKN === "number"),
    { message: "선택한 하중 케이스에 맞는 하중 값이 필요합니다." },
  );

export type BeamDeflectionInput = z.infer<typeof inputSchema>;
