import { z } from "zod";

export const inputSchema = z.object({
  widthMm: z.number().positive().max(50_000),
  lengthMm: z.number().positive().max(50_000),
  thicknessMm: z.number().positive().max(5_000),
});

export type ConcreteVolumeInput = z.infer<typeof inputSchema>;
