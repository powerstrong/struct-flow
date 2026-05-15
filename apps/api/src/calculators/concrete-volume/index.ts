import type { Calculator } from "../registry";
import { inputSchema, type ConcreteVolumeInput } from "./input";
import { compute, type ConcreteVolumeResult } from "./compute";
import { toViewModel } from "./view";
import { meta } from "./meta";

export const concreteVolume: Calculator<ConcreteVolumeInput, ConcreteVolumeResult> = {
  id: "concrete-volume",
  version: "1.0.0",
  tier: "free",
  meta,
  inputSchema,
  compute,
  toViewModel,
};
