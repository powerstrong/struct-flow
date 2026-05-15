import type { Calculator } from "../registry";
import { inputSchema, type RebarWeightInput } from "./input";
import { compute, type RebarWeightResult } from "./compute";
import { toViewModel } from "./view";
import { meta } from "./meta";

export const rebarWeight: Calculator<RebarWeightInput, RebarWeightResult> = {
  id: "rebar-weight",
  version: "1.0.0",
  tier: "free",
  meta,
  inputSchema,
  compute,
  toViewModel,
};
