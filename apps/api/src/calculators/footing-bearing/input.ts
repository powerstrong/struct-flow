import { z } from "zod";

export const inputSchema = z
  .object({
    /** Footing dimension along the moment axis (m). */
    lengthM: z.number().positive().max(20),
    /** Footing dimension perpendicular to the moment axis (m). */
    widthM: z.number().positive().max(20),
    /** Vertical axial load (kN). Service load. */
    axialKN: z.number().nonnegative().max(100_000),
    /** Moment about the centroid (kN·m). May be 0. */
    momentKNm: z.number().nonnegative().max(100_000).default(0),
    /** Allowable bearing pressure (kPa). For comparison. */
    qAllowKPa: z.number().positive().max(10_000),
  })
  .refine((v) => !(v.axialKN === 0 && v.momentKNm > 0), {
    message: "축력이 0인데 모멘트가 양수인 경우는 정역학적으로 불안정합니다 (자유물체).",
    path: ["axialKN"],
  });

export type FootingBearingInput = z.infer<typeof inputSchema>;
