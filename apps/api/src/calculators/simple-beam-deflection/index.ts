import type { Calculator } from "../registry";
import { inputSchema, type BeamDeflectionInput } from "./input";
import { compute, type BeamDeflectionResult } from "./compute";
import { toViewModel } from "./view";
import { meta } from "./meta";

export const simpleBeamDeflection: Calculator<BeamDeflectionInput, BeamDeflectionResult> = {
  id: "simple-beam-deflection",
  version: "1.0.0",
  tier: "pro",
  meta,
  inputSchema,
  compute,
  toViewModel,
};
