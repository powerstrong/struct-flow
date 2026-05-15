import type { Calculator } from "../registry";
import { inputSchema, type FootingBearingInput } from "./input";
import { compute, type FootingBearingResult } from "./compute";
import { toViewModel } from "./view";
import { meta } from "./meta";

export const footingBearing: Calculator<FootingBearingInput, FootingBearingResult> = {
  id: "footing-bearing",
  version: "1.0.0",
  tier: "pro",
  meta,
  inputSchema,
  compute,
  toViewModel,
};
