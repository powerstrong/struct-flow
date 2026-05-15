import type { CalculatorId } from "@struct-flow/shared";
import type { ComponentType } from "react";
import { concreteVolumeFeature } from "./concrete-volume";
import { rebarWeightFeature } from "./rebar-weight";
import { simpleBeamDeflectionFeature } from "./simple-beam-deflection";
import { footingBearingFeature } from "./footing-bearing";

export interface InputFormProps<I> {
  initial?: Partial<I>;
  onSubmit: (input: I) => void;
  submitting?: boolean;
}

export interface ResultPanelProps<R> {
  result: R;
}

export interface CalculatorFeature<I = unknown, R = unknown> {
  id: CalculatorId;
  title: string;
  defaultInput: I;
  InputForm: ComponentType<InputFormProps<I>>;
  ResultPanel: ComponentType<ResultPanelProps<R>>;
}

export const features: Record<CalculatorId, CalculatorFeature> = {
  "concrete-volume": concreteVolumeFeature as CalculatorFeature,
  "rebar-weight": rebarWeightFeature as CalculatorFeature,
  "simple-beam-deflection": simpleBeamDeflectionFeature as CalculatorFeature,
  "footing-bearing": footingBearingFeature as CalculatorFeature,
};
